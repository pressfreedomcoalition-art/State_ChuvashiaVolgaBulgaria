import { Address } from "@ton/core";
import { DAO_ADDRESS, civicBase, cacheBase } from "./config";
import { cacheGet, type VotingRow } from "./civic";

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

function normalizeVoting(raw: RawVoting): VotingRow | null {
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
  else if (raw.awaitingFinalize) status = "pending";
  else if (status === "closed" || status === "finished" || status === "done") status = "finished";
  else if (status === "active" || status === "open" || status === "running") status = "active";
  else if (!status) status = "unknown";

  return {
    address: bounce,
    voting: bounce,
    title: raw.title,
    description: raw.description,
    status,
    kind: typeof raw.kind === "number" ? raw.kind : undefined,
    endsAt: raw.endsAt,
    options: raw.options,
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
      if (j?.ok && j.value !== undefined) return j.value;
    } catch {
      /* try next base */
    }
  }
  return null;
}

async function cachePeek(key: string): Promise<unknown | null> {
  // Prefer platform civic first when own tunnel is flaky — list often 404 while peek is warm.
  const bases = [civicBase(), cacheBase()].filter((b, i, a) => a.indexOf(b) === i);
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
 * Votings list: peek (warm civic) → list → server refresh.
 * `list` is often a 404 miss while `peek` still has the snapshot.
 */
export async function loadVotings(dao = DAO_ADDRESS, opts?: { force?: boolean }): Promise<VotingRow[]> {
  const key = `votings:${bounceKey(dao)}`;

  if (!opts?.force) {
    const peeked = await cachePeek(key);
    const fromPeek = asVotingList(peeked);
    if (fromPeek.length) return fromPeek;

    const cached = await cacheGet<unknown>(key).catch(() => null);
    const fromCache = asVotingList(cached);
    if (fromCache.length) return fromCache;
  }

  const refreshed = await cacheRefresh(key, !!opts?.force);
  const fromRefresh = asVotingList(refreshed);
  if (fromRefresh.length) return fromRefresh;

  // After force refresh miss — still try warm peek (refresh may be HTML/400).
  const peekedAgain = await cachePeek(key);
  const fromPeekAgain = asVotingList(peekedAgain);
  if (fromPeekAgain.length) return fromPeekAgain;

  const again = await cacheGet<unknown>(key).catch(() => null);
  return asVotingList(again);
}
