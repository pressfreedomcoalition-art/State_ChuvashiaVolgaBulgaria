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

function isBypassHost() {
  const h = host();
  return h.endsWith("won.onl") || h.endsWith("github.io");
}

export function civicBase() {
  if (isLocalHost()) return "/civic";
  if (isBypassHost()) return "https://dao.won.onl/civic";
  return import.meta.env.VITE_CIVIC_API || "https://dao.blc.cab/civic";
}

export const CIVIC_API = civicBase();

export const OFFICIAL_UI = (() => {
  if (isBypassHost()) return "https://dao.won.onl";
  return import.meta.env.VITE_OFFICIAL_UI || "https://dao.blc.cab";
})();

export const PORTAL_ORIGIN =
  import.meta.env.VITE_PORTAL_ORIGIN || "https://chv.won.onl";

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
