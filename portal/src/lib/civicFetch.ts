import {
  civicBase,
  civicFetchBases,
  forgetCivicBase,
  rememberCivicBase,
  rotateCivicMirror,
} from "./config";
import { getLang, t } from "./i18n";

const FETCH_TIMEOUT_MS = 10_000;

function isNetworkFail(e: unknown): boolean {
  const raw = e instanceof Error ? e.message : String(e);
  return /failed to fetch|networkerror|load failed|network request failed|aborted|timed?\s*out|abort/i.test(
    raw,
  );
}

function networkError(): Error {
  return new Error(t(getLang(), "errCivicNetwork"));
}

function withTimeout(parent?: AbortSignal): { signal: AbortSignal; clear: () => void } {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  const onParent = () => ctrl.abort();
  if (parent) {
    if (parent.aborted) ctrl.abort();
    else parent.addEventListener("abort", onParent, { once: true });
  }
  return {
    signal: ctrl.signal,
    clear: () => {
      clearTimeout(timer);
      if (parent) parent.removeEventListener("abort", onParent);
    },
  };
}

/**
 * fetch against civic mirrors (won.onl ↔ blc.cab). Sticky on success.
 * Per-request timeout so a hung CF edge does not block failover (critical for RF).
 */
export async function civicFetch(path: string, init?: RequestInit): Promise<Response> {
  const bases = civicFetchBases();
  let lastNet: unknown;
  const rel = path.startsWith("/") ? path : `/${path}`;
  for (let i = 0; i < bases.length; i++) {
    const base = bases[i]!;
    const { signal, clear } = withTimeout(init?.signal ?? undefined);
    try {
      const res = await fetch(`${base.replace(/\/$/, "")}${rel}`, {
        ...init,
        signal,
        credentials: init?.credentials ?? "omit",
      });
      clear();
      if ([502, 503, 504].includes(res.status) && i < bases.length - 1) {
        forgetCivicBase(base);
        lastNet = new Error(`civic ${res.status}`);
        continue;
      }
      rememberCivicBase(base);
      return res;
    } catch (e) {
      clear();
      lastNet = e;
      forgetCivicBase(base);
      if (!isNetworkFail(e) && i === bases.length - 1) {
        throw e instanceof Error ? e : new Error(String(e));
      }
    }
  }
  if (lastNet && isNetworkFail(lastNet)) throw networkError();
  throw lastNet instanceof Error ? lastNet : networkError();
}

export async function civicPostJson<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await civicFetch(path, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    if (isNetworkFail(e) || (e instanceof Error && e.message === t(getLang(), "errCivicNetwork"))) {
      throw networkError();
    }
    throw e;
  }
  const j = (await res.json().catch(() => ({}))) as T & { ok?: boolean; error?: string; code?: string };
  if (!res.ok || j.ok === false) {
    throw new Error(j.code || j.error || `HTTP ${res.status}`);
  }
  return j;
}

/** Absolute civic origin currently preferred (after sticky / failover). */
export function civicOrigin(): string {
  return civicBase().replace(/\/$/, "");
}

export function isCivicNetworkError(msg: string | null | undefined): boolean {
  if (!msg) return false;
  const net = t(getLang(), "errCivicNetwork");
  return msg === net || /нет связи с сервером гражданства|cannot reach the citizenship|гражданлăх серверĕ/i.test(msg);
}

/** Clear sticky + flip mirror, then optional retry. */
export function switchCivicMirrorAndReload() {
  rotateCivicMirror();
  window.location.reload();
}
