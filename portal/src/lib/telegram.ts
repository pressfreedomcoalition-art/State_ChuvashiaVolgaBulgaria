import { BULCOIN_DEPOSIT_URL, TG_BOT_URL } from "./config";

type TgInsets = { top?: number; bottom?: number; left?: number; right?: number };

type TgWebApp = {
  ready: () => void;
  expand: () => void;
  close?: () => void;
  openLink?: (url: string) => void;
  openTelegramLink?: (url: string) => void;
  BackButton?: { show: () => void; hide: () => void; onClick: (cb: () => void) => void };
  initDataUnsafe?: { user?: { id?: number; first_name?: string; language_code?: string } };
  initData?: string;
  languageCode?: string;
  colorScheme?: "light" | "dark";
  platform?: string;
  safeAreaInset?: TgInsets;
  contentSafeAreaInset?: TgInsets;
  onEvent?: (event: string, cb: () => void) => void;
  offEvent?: (event: string, cb: () => void) => void;
};

function tg(): TgWebApp | undefined {
  return (window as unknown as { Telegram?: { WebApp?: TgWebApp } }).Telegram?.WebApp;
}

export function isTelegram(): boolean {
  return Boolean(tg());
}

/** Telegram UI language (Settings → Language), then WebApp languageCode inside a real Mini App. */
export function getTelegramLanguageCode(): string | undefined {
  const w = tg();
  if (!w) return undefined;
  if (w.initDataUnsafe?.user?.language_code) return w.initDataUnsafe.user.language_code;
  if (w.initData && w.languageCode) return w.languageCode;
  return undefined;
}

function px(n: number | undefined, fallback = 0): string {
  const v = typeof n === "number" && Number.isFinite(n) ? Math.max(0, n) : fallback;
  return `${v}px`;
}

/**
 * Map Telegram safe / content insets onto CSS variables so UI clears the
 * native «Закрыть» / menu chrome (often top-left on iOS).
 */
export function applyTelegramSafeArea() {
  const w = tg();
  const root = document.documentElement;
  if (!w) {
    root.style.removeProperty("--tg-pad-top");
    root.style.removeProperty("--tg-pad-bottom");
    root.style.removeProperty("--tg-pad-left");
    root.style.removeProperty("--tg-pad-right");
    return;
  }
  const safe = w.safeAreaInset || {};
  const content = w.contentSafeAreaInset || {};
  // Fallback when Bot API < 8.0: leave room for the close row (~48–56px).
  const topFallback = 52;
  const top = (safe.top || 0) + (content.top || 0);
  const bottom = (safe.bottom || 0) + (content.bottom || 0);
  const left = (safe.left || 0) + (content.left || 0);
  const right = (safe.right || 0) + (content.right || 0);
  root.style.setProperty("--tg-pad-top", px(top > 0 ? top : topFallback));
  root.style.setProperty("--tg-pad-bottom", px(bottom));
  root.style.setProperty("--tg-pad-left", px(left));
  root.style.setProperty("--tg-pad-right", px(right > 0 ? right : 72));
}

export function bootTelegram() {
  const w = tg();
  if (!w) return;
  w.ready();
  w.expand();
  document.documentElement.dataset.tma = "1";
  applyTelegramSafeArea();
  const refresh = () => applyTelegramSafeArea();
  try {
    w.onEvent?.("safeAreaChanged", refresh);
    w.onEvent?.("contentSafeAreaChanged", refresh);
    w.onEvent?.("viewportChanged", refresh);
  } catch {
    /* older clients */
  }
}

export function openExternal(url: string) {
  const w = tg();
  if (w?.openTelegramLink && (url.startsWith("https://t.me/") || url.startsWith("tg:"))) {
    w.openTelegramLink(url);
    return;
  }
  if (w?.openLink) {
    w.openLink(url);
    return;
  }
  window.open(url, "_blank", "noopener,noreferrer");
}

export function openOfficial(url: string) {
  openExternal(url);
}

export function openBulCoinDeposit() {
  openExternal(BULCOIN_DEPOSIT_URL);
}

export function openPortalBot() {
  openExternal(TG_BOT_URL);
}
