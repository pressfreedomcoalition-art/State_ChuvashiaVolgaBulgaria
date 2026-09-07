/**
 * Wallet backup bind/restore.
 * Prefer ~0.01 TON memo proof (DAO path) — signData freezes many wallets (MyWallet ANR).
 */
import { beginCell, toNano } from "@ton/core";
import { civicBase } from "./config";
import { decryptPassportRecord, encryptPassportRecord } from "./passport";
import {
  openPassportSession,
  savePassportVault,
  type PassportRecord,
} from "./passportVault";

function verifierBase() {
  return civicBase().replace(/\/$/, "");
}

async function sha256Bytes(data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", data as BufferSource));
}

function b64(u8: Uint8Array): string {
  let s = "";
  for (const b of u8) s += String.fromCharCode(b);
  return btoa(s);
}

export async function restoreFromCipherBlob(
  blob: { ciphertext: string; salt: string },
  secret: string,
): Promise<PassportRecord> {
  const rec = await decryptPassportRecord(blob.ciphertext, blob.salt, secret);
  savePassportVault(rec);
  openPassportSession(rec);
  return rec;
}

export async function walletBackupSecret(wallet: string, nfs: string): Promise<string> {
  const h = await sha256Bytes(new TextEncoder().encode(`blc-wallet-backup|${wallet}|${nfs}`));
  return b64(h);
}

export type PassportBackupStatus = {
  hasPhraseBackup: boolean;
  hasWalletBackup: boolean;
  walletBound: string | null;
};

export async function fetchPassportBackupStatus(presentation: string): Promise<PassportBackupStatus> {
  const r = await fetch(`${verifierBase()}/v1/passport/backup/status`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ presentation }),
  });
  const j = (await r.json()) as {
    ok?: boolean;
    hasPhraseBackup?: boolean;
    hasWalletBackup?: boolean;
    walletBound?: string | null;
  };
  if (!j.ok) return { hasPhraseBackup: false, hasWalletBackup: false, walletBound: null };
  return {
    hasPhraseBackup: !!j.hasPhraseBackup,
    hasWalletBackup: !!j.hasWalletBackup,
    walletBound: j.walletBound ? String(j.walletBound) : null,
  };
}

export type TonConnectSignLike = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signData?: (payload: { type: "text"; text: string; network?: string; from?: string }) => Promise<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sendTransaction?: (tx: {
    validUntil: number;
    messages: Array<{ address: string; amount: string; payload?: string }>;
  }) => Promise<any>;
  wallet?: {
    account?: {
      address?: string;
      walletStateInit?: string;
      publicKey?: string;
    };
  } | null;
  openModal?: () => void;
};

async function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  let t: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      p,
      new Promise<T>((_, rej) => {
        t = setTimeout(() => rej(new Error("timeout")), ms);
      }),
    ]);
  } finally {
    if (t) clearTimeout(t);
  }
}

function memoPayloadBoc(memo: string): string {
  return beginCell().storeUint(0, 32).storeStringTail(memo).endCell().toBoc().toString("base64");
}

function proofAmountNano(minProofTon: number | undefined): string {
  const ton = Math.max(0.01, Number(minProofTon || 0.01));
  return toNano(ton.toFixed(9)).toString();
}

async function sendMemoProof(
  tonConnectUI: TonConnectSignLike,
  opts: { fundAddress: string; memo: string; minProofTon?: number },
): Promise<void> {
  if (!tonConnectUI.sendTransaction) throw new Error("sendTransaction unavailable");
  await withTimeout(
    tonConnectUI.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 600,
      messages: [
        {
          address: opts.fundAddress,
          amount: proofAmountNano(opts.minProofTon),
          payload: memoPayloadBoc(opts.memo),
        },
      ],
    }),
    120_000,
  );
}

async function pollWalletRestoreMemo(challengeId: string): Promise<{
  ciphertext: string;
  salt: string;
  nfs: string;
  wallet?: string;
}> {
  let lastErr = "tx_not_found";
  for (let i = 0; i < 8; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 4000));
    const r = await fetch(`${verifierBase()}/v1/passport/restore/wallet`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ challengeId, proof: "memo" }),
    });
    const j = (await r.json()) as {
      ok?: boolean;
      ciphertext?: string;
      salt?: string;
      nfs?: string;
      wallet?: string;
      code?: string;
      error?: string;
    };
    if (j.ok && j.ciphertext) {
      return {
        ciphertext: String(j.ciphertext),
        salt: String(j.salt || ""),
        nfs: String(j.nfs || ""),
        wallet: j.wallet ? String(j.wallet) : undefined,
      };
    }
    lastErr = j.code || j.error || lastErr;
    if (j.code && j.code !== "tx_not_found" && j.code !== "payment_not_found") {
      throw new Error(j.code || j.error || "wallet restore failed");
    }
  }
  throw new Error(lastErr);
}

/** Bind encrypted passport vault to connected wallet (memo transfer). */
export async function bindWalletBackup(
  presentation: string,
  rec: PassportRecord,
  tonConnectUI: TonConnectSignLike,
): Promise<{ wallet: string }> {
  const account = tonConnectUI.wallet?.account;
  if (!account?.address) {
    tonConnectUI.openModal?.();
    throw new Error("connect_wallet");
  }
  const chalRes = await fetch(`${verifierBase()}/v1/passport/backup/wallet/challenge`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      purpose: "bind",
      wallet: account.address,
      presentation,
    }),
  });
  const chal = (await chalRes.json()) as {
    ok?: boolean;
    challengeId?: string;
    text?: string;
    wallet?: string;
    memo?: string;
    fundAddress?: string;
    minProofTon?: number;
    code?: string;
    error?: string;
  };
  if (!chal.ok || !chal.challengeId) {
    throw new Error(chal.code || chal.error || "challenge failed");
  }
  const secret = await walletBackupSecret(String(chal.wallet), rec.nfs || "");
  const enc = await encryptPassportRecord(rec, secret);

  if (chal.memo && chal.fundAddress && tonConnectUI.sendTransaction) {
    await sendMemoProof(tonConnectUI, {
      fundAddress: String(chal.fundAddress),
      memo: String(chal.memo),
      minProofTon: Number(chal.minProofTon || 0.01),
    });
    let lastErr = "tx_not_found";
    for (let i = 0; i < 8; i++) {
      if (i > 0) await new Promise((r) => setTimeout(r, 4000));
      const r = await fetch(`${verifierBase()}/v1/passport/backup/wallet`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          presentation,
          ciphertext: enc.ciphertext,
          salt: enc.salt,
          wrapAlg: enc.wrapAlg,
          challengeId: chal.challengeId,
          proof: "memo",
        }),
      });
      const j = (await r.json()) as { ok?: boolean; wallet?: string; code?: string; error?: string };
      if (j.ok) return { wallet: String(j.wallet || chal.wallet) };
      lastErr = j.code || j.error || lastErr;
      if (j.code && j.code !== "tx_not_found" && j.code !== "payment_not_found") {
        throw new Error(j.code || j.error || "wallet bind failed");
      }
    }
    throw new Error(lastErr);
  }

  throw new Error(
    chal.code || chal.error || "wallet_bind_needs_memo — обновление verifier / не используем signData",
  );
}

/** Restore passport from wallet backup via memo transfer (not signData). */
export async function restoreFromWallet(tonConnectUI: TonConnectSignLike): Promise<PassportRecord> {
  const account = tonConnectUI.wallet?.account;
  if (!account?.address) {
    tonConnectUI.openModal?.();
    throw new Error("connect_wallet");
  }
  const chalRes = await fetch(`${verifierBase()}/v1/passport/backup/wallet/challenge`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ purpose: "restore", wallet: account.address }),
  });
  const chal = (await chalRes.json()) as {
    ok?: boolean;
    challengeId?: string;
    text?: string;
    wallet?: string;
    memo?: string;
    fundAddress?: string;
    minProofTon?: number;
    code?: string;
    error?: string;
  };
  if (!chal.ok || !chal.challengeId) {
    throw new Error(chal.code || chal.error || "challenge failed");
  }

  if (chal.memo && chal.fundAddress && tonConnectUI.sendTransaction) {
    await sendMemoProof(tonConnectUI, {
      fundAddress: String(chal.fundAddress),
      memo: String(chal.memo),
      minProofTon: Number(chal.minProofTon || 0.01),
    });
    const j = await pollWalletRestoreMemo(String(chal.challengeId));
    const secret = await walletBackupSecret(String(j.wallet || chal.wallet), String(j.nfs || ""));
    return restoreFromCipherBlob({ ciphertext: j.ciphertext, salt: j.salt }, secret);
  }

  // No memo fields from API — do not call signData (MyWallet / many wallets freeze).
  throw new Error(
    chal.code ||
      chal.error ||
      "not_found",
  );
}

export async function unbindWalletBackup(presentation: string, wallet: string): Promise<void> {
  const r = await fetch(`${verifierBase()}/v1/passport/backup/wallet/unbind`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ presentation, wallet }),
  });
  const j = (await r.json()) as { ok?: boolean; error?: string };
  if (!j.ok) throw new Error(j.error || "unbind failed");
}
