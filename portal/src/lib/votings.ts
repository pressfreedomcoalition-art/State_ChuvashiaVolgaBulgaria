import { Address } from "@ton/core";
import { DAO_ADDRESS, cacheBase, civicFetchBases } from "./config";
import {
  cacheGet,
  endsAtMs,
  normalizeVotingDetail,
  votingAddress,
  votingAwaitingFinalize,
  type VotingRow,
  type VotingState,
} from "./civic";

type RawVoting = VotingRow & {
  id?: string;
  notStarted?: boolean;
  awaitingFinalize?: boolean;
  endsAt?: number;
};

function bounceKey(dao: string) {
  try {
    return Address.parse(dao).toString({ bounceable: true, urlSafe: true });
  } catch {
    return dao;
  }
}

function cacheAndCivicBases(preferCivicFirst = false): string[] {
  const civic = civicFetchBases().map((b) => b.replace(/\/$/, ""));
  const cache = cacheBase().replace(/\/$/, "");
  const ordered = preferCivicFirst ? [...civic, cache] : [cache, ...civic];
  const out: string[] = [];
  for (const b of ordered) {
    if (b && !out.includes(b)) out.push(b);
  }
  return out;
}

/** Normalize list row; keep awaitingFinalize/notStarted for UI status. */
export function normalizeVoting(raw: RawVoting): VotingRow | null {
  const address = raw.address || raw.voting || raw.id || "";
  if (!address) return null;
  let bounce = address;
  try {
    bounce = Address.parse(address).toString({ bounceable: true, urlSafe: true });
  } catch {
    /* keep */
  }
  let status = String(raw.status || "").toLowerCase();
  if (raw.notStarted) status = "pending";
  else if (status === "closed" || status === "finished" || status === "done") status = "finished";
  else if (status === "active" || status === "open" || status === "running") status = "active";
  else if (raw.awaitingFinalize) status = status && status !== "pending" ? status : "active";
  else if (!status) status = "unknown";

  const awaitingFinalize =
    !!raw.awaitingFinalize ||
    (status !== "finished" &&
      status !== "pending" &&
      (() => {
        const end = endsAtMs({ endsAt: raw.endsAt });
        return end != null && Date.now() >= end;
      })());

  return {
    address: bounce,
    voting: bounce,
    title: raw.title,
    description: raw.description,
    status,
    kind: typeof raw.kind === "number" ? raw.kind : undefined,
    endsAt: raw.endsAt,
    options: raw.options,
    notStarted: !!raw.notStarted,
    awaitingFinalize,
  };
}

function asVotingList(value: unknown): VotingRow[] {
  let arr: unknown[] = [];
  if (Array.isArray(value)) arr = value;
  else if (value && typeof value === "object" && Array.isArray((value as { items?: unknown[] }).items)) {
    arr = (value as { items: unknown[] }).items;
  }
  const out: VotingRow[] = [];
  const seen = new Set<string>();
  for (const item of arr) {
    if (!item || typeof item !== "object") continue;
    const row = normalizeVoting(item as RawVoting);
    if (!row?.address) continue;
    const key = row.address;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(row);
  }
  return out;
}

async function cacheRefresh(key: string, force = false): Promise<unknown | null> {
  const bases = cacheAndCivicBases(false);
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
      if (j?.ok && j.value !== undefined) return j.value;
    } catch {
      /* try next base */
    }
  }
  return null;
}

async function cachePeek(key: string): Promise<unknown | null> {
  // Prefer platform civic first when own tunnel is flaky — list often 404 while peek is warm.
  const bases = cacheAndCivicBases(true);
  for (const base of bases) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 8_000);
      const res = await fetch(`${base}/v1/cache/peek?key=${encodeURIComponent(key)}`, {
        credentials: "omit",
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (!res.ok) continue;
      const j = (await res.json()) as { ok?: boolean; value?: unknown };
      if (j?.ok && j.value !== undefined) return j.value;
    } catch {
      /* */
    }
  }
  return null;
}

/**
 * Overlay live `votingState:` onto list rows (status, endsAt, options/results).
 * Uses peek (fast, no chain rewarm) so the hub is not blocked by soft-TTL refresh.
 */
export async function enrichVotingsFromState(rows: VotingRow[]): Promise<VotingRow[]> {
  if (!rows.length) return rows;
  const enriched = await Promise.all(
    rows.map(async (row) => {
      const addr = votingAddress(row);
      if (!addr) return row;
      try {
        const raw = await cachePeek(`votingState:${addr}`);
        if (!raw || typeof raw !== "object") {
          return {
            ...row,
            awaitingFinalize: votingAwaitingFinalize(row),
          };
        }
        const detail = normalizeVotingDetail(raw as VotingState);
        if (!detail) return row;
        const merged: VotingRow = {
          ...row,
          title: row.title || detail.title || detail.name || row.title,
          description: row.description || detail.description || row.description,
          status: detail.status || row.status,
          endsAt: detail.endsAt ?? detail.settings?.endTime ?? row.endsAt,
          options: detail.options?.length ? detail.options : row.options,
        };
        merged.awaitingFinalize = votingAwaitingFinalize(merged);
        if (merged.awaitingFinalize && merged.status !== "finished") {
          merged.status = merged.status === "pending" ? "active" : merged.status;
        }
        return merged;
      } catch {
        return row;
      }
    }),
  );
  return enriched;
}

async function withEnrichTimeout(rows: VotingRow[], ms = 3_000): Promise<VotingRow[]> {
  try {
    return await Promise.race([
      enrichVotingsFromState(rows),
      new Promise<VotingRow[]>((resolve) => {
        setTimeout(
          () => resolve(rows.map((r) => ({ ...r, awaitingFinalize: votingAwaitingFinalize(r) }))),
          ms,
        );
      }),
    ]);
  } catch {
    return rows;
  }
}

/**
 * Votings list: TTL-aware `/list` (getFresh) → refresh → peek last.
 * Then enrich each row from `votingState:` so status/results match detail.
 */
export async function loadVotings(dao = DAO_ADDRESS, opts?: { force?: boolean }): Promise<VotingRow[]> {
  const key = `votings:${bounceKey(dao)}`;

  if (!opts?.force) {
    const cached = await cacheGet<unknown>(key).catch(() => null);
    const fromCache = asVotingList(cached);
    if (fromCache.length) return withEnrichTimeout(fromCache);
  }

  const refreshed = await cacheRefresh(key, !!opts?.force);
  const fromRefresh = asVotingList(refreshed);
  if (fromRefresh.length) return withEnrichTimeout(fromRefresh);

  // Warm peek only as last resort (may be stale — still better than empty).
  const peeked = await cachePeek(key);
  const fromPeek = asVotingList(peeked);
  if (fromPeek.length) return withEnrichTimeout(fromPeek);

  const again = await cacheGet<unknown>(key).catch(() => null);
  return withEnrichTimeout(asVotingList(again));
}
