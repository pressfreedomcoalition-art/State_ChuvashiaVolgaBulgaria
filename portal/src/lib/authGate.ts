import { fetchCitizenshipStatus } from "./civicActions";

export type AuthGateResult = "citizen" | "not_citizen" | "unknown";

const CITIZEN_KEY = "chv-citizen";

/** Survives Mini App restarts (sessionStorage alone is wiped too often). */
export function readCitizenFlag(): boolean | null {
  try {
    const sess = sessionStorage.getItem(CITIZEN_KEY);
    if (sess === "1") return true;
    if (sess === "0") return false;
  } catch {
    /* ignore */
  }
  try {
    const loc = localStorage.getItem(CITIZEN_KEY);
    if (loc === "1") return true;
    if (loc === "0") return false;
  } catch {
    /* ignore */
  }
  return null;
}

export function writeCitizenFlag(v: boolean | null) {
  try {
    if (v == null) {
      sessionStorage.removeItem(CITIZEN_KEY);
      localStorage.removeItem(CITIZEN_KEY);
    } else {
      const s = v ? "1" : "0";
      sessionStorage.setItem(CITIZEN_KEY, s);
      localStorage.setItem(CITIZEN_KEY, s);
    }
  } catch {
    /* ignore */
  }
}

/** After Face ID / seed / wallet unlock — where to land. */
export async function resolveCitizenshipGate(): Promise<AuthGateResult> {
  try {
    const r = await fetchCitizenshipStatus();
    if (r.citizen) return "citizen";
    return "not_citizen";
  } catch {
    return "unknown";
  }
}

export function pathAfterGate(g: AuthGateResult): string {
  if (g === "citizen") return "/referendums";
  if (g === "not_citizen") return "/citizenship";
  // Network / presentation glitch — keep last known home, never a dead-end interstitial.
  const prev = readCitizenFlag();
  if (prev === true) return "/referendums";
  if (prev === false) return "/citizenship";
  return "/referendums";
}
