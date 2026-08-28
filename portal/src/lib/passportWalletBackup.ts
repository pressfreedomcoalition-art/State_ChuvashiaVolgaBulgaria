/**
 * Wallet backup restore — mirrored from dao miniapp passportBackup.ts
 * (POST /v1/passport/backup/wallet*, /v1/passport/restore/wallet).
 */
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

/** Loose TonConnect UI shape — signData response typing varies by SDK version. */
export type TonConnectSignLike = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  signData: (payload: { type: "text"; text: string; network?: string; from?: string }) => Promise<any>;
  wallet?: {
    account?: {
      address?: string;
      walletStateInit?: string;
      publicKey?: string;
    };
  } | null;
  openModal?: () => void;
};

async function signWalletChallenge(
  tonConnectUI: TonConnectSignLike,
  text: string,
): Promise<{ signData: Record<string, unknown>; walletStateInit: string; wallet: string }> {
  const account = tonConnectUI.wallet?.account;
  if (!account?.address || !account.walletStateInit) {
    tonConnectUI.openModal?.();
    throw new Error("connect_wallet");
  }
  const signed = await tonConnectUI.signData({
    type: "text",
    text,
    network: "-239",
    from: account.address,
  });
  return {
    signData: signed as unknown as Record<string, unknown>,
    walletStateInit: account.walletStateInit,
    wallet: account.address,
  };
}

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
    code?: string;
    error?: string;
  };
  if (!chal.ok || !chal.challengeId || !chal.text) {
    throw new Error(chal.code || chal.error || "challenge failed");
  }
  const proof = await signWalletChallenge(tonConnectUI, String(chal.text));
  const secret = await walletBackupSecret(String(chal.wallet), rec.nfs || "");
  const enc = await encryptPassportRecord(rec, secret);
  const r = await fetch(`${verifierBase()}/v1/passport/backup/wallet`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      presentation,
      ciphertext: enc.ciphertext,
      salt: enc.salt,
      wrapAlg: enc.wrapAlg,
      challengeId: chal.challengeId,
      walletStateInit: proof.walletStateInit,
      signData: proof.signData,
    }),
  });
  const j = (await r.json()) as { ok?: boolean; wallet?: string; code?: string; error?: string };
  if (!j.ok) throw new Error(j.code || j.error || "wallet bind failed");
  return { wallet: String(j.wallet || chal.wallet) };
}

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
    code?: string;
    error?: string;
  };
  if (!chal.ok || !chal.challengeId || !chal.text) {
    throw new Error(chal.code || chal.error || "challenge failed");
  }
  const proof = await signWalletChallenge(tonConnectUI, String(chal.text));
  const r = await fetch(`${verifierBase()}/v1/passport/restore/wallet`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      challengeId: chal.challengeId,
      walletStateInit: proof.walletStateInit,
      signData: proof.signData,
    }),
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
  if (!j.ok || !j.ciphertext || !j.salt) {
    throw new Error(j.code || j.error || "wallet restore failed");
  }
  const secret = await walletBackupSecret(String(j.wallet || chal.wallet), String(j.nfs || ""));
  return restoreFromCipherBlob({ ciphertext: j.ciphertext, salt: j.salt }, secret);
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
