import { Address } from "@ton/core";
import { cacheBase, civicBase, DAO_ADDRESS } from "./config";
import { cacheGet, type DaoParam } from "./civic";
import { fetchDaoParamsOnChain } from "../ton/rpc";

function bounceKey(dao: string): string {
  try {
    return Address.parse(dao).toString({ bounceable: true, urlSafe: true });
  } catch {
    return dao;
  }
}

/** Truncated civic snapshots (e.g. only party.allow) must not be treated as complete. */
export function paramsCatalogLooksComplete(params: DaoParam[] | null | undefined): boolean {
  if (!Array.isArray(params) || params.length === 0) return false;
  if (params.length >= 3) return true;
  return params.some(
    (p) =>
      p.key === "short_url" ||
      p.key.startsWith("cit.path.") ||
      p.key.startsWith("mod.") ||
      p.key.startsWith("hub."),
  );
}

async function cacheRefresh(key: string, force = false): Promise<DaoParam[] | null> {
  const bases = [cacheBase(), civicBase()].filter((b, i, a) => a.indexOf(b) === i);
  for (const base of bases) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 45_000);
      const res = await fetch(`${base}/v1/cache/refresh`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key, force }),
        signal: ctrl.signal,
        credentials: "omit",
      });
      clearTimeout(t);
      if (!res.ok) continue;
      const j = (await res.json()) as { ok?: boolean; value?: unknown };
      if (j?.ok && Array.isArray(j.value)) return j.value as DaoParam[];
    } catch {
      /* try next */
    }
  }
  return null;
}

async function cachePeek(key: string): Promise<DaoParam[] | null> {
  const bases = [cacheBase(), civicBase()].filter((b, i, a) => a.indexOf(b) === i);
  for (const base of bases) {
    try {
      const res = await fetch(`${base}/v1/cache/peek?key=${encodeURIComponent(key)}`, {
        credentials: "omit",
      });
      if (!res.ok) continue;
      const j = (await res.json()) as { ok?: boolean; value?: unknown };
      if (j?.ok && Array.isArray(j.value)) return j.value as DaoParam[];
    } catch {
      /* */
    }
  }
  return null;
}

/**
 * Params: warm cache → peek → refresh → on-chain get_params.
 * Never paint module bind state from a truncated list.
 */
export async function loadDaoParams(dao = DAO_ADDRESS, opts?: { force?: boolean }): Promise<DaoParam[]> {
  const key = `params:${bounceKey(dao)}`;

  if (!opts?.force) {
    const cached = await cacheGet<DaoParam[]>(key).catch(() => null);
    if (paramsCatalogLooksComplete(cached)) return cached!;

    const peeked = await cachePeek(key);
    if (paramsCatalogLooksComplete(peeked)) return peeked!;
  }

  const refreshed = await cacheRefresh(key, true);
  if (paramsCatalogLooksComplete(refreshed)) return refreshed!;

  try {
    return await fetchDaoParamsOnChain(dao);
  } catch {
    // Last resort: whatever cache had (may be truncated).
    const again = await cacheGet<DaoParam[]>(key).catch(() => null);
    return again || refreshed || [];
  }
}
