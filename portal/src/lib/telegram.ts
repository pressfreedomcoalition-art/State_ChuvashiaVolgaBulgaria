import { BULCOIN_DEPOSIT_URL, TG_BOT_URL } from "./config";

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

export function bootTelegram() {
  const w = tg();
  if (!w) return;
  w.ready();
  w.expand();
  document.documentElement.dataset.tma = "1";
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
