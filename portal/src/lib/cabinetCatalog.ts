import { civicGet } from "./civic";
import { DAO_ADDRESS, TG_BOT_URL, BULCOIN_DEPOSIT_URL, OFFICIAL_UI } from "./config";

export type CabinetApp = {
  id: string;
  type: string;
  url: string;
  name: string;
  description?: string;
  icon?: string;
  source?: string;
};

export type CabinetSection = {
  id: string;
  label: string;
  hint?: string;
};

export type CitizenshipPathMeta = {
  id: string;
  paramKey: string;
  label: string;
  hint?: string;
};

export type CabinetCatalog = {
  version: number;
  dao?: string | null;
  apps: CabinetApp[];
  treasurySections: CabinetSection[];
  settingsSections: CabinetSection[];
  citizenshipPaths: CitizenshipPathMeta[];
};

/** Local defaults when platform `/cabinet-catalog` is missing (prod may 404 until DAO deploy). */
export function builtinCabinetCatalog(dao = DAO_ADDRESS): CabinetCatalog {
  const d = String(dao || "").trim();
  return {
    version: 1,
    dao: d || null,
    apps: [
      {
        id: "official-dao",
        type: "miniapp",
        url: d ? `${OFFICIAL_UI.replace(/\/$/, "")}/#dao=${encodeURIComponent(d)}` : OFFICIAL_UI,
        name: "Официальный DAO",
        description: "Полный миниапп платформы",
        source: "builtin",
      },
      {
        id: "bulcoin",
        type: "miniapp",
        url: BULCOIN_DEPOSIT_URL,
        name: "BulCoin",
        description: "Покупка / депозит BLC",
        source: "builtin",
      },
      {
        id: "cabinet-bot",
        type: "miniapp",
        url: TG_BOT_URL,
        name: "Кабинет в Telegram",
        description: "@bulgaria_state_bot",
        source: "builtin",
      },
    ],
    treasurySections: [
      { id: "funds", label: "Фонды", hint: "Приватизация и автопополнение" },
      { id: "convert", label: "Конверт", hint: "fund.convert.ton.min" },
      { id: "txHistory", label: "История", hint: "Транзакции казны" },
      { id: "dexlp", label: "DexLP", hint: "DeDust LP vault" },
      { id: "trc20", label: "USDT TRC-20", hint: "ChainWallet" },
      { id: "eth", label: "ETH", hint: "ChainWallet ETH" },
      { id: "btc", label: "BTC", hint: "ChainWallet BTC" },
      { id: "xmr", label: "XMR", hint: "ChainWallet XMR" },
    ],
    settingsSections: [
      { id: "wallet", label: "Кошелёк", hint: "TonConnect / привязка" },
      { id: "lang", label: "Язык", hint: "ru / cv / en" },
      { id: "gas", label: "Prepaid-газ", hint: "Личный депозит и пул DAO" },
    ],
    citizenshipPaths: [
      { id: "pay", paramKey: "cit.path.pay", label: "Оплата", hint: "cit.path.pay.amount" },
      { id: "docs", paramKey: "cit.path.docs", label: "Документы / KYC", hint: "Sumsub" },
      { id: "lang", paramKey: "cit.path.lang", label: "Язык / поручители", hint: "cit.path.lang.quorum" },
      { id: "wallet", paramKey: "cit.path.wallet", label: "Кошелёк / NFT", hint: "Связанное DAO или коллекция" },
    ],
  };
}

function normalize(raw: unknown): CabinetCatalog | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Partial<CabinetCatalog> & { ok?: boolean };
  if (!Array.isArray(o.apps)) return null;
  return {
    version: Number(o.version) || 1,
    dao: o.dao ?? null,
    apps: o.apps as CabinetApp[],
    treasurySections: Array.isArray(o.treasurySections) ? (o.treasurySections as CabinetSection[]) : [],
    settingsSections: Array.isArray(o.settingsSections) ? (o.settingsSections as CabinetSection[]) : [],
    citizenshipPaths: Array.isArray(o.citizenshipPaths)
      ? (o.citizenshipPaths as CitizenshipPathMeta[])
      : [],
  };
}

/** Platform API first; builtin fallback when endpoint missing (keeps civic join paths). */
export async function loadCabinetCatalog(
  dao = DAO_ADDRESS,
): Promise<{ catalog: CabinetCatalog; source: "api" | "builtin" }> {
  try {
    const j = await civicGet<unknown>(
      `/v1/platform/cabinet-catalog?dao=${encodeURIComponent(dao)}`,
    );
    const cat = normalize(j);
    if (cat && (cat.citizenshipPaths.length > 0 || cat.apps.length > 0)) {
      return { catalog: cat, source: "api" };
    }
  } catch {
    /* prod civic may not ship cabinet-catalog yet */
  }
  return { catalog: builtinCabinetCatalog(dao), source: "builtin" };
}
