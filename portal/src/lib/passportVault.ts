import type { JWK } from "jose";
import { t, getLang } from "./i18n";

const VAULT_KEY = "chv_passport_vault_v1";
const SESSION_KEY = "chv_passport_session_v1";

export type PassportRecord = {
  credential: string;
  holderPrivateJwk: JWK;
  holderDid?: string;
  nfs?: string;
  audience?: string;
};

type TgBio = {
  init: (cb?: () => void) => void;
  isInited?: boolean;
  isBiometricAvailable?: boolean;
  isAccessGranted?: boolean;
  requestAccess: (opts: { reason: string }, cb: (ok: boolean) => void) => void;
  authenticate: (opts: { reason: string }, cb: (ok: boolean, token?: string) => void) => void;
};

function webApp() {
  return (window as unknown as { Telegram?: { WebApp?: { BiometricManager?: TgBio } } }).Telegram
    ?.WebApp;
}

function getBio(): TgBio | null {
  try {
    // Live read each call — BiometricManager may appear after Telegram injects the script.
    return webApp()?.BiometricManager || null;
  } catch {
    return null;
  }
}

/** Sync peek — often false until `initBiometric()` finishes. Prefer the async probe in UI. */
export function biometricAvailable(): boolean {
  try {
    const bio = getBio();
    return !!bio?.isBiometricAvailable;
  } catch {
    return false;
  }
}

/** Telegram BiometricManager callbacks often never fire (esp. without a fresh tap). */
function withTimeout<T>(p: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    let done = false;
    const t = window.setTimeout(() => {
      if (done) return;
      done = true;
      resolve(fallback);
    }, ms);
    p.then(
      (v) => {
        if (done) return;
        done = true;
        window.clearTimeout(t);
        resolve(v);
      },
      () => {
        if (done) return;
        done = true;
        window.clearTimeout(t);
        resolve(fallback);
      },
    );
  });
}

const BIO_INIT_MS = 2_500;
const BIO_CB_MS = 12_000;

/** Single in-flight / completed init — Telegram sets isBiometricAvailable only after init(). */
let bioInitPromise: Promise<boolean> | null = null;

/**
 * @param opts.requestAccess — default false for status probes (needs a tap).
 *   Unlock / issue pass true so Face ID can request permission.
 */
export async function initBiometric(opts?: { requestAccess?: boolean }): Promise<boolean> {
  try {
    const bio = getBio();
    if (!bio) return false;

    if (bio.isInited) {
      bioInitPromise = bioInitPromise ?? Promise.resolve(true);
    } else if (!bioInitPromise) {
      const initP = withTimeout(
        new Promise<void>((r) => {
          try {
            bio.init(() => r());
          } catch {
            r();
          }
        }),
        BIO_INIT_MS,
        undefined,
      );
      bioInitPromise = initP.then(() => {
        if (!bio.isInited) bioInitPromise = null;
        return true;
      });
    }
    await bioInitPromise;

    if (!bio.isBiometricAvailable) return false;
    if (opts?.requestAccess && !bio.isAccessGranted) {
      const ok = await withTimeout(
        new Promise<boolean>((r) => {
          try {
            bio.requestAccess({ reason: t(getLang(), "unlockReasonUnlock") }, (granted) => r(!!granted));
          } catch {
            r(false);
          }
        }),
        BIO_CB_MS,
        false,
      );
      if (!ok) return false;
    }
    return true;
  } catch {
    bioInitPromise = null;
    return false;
  }
}

/** Probe with one retry — Telegram often flips isBiometricAvailable only after a late init(). */
export async function probeBiometricAvailable(): Promise<boolean> {
  let ok = await initBiometric({ requestAccess: false });
  if (!ok && !biometricAvailable()) {
    await new Promise((r) => setTimeout(r, 400));
    ok = await initBiometric({ requestAccess: false });
  }
  return ok || biometricAvailable();
}

export async function authenticateBiometric(reason: string): Promise<boolean> {
  const ready = await initBiometric({ requestAccess: true });
  if (!ready && !biometricAvailable()) throw new Error("biometric_unavailable");
  const bio = getBio();
  if (!bio?.isBiometricAvailable) throw new Error("biometric_unavailable");
  if (!bio.isAccessGranted) {
    const granted = await withTimeout(
      new Promise<boolean>((r) => {
        try {
          bio.requestAccess({ reason }, (ok) => r(!!ok));
        } catch {
          r(false);
        }
      }),
      BIO_CB_MS,
      false,
    );
    if (!granted) throw new Error("biometric_timeout");
  }
  const auth = await withTimeout(
    new Promise<{ ok: boolean }>((r) => {
      try {
        bio.authenticate({ reason }, (ok) => r({ ok: !!ok }));
      } catch {
        r({ ok: false });
      }
    }),
    BIO_CB_MS,
    { ok: false },
  );
  if (!auth.ok) throw new Error("biometric denied");
  return true;
}

export function hasLocalVault(): boolean {
  try {
    return !!localStorage.getItem(VAULT_KEY);
  } catch {
    return false;
  }
}

export function savePassportVault(rec: PassportRecord) {
  localStorage.setItem(VAULT_KEY, JSON.stringify(rec));
  openPassportSession(rec);
}

export function loadPassportVault(): PassportRecord | null {
  try {
    const raw = localStorage.getItem(VAULT_KEY);
    if (!raw) return null;
    const rec = JSON.parse(raw) as PassportRecord;
    if (!rec?.credential || !rec?.holderPrivateJwk) return null;
    return rec;
  } catch {
    return null;
  }
}

export function openPassportSession(rec: PassportRecord) {
  sessionStorage.setItem(
    SESSION_KEY,
    JSON.stringify({ record: rec, unlockedAt: Date.now() }),
  );
}

export function getSession(): PassportRecord | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as { record?: PassportRecord };
    return s.record || null;
  } catch {
    return null;
  }
}

export function lockSession() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function clearPassport() {
  lockSession();
  try {
    localStorage.removeItem(VAULT_KEY);
  } catch {
    /* ignore */
  }
}

/** Unlock local vault; Face ID in Telegram Mini App when available. */
export async function unlockPassport(reason?: string): Promise<PassportRecord> {
  const rec = loadPassportVault();
  if (!rec) throw new Error("no_vault");
  // Must init first — sync isBiometricAvailable is false until BiometricManager.init().
  if (await probeBiometricAvailable()) {
    await authenticateBiometric(reason || t(getLang(), "unlockReasonUnlock"));
  }
  openPassportSession(rec);
  return rec;
}

/**
 * Open vault for API calls without Face ID.
 * Used on Mini App boot so citizens land on votings immediately (TG bio hangs without a tap).
 */
export function unlockPassportSilent(): PassportRecord | null {
  const rec = loadPassportVault();
  if (!rec) return null;
  openPassportSession(rec);
  return rec;
}
