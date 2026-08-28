import type { JWK } from "jose";

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
    return webApp()?.BiometricManager || null;
  } catch {
    return null;
  }
}

export function biometricAvailable(): boolean {
  try {
    const bio = getBio();
    return !!bio?.isBiometricAvailable;
  } catch {
    return false;
  }
}

function initBio(): Promise<TgBio | null> {
  return new Promise((resolve) => {
    const bio = getBio();
    if (!bio) {
      resolve(null);
      return;
    }
    try {
      bio.init(() => resolve(bio));
      setTimeout(() => resolve(bio), 800);
    } catch {
      resolve(bio);
    }
  });
}

export async function authenticateBiometric(reason: string): Promise<boolean> {
  const bio = await initBio();
  if (!bio?.isBiometricAvailable) throw new Error("biometric_unavailable");
  await new Promise<void>((resolve) => {
    if (bio.isAccessGranted) {
      resolve();
      return;
    }
    bio.requestAccess({ reason }, () => resolve());
  });
  return new Promise((resolve, reject) => {
    bio.authenticate({ reason }, (ok) => {
      if (ok) resolve(true);
      else reject(new Error("biometric denied"));
    });
  });
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
export async function unlockPassport(reason = "Разблокировать паспорт"): Promise<PassportRecord> {
  const rec = loadPassportVault();
  if (!rec) throw new Error("no_vault");
  if (biometricAvailable()) {
    await authenticateBiometric(reason);
  }
  openPassportSession(rec);
  return rec;
}
