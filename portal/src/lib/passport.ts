import * as jose from "jose";
import { civicBase } from "./config";
import {
  authenticateBiometric,
  biometricAvailable,
  clearPassport,
  getSession,
  hasLocalVault,
  loadPassportVault,
  openPassportSession,
  savePassportVault,
  unlockPassport,
  type PassportRecord,
} from "./passportVault";

const AUDIENCE = "blc-civic-verifier";

function verifierBase() {
  return civicBase().replace(/\/$/, "");
}

async function sha256Bytes(data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", data));
}

function b64(u8: Uint8Array): string {
  let s = "";
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s);
}

function fromB64(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function deriveKey(secret: string, saltB64: string): Promise<CryptoKey> {
  const salt = fromB64(saltB64);
  const base = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 120_000, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function decryptPassportRecord(
  ciphertext: string,
  salt: string,
  secret: string,
): Promise<PassportRecord> {
  const key = await deriveKey(secret, salt);
  const packed = fromB64(ciphertext);
  const iv = packed.slice(0, 12);
  const ct = packed.slice(12);
  const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
  const rec = JSON.parse(new TextDecoder().decode(plain)) as PassportRecord;
  if (!rec?.credential || !rec?.holderPrivateJwk) throw new Error("bad_vault");
  return rec;
}

export async function encryptPassportRecord(rec: PassportRecord, secret: string) {
  const salt = b64(crypto.getRandomValues(new Uint8Array(16)));
  const key = await deriveKey(secret, salt);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = new TextEncoder().encode(JSON.stringify(rec));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, plain));
  const packed = new Uint8Array(iv.length + ct.length);
  packed.set(iv, 0);
  packed.set(ct, iv.length);
  return { ciphertext: b64(packed), salt, wrapAlg: "pbkdf2-aes-gcm-v1" };
}

export async function createHolderKeyPair() {
  const { privateKey, publicKey } = await jose.generateKeyPair("ES256", { extractable: true });
  return {
    privateJwk: (await jose.exportJWK(privateKey)) as jose.JWK,
    publicJwk: (await jose.exportJWK(publicKey)) as jose.JWK,
  };
}

export async function createPresentation(
  rec: PassportRecord,
  opts: { nonce?: string; voting?: string } = {},
): Promise<string> {
  const holderPrivateKey = await jose.importJWK(rec.holderPrivateJwk, "ES256");
  const now = Math.floor(Date.now() / 1000);
  const payload: Record<string, unknown> = {
    nonce: opts.nonce || `n-${Date.now()}`,
    iat: now,
  };
  if (opts.voting) payload.voting = opts.voting;
  const kb = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "ES256", typ: "kb+jwt" })
    .setAudience(rec.audience || AUDIENCE)
    .setIssuedAt(now)
    .sign(holderPrivateKey);
  return `${rec.credential}~${kb}`;
}

export async function restoreFromPhrase(phrase: string): Promise<PassportRecord> {
  const normalized = phrase.trim().toLowerCase().replace(/\s+/g, " ");
  const r = await fetch(`${verifierBase()}/v1/passport/restore`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phrase: normalized }),
  });
  const j = (await r.json()) as {
    ok?: boolean;
    ciphertext?: string;
    salt?: string;
    code?: string;
    error?: string;
  };
  if (!j.ok || !j.ciphertext || !j.salt) throw new Error(j.code || j.error || "restore failed");
  const rec = await decryptPassportRecord(j.ciphertext, j.salt, normalized);
  savePassportVault(rec);
  if (biometricAvailable()) {
    try {
      await authenticateBiometric("Привязать Face ID к кабинету");
    } catch {
      /* phrase restore still ok without bio */
    }
  }
  return rec;
}

export async function issuePassport(): Promise<PassportRecord & { restorePhrase?: string }> {
  if (biometricAvailable()) {
    await authenticateBiometric("Выдать паспорт");
  }
  const keys = await createHolderKeyPair();
  const r = await fetch(`${verifierBase()}/v1/passport/issue`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ holderPublicJwk: keys.publicJwk, deviceBind: null }),
  });
  const j = (await r.json()) as {
    ok?: boolean;
    credential?: string;
    holderDid?: string;
    nfs?: string;
    audience?: string;
    error?: string;
  };
  if (!r.ok || !j.ok || !j.credential) throw new Error(j.error || "passport issue failed");
  const rec: PassportRecord = {
    credential: j.credential,
    holderPrivateJwk: keys.privateJwk,
    holderDid: j.holderDid,
    nfs: j.nfs,
    audience: j.audience || AUDIENCE,
  };
  savePassportVault(rec);
  let restorePhrase: string | undefined;
  try {
    const presentation = await createPresentation(rec);
    const provisional = await encryptPassportRecord(rec, "provisional");
    const alloc = await fetch(`${verifierBase()}/v1/passport/backup`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        presentation,
        ciphertext: provisional.ciphertext,
        salt: provisional.salt,
        wrapAlg: provisional.wrapAlg,
      }),
    });
    const a = (await alloc.json()) as { ok?: boolean; phrase?: string };
    if (a.ok && a.phrase) {
      const real = await encryptPassportRecord(rec, a.phrase);
      await fetch(`${verifierBase()}/v1/passport/backup`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          presentation,
          phrase: a.phrase,
          ciphertext: real.ciphertext,
          salt: real.salt,
          wrapAlg: real.wrapAlg,
        }),
      });
      restorePhrase = a.phrase;
    }
  } catch {
    /* backup best-effort */
  }
  return { ...rec, restorePhrase };
}

export async function ensurePresentation(opts: {
  voting?: string;
  reason?: string;
} = {}): Promise<string> {
  let rec = getSession() || loadPassportVault();
  if (!rec) throw new Error("no_passport");
  if (!getSession()) {
    if (biometricAvailable()) {
      await authenticateBiometric(opts.reason || "Подтвердите паспорт");
    }
    openPassportSession(rec);
  } else if (biometricAvailable() && opts.reason) {
    await authenticateBiometric(opts.reason);
  }
  return createPresentation(rec, { voting: opts.voting });
}

export { hasLocalVault, getSession, unlockPassport, loadPassportVault, clearPassport, biometricAvailable };
