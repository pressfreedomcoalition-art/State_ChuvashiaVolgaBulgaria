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

/** Static portal hosts: prefer won.onl civic (no CF) so RF users can reach API. */
function preferWonCivic() {
  const h = host();
  return (
    h === "chv.blc.cab" ||
    h.endsWith("won.onl") ||
    h.endsWith("github.io")
  );
}

export function civicBase() {
  if (isLocalHost()) return "/civic";
  if (preferWonCivic()) return "https://dao.won.onl/civic";
  return import.meta.env.VITE_CIVIC_API || "https://dao.won.onl/civic";
}

/**
 * Snapshot cache host (`/v1/cache/*`).
 * Prod: `VITE_CACHE_API` → own server; unset → platform civic (unchanged Pages).
 * Local: Vite `/cache` proxy → cache-server :8790 (falls back to civic if down).
 */
export function cacheBase() {
  const explicit = String(import.meta.env.VITE_CACHE_API || "").trim().replace(/\/$/, "");
  if (isLocalHost()) {
    if (explicit.startsWith("http")) return explicit;
    return "/cache";
  }
  if (explicit) return explicit;
  return civicBase();
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
