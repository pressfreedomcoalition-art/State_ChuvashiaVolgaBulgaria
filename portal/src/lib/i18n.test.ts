import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  applyLang,
  detectTelegramLang,
  mapLanguageCode,
  resolveInitialLang,
  t,
} from "./i18n";

function stubTelegram(languageCode?: string, userCode?: string, initData = "user=1") {
  vi.stubGlobal("Telegram", {
    WebApp: {
      ready() {},
      expand() {},
      languageCode,
      initData: userCode || languageCode ? initData : "",
      initDataUnsafe: userCode ? { user: { id: 1, language_code: userCode } } : {},
    },
  });
}

describe("i18n", () => {
  const store: Record<string, string> = {};

  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    vi.stubGlobal("localStorage", {
      getItem: (k: string) => store[k] ?? null,
      setItem: (k: string, v: string) => {
        store[k] = v;
      },
      removeItem: (k: string) => {
        delete store[k];
      },
    });
    vi.stubGlobal("Telegram", undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("maps Telegram language codes to ru / cv / en", () => {
    expect(mapLanguageCode("ru")).toBe("ru");
    expect(mapLanguageCode("ru-RU")).toBe("ru");
    expect(mapLanguageCode("cv")).toBe("cv");
    expect(mapLanguageCode("cv-RU")).toBe("cv");
    expect(mapLanguageCode("chv")).toBe("cv");
    expect(mapLanguageCode("en")).toBe("en");
    expect(mapLanguageCode("en-US")).toBe("en");
    expect(mapLanguageCode("de")).toBe("en");
    expect(mapLanguageCode("uk")).toBe("en");
  });

  it("reads Telegram user language, not a bare WebApp script", () => {
    stubTelegram("en", "cv");
    expect(detectTelegramLang()).toBe("cv");
    stubTelegram("en");
    expect(detectTelegramLang()).toBe("en");
    vi.stubGlobal("Telegram", { WebApp: { languageCode: "en", initData: "", initDataUnsafe: {} } });
    expect(detectTelegramLang()).toBeNull();
  });

  it("follows Telegram unless the user picked a language in the cabinet", () => {
    stubTelegram("ru", "en");
    expect(resolveInitialLang()).toBe("en");
    applyLang("cv", true);
    stubTelegram("ru", "en");
    expect(resolveInitialLang()).toBe("cv");
  });

  it("uses English for other Telegram languages", () => {
    stubTelegram("de", "de");
    expect(resolveInitialLang()).toBe("en");
  });

  it("translates all three languages and interpolates", () => {
    expect(t("ru", "loginTitle")).toBe("Личный кабинет");
    expect(t("cv", "loginTitle")).toBe("Хар пÿрт");
    expect(t("en", "loginTitle")).toBe("Citizen cabinet");
    expect(t("en", "walletShort", { addr: "EQ123456" })).toBe("Wallet: EQ123456…");
  });
});
