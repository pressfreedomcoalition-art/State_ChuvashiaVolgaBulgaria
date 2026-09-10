import { Address } from "@ton/core";
import { cacheBase, civicBase, DAO_ADDRESS, OFFICIAL_UI } from "./config";
import { civicFetch } from "./civicFetch";

export type CacheEnvelope<T> = {
  ok: boolean;
  at?: number;
  value?: T;
  error?: string;
};

export type DaoParam = {
  key: string;
  isString?: boolean;
  num?: number;
  numRaw?: string;
  str?: string;
};

export type DaoConfig = {
  name?: string;
  title?: string;
  description?: string;
  logo?: string;
  i?: string;
  voteJettonMaster?: string;
  minProposal?: number;
  minQuorum?: number;
  minSupportPct?: number;
  minTurnoutPct?: number;
  minDuration?: number;
};

export type VotingRow = {
  address?: string;
  voting?: string;
  /** Cache/DAO list often uses `id` for the voting contract. */
  id?: string;
  title?: string;
  description?: string;
  status?: string;
  kind?: number;
  endsAt?: number;
  options?: VotingOption[];
  notStarted?: boolean;
  awaitingFinalize?: boolean;
};

export type VotingOption = {
  address?: string;
  title?: string;
  text?: string;
  votes?: number;
  weight?: number;
  pct?: number;
  /** Platform cache often stores weight as amount / amount.__bigint */
  amount?: number | string | { __bigint?: string };
};

export type VotingState = {
  status?: string;
  title?: string;
  /** votingMeta uses `name` */
  name?: string;
  description?: string;
  options?: VotingOption[];
  results?: VotingOption[];
  endsAt?: number;
  settings?: { endTime?: number };
};

export type TreasurySnap = {
  ton?: string | number;
  jetton?: string | number;
  jettons?: Array<{
    symbol?: string;
    amount?: string | number;
    master?: string;
    wallet?: string;
    decimals?: number;
  }>;
  governance?: string | number;
};

export type DeputyCard = {
  address?: string;
  name?: string;
  bio?: string;
  age?: string;
  photo?: string;
  votes?: number | string;
};

export type HealthSnap = {
  ok?: boolean;
  gas?: {
    fundAddress?: string;
    grantDebitTon?: number;
    castDebitTon?: number;
    finalizeDebitTon?: number;
  };
  kyc?: { provider?: string; configured?: boolean };
};

export type KycTariff = {
  usdPerCheck?: number;
  feeFloorUsdt?: number;
  defaultFeeSymbol?: string;
};

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function civicGet<T>(path: string): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < 4; i++) {
    let res: Response;
    try {
      res = await civicFetch(path);
    } catch (e) {
      lastErr = e;
      await sleep(400 * (i + 1));
      continue;
    }
    if (res.status === 429) {
      await sleep(800 * (i + 1));
      continue;
    }
    if (res.status === 404) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw Object.assign(new Error(body.error || "miss"), { code: "miss" });
    }
    if (!res.ok) {
      lastErr = new Error(`civic ${res.status}`);
      await sleep(400);
      continue;
    }
    return (await res.json()) as T;
  }
  throw lastErr || new Error("civic failed");
}

async function cacheFetch<T>(path: string): Promise<T> {
  let lastErr: unknown;
  const base = cacheBase();
  for (let i = 0; i < 4; i++) {
    const res = await fetch(`${base}${path}`, { credentials: "omit" });
    if (res.status === 429) {
      await sleep(800 * (i + 1));
      continue;
    }
    if (res.status === 404) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw Object.assign(new Error(body.error || "miss"), { code: "miss" });
    }
    if (!res.ok) {
      lastErr = new Error(`cache ${res.status}`);
      await sleep(400);
      continue;
    }
    return (await res.json()) as T;
  }
  throw lastErr || new Error("cache failed");
}

function usesOwnCacheHost() {
  return cacheBase() !== civicBase();
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const path = `/v1/cache/list?key=${encodeURIComponent(key)}`;
  if (!usesOwnCacheHost()) {
    try {
      const env = await civicGet<CacheEnvelope<T>>(path);
      return env.value ?? null;
    } catch (e) {
      if ((e as { code?: string }).code === "miss") return null;
      throw e;
    }
  }
  try {
    const env = await cacheFetch<CacheEnvelope<T>>(path);
    return env.value ?? null;
  } catch (e) {
    // Own tunnel empty (Pinggy 0 entries) OR dead — both must fall through to platform civic.
    // Previously `miss` returned null and broke claim-wallet (citizenshipHub missing).
    try {
      const env = await civicGet<CacheEnvelope<T>>(path);
      return env.value ?? null;
    } catch (e2) {
      if ((e2 as { code?: string }).code === "miss") return null;
      if ((e as { code?: string }).code === "miss") return null;
      throw e2;
    }
  }
}

export function paramMap(params: DaoParam[] | null | undefined) {
  const map = new Map<string, DaoParam>();
  for (const p of params || []) map.set(p.key, p);
  return map;
}

export function pathEnabled(params: Map<string, DaoParam>, id: string) {
  const flag = params.get(`cit.path.${id}`);
  if (flag && (flag.num === 1 || flag.str === "1" || flag.str === "true")) return true;
  if (id === "pay" && params.has("cit.path.pay.amount")) return true;
  if (id === "docs" && params.has("cit.path.docs.policy")) return true;
  if (id === "lang" && params.has("cit.path.lang.quorum")) return true;
  if (id === "wallet" && params.has("cit.path.wallet.policy")) return true;
  return false;
}

export function formatJettonAmount(raw: string | number | undefined, decimals = 9) {
  if (raw == null) return "—";
  const n = BigInt(String(raw));
  const base = 10n ** BigInt(decimals);
  const whole = n / base;
  const frac = n % base;
  if (frac === 0n) return whole.toLocaleString("ru-RU");
  const fracStr = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
  return `${whole.toLocaleString("ru-RU")}.${fracStr}`;
}

export function formatTon(nano: string | number | undefined) {
  if (nano == null) return "—";
  const n = Number(nano);
  if (!Number.isFinite(n)) return String(nano);
  if (n > 1e6) return `${(n / 1e9).toLocaleString("ru-RU", { maximumFractionDigits: 4 })} TON`;
  return `${n.toLocaleString("ru-RU")} TON`;
}

export function votingAddress(row: VotingRow) {
  return row.address || row.voting || row.id || "";
}

export function votingStatus(row: VotingRow | VotingState | null | undefined) {
  if (row && "notStarted" in row && row.notStarted) return "pending";
  if (row && "awaitingFinalize" in row && row.awaitingFinalize) return "awaiting_finalize";
  const s = String(row?.status || "").toLowerCase();
  if (s.includes("finish") || s === "done" || s === "closed") return "finished";
  if (s.includes("await") && s.includes("final")) return "awaiting_finalize";
  if (s.includes("active") || s.includes("run") || s === "open") return "active";
  if (s.includes("pending") || s.includes("wait") || s.includes("creat")) return "pending";
  return s || "unknown";
}

/** Unix sec or ms → ms. */
export function endsAtMs(row: VotingRow | VotingState | null | undefined): number | null {
  const raw = Number(
    (row as VotingState | undefined)?.endsAt ??
      (row as VotingState | undefined)?.settings?.endTime ??
      (row as VotingRow | undefined)?.endsAt ??
      0,
  );
  if (!Number.isFinite(raw) || raw <= 0) return null;
  return raw < 1e12 ? raw * 1000 : raw;
}

export function votingAwaitingFinalize(row: VotingRow | VotingState | null | undefined): boolean {
  if (!row) return false;
  if ("awaitingFinalize" in row && row.awaitingFinalize) return true;
  const st = votingStatus(row);
  if (st === "awaiting_finalize") return true;
  if (st === "finished" || st === "pending") return false;
  const end = endsAtMs(row);
  return end != null && Date.now() >= end;
}

/** Normalize platform votingState/meta blobs for UI (За/Против, amount.__bigint). */
export function normalizeVotingDetail(
  raw: VotingState | null | undefined,
): VotingState | null {
  if (!raw) return null;
  const opts = (raw.options || raw.results || []).map((o) => {
    const amountRaw = o.amount;
    let fromAmount = 0;
    if (typeof amountRaw === "number") fromAmount = amountRaw;
    else if (typeof amountRaw === "string") fromAmount = Number(amountRaw) || 0;
    else if (amountRaw && typeof amountRaw === "object" && amountRaw.__bigint) {
      try {
        fromAmount = Number(BigInt(amountRaw.__bigint));
      } catch {
        fromAmount = 0;
      }
    }
    // Civic weight is often nano-like; for bars use relative counts. If huge, treat as 1 unit per 1e9.
    let votes = Number(o.votes ?? o.weight ?? 0);
    if (!votes && fromAmount) {
      votes = fromAmount >= 1_000_000_000 ? Math.round(fromAmount / 1_000_000_000) : fromAmount;
      if (votes === 0 && fromAmount > 0) votes = 1;
    }
    return {
      ...o,
      title: o.title || o.text || "",
      votes,
      weight: o.weight ?? votes,
    } satisfies VotingOption;
  });
  const total = opts.reduce((s, o) => s + Number(o.votes || 0), 0);
  const options = opts.map((o) => ({
    ...o,
    pct: o.pct ?? (total ? Math.round((Number(o.votes || 0) / total) * 100) : 0),
  }));
  return {
    ...raw,
    title: raw.title || raw.name || "",
    options,
    results: options,
  };
}

/** Bounceable EQ key for cache lookups. */
export function bounceableAddr(addr: string): string {
  try {
    return Address.parse(addr).toString({ bounceable: true, urlSafe: true });
  } catch {
    return addr;
  }
}

export function officialDaoUrl(extra = "") {
  const hash = `#dao=${DAO_ADDRESS}${extra}`;
  return `${OFFICIAL_UI}/${hash}`;
}

/** Face ID unlock in official DAO → return presentation to CHV `/auth/return`. */
export function officialExportPresentUrl(returnUrl: string, app = "CHV Cabinet") {
  const q = new URLSearchParams({
    exportPresent: "1",
    dao: DAO_ADDRESS,
    return: returnUrl,
    app,
  });
  return `${OFFICIAL_UI}/#${q.toString()}`;
}

export function officialEligUrl(returnUrl: string) {
  const q = new URLSearchParams({
    return: returnUrl,
    app: "CHV Portal",
  });
  return `${OFFICIAL_UI}/#elig=1&${q.toString()}`;
}

export async function consumeElig(code: string) {
  return civicGet<{
    ok: boolean;
    eligible?: boolean;
    dao?: string;
    wallet?: string;
  }>(`/v1/partner/elig/consume?code=${encodeURIComponent(code)}`);
}

export function shortAddr(addr: string, head = 6, tail = 4) {
  if (!addr) return "";
  if (addr.length <= head + tail + 3) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

export function pickName(cfg: DaoConfig | null, params: Map<string, DaoParam>) {
  return (
    cfg?.name ||
    cfg?.title ||
    params.get("name")?.str ||
    params.get("dao.name")?.str ||
    params.get("short_url")?.str ||
    "CHV"
  );
}

export function pickLogo(cfg: DaoConfig | null) {
  return cfg?.logo || cfg?.i || "";
}
