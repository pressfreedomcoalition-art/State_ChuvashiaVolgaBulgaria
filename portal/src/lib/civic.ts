import { cacheBase, civicBase, DAO_ADDRESS, OFFICIAL_UI } from "./config";

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
  title?: string;
  description?: string;
  status?: string;
  kind?: number;
  endsAt?: number;
  options?: VotingOption[];
};

export type VotingOption = {
  address?: string;
  title?: string;
  text?: string;
  votes?: number;
  weight?: number;
  pct?: number;
};

export type VotingState = {
  status?: string;
  title?: string;
  description?: string;
  options?: VotingOption[];
  results?: VotingOption[];
  endsAt?: number;
};

export type TreasurySnap = {
  ton?: string | number;
  jetton?: string | number;
  jettons?: Array<{ symbol?: string; amount?: string | number; master?: string }>;
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
    const res = await fetch(`${civicBase()}${path}`, { credentials: "omit" });
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
    if ((e as { code?: string }).code === "miss") return null;
    // Dev proxy to dead local cache-server → keep working via platform.
    if (cacheBase() === "/cache") {
      try {
        const env = await civicGet<CacheEnvelope<T>>(path);
        return env.value ?? null;
      } catch (e2) {
        if ((e2 as { code?: string }).code === "miss") return null;
        throw e2;
      }
    }
    throw e;
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
  return row.address || row.voting || "";
}

export function votingStatus(row: VotingRow | VotingState | null | undefined) {
  const s = String(row?.status || "").toLowerCase();
  if (s.includes("finish") || s === "done" || s === "closed") return "finished";
  if (s.includes("active") || s.includes("run") || s === "open") return "active";
  if (s.includes("pending") || s.includes("wait")) return "pending";
  return s || "unknown";
}

export function officialDaoUrl(extra = "") {
  const hash = `#dao=${DAO_ADDRESS}${extra}`;
  return `${OFFICIAL_UI}/${hash}`;
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
