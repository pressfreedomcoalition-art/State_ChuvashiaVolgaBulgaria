export const DAO_ADDRESS =
  import.meta.env.VITE_DAO_ADDRESS ||
  "EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx";

export const LANG_DAO_ADDRESS = import.meta.env.VITE_LANG_DAO_ADDRESS || "";

function host() {
  return typeof window !== "undefined" ? window.location.hostname : "";
}

function isLocalHost() {
  return ["localhost", "127.0.0.1"].includes(host());
}

function forceWonCivic() {
  try {
    return sessionStorage.getItem("chv_civic_force_won") === "1";
  } catch {
    return false;
  }
}

const STICKY_CIVIC_KEY = "chv_civic_base_v1";

const WON_CIVIC = "https://dao.won.onl/civic";
const BLC_CIVIC = "https://dao.blc.cab/civic";

/** Static portal hosts: prefer won.onl civic (no CF) so RF users can reach API. */
function preferWonCivic() {
  if (forceWonCivic()) return true;
  const h = host();
  return (
    h === "chv.blc.cab" ||
    h.endsWith("won.onl") ||
    h.endsWith("github.io")
  );
}

function readStickyCivic(): string {
  try {
    const v = String(sessionStorage.getItem(STICKY_CIVIC_KEY) || "").trim().replace(/\/$/, "");
    if (v === WON_CIVIC || v === BLC_CIVIC) return v;
  } catch {
    /* ignore */
  }
  return "";
}

export function rememberCivicBase(url: string) {
  const base = String(url || "").trim().replace(/\/$/, "");
  if (base !== WON_CIVIC && base !== BLC_CIVIC) return;
  try {
    sessionStorage.setItem(STICKY_CIVIC_KEY, base);
  } catch {
    /* ignore */
  }
}

/** Ordered civic bases for fetch failover (sticky first, then preferred mirror). */
export function civicFetchBases(): string[] {
  if (isLocalHost()) return ["/civic"];
  const sticky = readStickyCivic();
  const primary = preferWonCivic() ? WON_CIVIC : BLC_CIVIC;
  const secondary = primary === WON_CIVIC ? BLC_CIVIC : WON_CIVIC;
  const env = String(import.meta.env.VITE_CIVIC_API || "").trim().replace(/\/$/, "");
  const out: string[] = [];
  for (const b of [sticky, primary, secondary, env]) {
    if (b && !out.includes(b)) out.push(b);
  }
  return out.length ? out : [WON_CIVIC, BLC_CIVIC];
}

export function civicBase() {
  if (isLocalHost()) return "/civic";
  const sticky = readStickyCivic();
  if (sticky) return sticky;
  if (preferWonCivic()) return WON_CIVIC;
  const env = String(import.meta.env.VITE_CIVIC_API || "").trim().replace(/\/$/, "");
  return env || WON_CIVIC;
}

/**
 * Snapshot cache host (`/v1/cache/*`).
 * Prod: `VITE_CACHE_API` → own server; unset → platform civic (unchanged Pages).
 * Local: Vite `/cache` proxy → cache-server :8790 (falls back to civic if down).
 * Dead tunnel / bake-time URL: `bootCacheApiFromJson` sets skip → civic.
 */
export function cacheBase() {
  if (cacheApiSkip) return civicBase();
  const runtime = String(cacheApiRuntime || "").trim().replace(/\/$/, "");
  if (runtime) return runtime;
  // Dev / vite preview / e2e: always local proxy (ignore bake-time tunnel URL).
  if (isLocalHost()) return "/cache";
  const explicit = String(import.meta.env.VITE_CACHE_API || "").trim().replace(/\/$/, "");
  if (explicit) return explicit;
  return civicBase();
}

/** Optional runtime override from /cache-api.json (tunnel URL without rebuild). */
let cacheApiRuntime = "";
/** When true, ignore runtime + VITE_CACHE_API (dead Pinggy etc.). */
let cacheApiSkip = false;

export function setCacheApiRuntime(url: string) {
  cacheApiRuntime = String(url || "").trim().replace(/\/$/, "");
  if (cacheApiRuntime) cacheApiSkip = false;
}

async function probeCacheHost(url: string): Promise<boolean> {
  const base = url.replace(/\/$/, "");
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2_500);
    const res = await fetch(`${base}/health`, {
      signal: ctrl.signal,
      credentials: "omit",
      cache: "no-store",
    });
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}

/** Fetch Pages-hosted cache endpoint; activate only if the host answers. */
export async function bootCacheApiFromJson() {
  if (typeof window === "undefined" || isLocalHost()) return;
  let fromJson = "";
  try {
    const base = (import.meta.env.BASE_URL || "/").replace(/\/?$/, "/");
    const res = await fetch(`${base}cache-api.json`, { cache: "no-store" });
    if (res.ok) {
      const data = (await res.json()) as { url?: string };
      fromJson = String(data?.url || "").trim();
    }
  } catch {
    /* keep bake-time / civic fallback */
  }
  const baked = String(import.meta.env.VITE_CACHE_API || "").trim();
  const candidate = (fromJson.startsWith("https://") ? fromJson : "") || (baked.startsWith("https://") ? baked : "");
  if (!candidate) return;
  if (await probeCacheHost(candidate)) {
    setCacheApiRuntime(candidate);
    return;
  }
  // Stale Pinggy / offline own cache must not break referendums.
  cacheApiSkip = true;
  cacheApiRuntime = "";
}

export const CIVIC_API = civicBase();

export const OFFICIAL_UI = (() => {
  if (preferWonCivic()) return "https://dao.won.onl";
  return import.meta.env.VITE_OFFICIAL_UI || "https://dao.won.onl";
})();

export const PORTAL_ORIGIN =
  import.meta.env.VITE_PORTAL_ORIGIN || "https://chv.blc.cab";

export function tonConnectManifestUrl() {
  if (typeof window === "undefined") return `${PORTAL_ORIGIN}/tonconnect-manifest.json`;
  const base = import.meta.env.BASE_URL || "/";
  return `${window.location.origin}${base}tonconnect-manifest.json`.replace(/([^:]\/)\/+/g, "$1");
}

export const BULCOIN_DEPOSIT_URL =
  import.meta.env.VITE_BULCOIN_DEPOSIT_URL || "https://t.me/bulcoin_blc";

export const TG_BOT_URL =
  import.meta.env.VITE_TG_BOT_URL || "https://t.me/bulgaria_state_bot";

export const TG_BOT_USERNAME = "bulgaria_state_bot";

export const TONCONNECT_MANIFEST = tonConnectManifestUrl();

/** Official Chuvash Republic flag — cabinet brand mark. */
export const CABINET_LOGO = `${(import.meta.env.BASE_URL || "/").replace(/\/?$/, "/")}chuvash-flag.svg`;
