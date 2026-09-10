import { civicBase, civicFetchBases, rememberCivicBase } from "./config";
import { getLang, t } from "./i18n";

function isNetworkFail(e: unknown): boolean {
  const raw = e instanceof Error ? e.message : String(e);
  return /failed to fetch|networkerror|load failed|network request failed|aborted|timed?\s*out/i.test(raw);
}

function networkError(): Error {
  return new Error(t(getLang(), "errCivicNetwork"));
}

/**
 * fetch against civic mirrors (won.onl ↔ blc.cab). Sticky on success.
 * Failover only on network / gateway errors — not on 4xx business responses.
 */
export async function civicFetch(path: string, init?: RequestInit): Promise<Response> {
  const bases = civicFetchBases();
  let lastNet: unknown;
  for (let i = 0; i < bases.length; i++) {
    const base = bases[i]!;
    try {
      const res = await fetch(`${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`, {
        ...init,
        credentials: init?.credentials ?? "omit",
      });
      if ([502, 503, 504].includes(res.status) && i < bases.length - 1) {
        lastNet = new Error(`civic ${res.status}`);
        continue;
      }
      rememberCivicBase(base);
      return res;
    } catch (e) {
      lastNet = e;
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
