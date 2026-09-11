import { civicGet, type DaoParam } from "./civic";

export type VoteCatId =
  | "decisions"
  | "citizenship"
  | "treasury"
  | "funds"
  | "settings"
  | "hub"
  | "parties";

export type VotingCatalogPreset = {
  hubAppMode?: "enable" | "disable";
  hubAppId?: string;
  title?: string;
  paramKey?: string;
};

export type VotingCatalogRequire = {
  privFundOn?: boolean;
  hasPrivFund?: boolean;
  privFundLive?: boolean;
  topupActive?: boolean;
  banByVote?: boolean;
  nftPassOpen?: boolean;
};

export type VotingCatalogItem = {
  /** Stable UI key (vtype alone is not unique — hub enable/disable share 11). */
  id: string;
  vtype: number;
  label: string;
  hint: string;
  category: VoteCatId;
  require?: VotingCatalogRequire;
  preset?: VotingCatalogPreset;
};

export type VotingCatalogCategory = { id: VoteCatId; title: string };

export type VotingCatalog = {
  version: number;
  updatedAt?: string;
  categories: VotingCatalogCategory[];
  items: VotingCatalogItem[];
};

export type VotingCatalogContext = {
  privFundOn: boolean;
  hasPrivFund: boolean;
  privFundLive: boolean;
  topupActive: boolean;
  banByVote: boolean;
  nftPassOpen: boolean;
};

const APP_TOMBSTONE = "-";

export function isHubItemEnabled(params: Map<string, DaoParam> | DaoParam[], id: string): boolean {
  const key = `hub.on.${id}`;
  const p = Array.isArray(params)
    ? params.find((x) => x.key === key)
    : params.get(key);
  if (!p) return false;
  if (p.isString) {
    const s = (p.str || "").trim().toLowerCase();
    if (!s || s === APP_TOMBSTONE || s === "0" || s === "false" || s === "off") return false;
    return s === "1" || s === "true" || s === "on";
  }
  return (p.num ?? 0) !== 0;
}

export function isPrivFundEnabled(params: Map<string, DaoParam> | DaoParam[]): boolean {
  return isHubItemEnabled(params, "priv_fund");
}

export function isTopupActive(params: Map<string, DaoParam> | DaoParam[]): boolean {
  const get = (key: string) =>
    Array.isArray(params) ? params.find((x) => x.key === key) : params.get(key);
  const pct = get("fund.topup.pct");
  const fixed = get("fund.topup.fixed");
  const pctOn = pct != null && !pct.isString && Number(pct.num ?? pct.numRaw ?? 0) > 0;
  const fixedOn = fixed != null && !fixed.isString && Number(fixed.num ?? fixed.numRaw ?? 0) > 0;
  return pctOn || fixedOn;
}

export function isBanByVoteEnabled(params: Map<string, DaoParam> | DaoParam[]): boolean {
  const p = Array.isArray(params)
    ? params.find((x) => x.key === "cit.ban.enabled")
    : params.get("cit.ban.enabled");
  if (!p) return false;
  if (p.isString) return (p.str || "").trim() === "1";
  return (p.num ?? 0) !== 0;
}

export function isNftPassportOpen(params: Map<string, DaoParam> | DaoParam[]): boolean {
  const p = Array.isArray(params)
    ? params.find((x) => x.key === "cit.nft.collection")
    : params.get("cit.nft.collection");
  if (!p) return false;
  const str = (p.str || "").trim();
  if (!str || str === "-" || str === "0") return false;
  return str.length > 10;
}

/** Collection address when NFT passports are open. */
export function nftPassportCollection(params: Map<string, DaoParam> | DaoParam[]): string | null {
  const p = Array.isArray(params)
    ? params.find((x) => x.key === "cit.nft.collection")
    : params.get("cit.nft.collection");
  if (!p) return null;
  const str = (p.str || "").trim();
  if (!str || str === "-" || str.length < 10) return null;
  return str;
}

export function isGasTreasuryEnabled(params: Map<string, DaoParam> | DaoParam[]): boolean {
  const p = Array.isArray(params)
    ? params.find((x) => x.key === "gas.treasury")
    : params.get("gas.treasury");
  if (!p) return false;
  if (p.isString) return (p.str || "").trim() === "1";
  return (p.num ?? 0) !== 0;
}

export function isPartyAllowEnabled(params: Map<string, DaoParam> | DaoParam[]): boolean {
  const p = Array.isArray(params)
    ? params.find((x) => x.key === "party.allow")
    : params.get("party.allow");
  if (!p) return false;
  if (p.isString) return (p.str || "").trim() === "1";
  return (p.num ?? 0) !== 0;
}

/** Bundled mirror of DAO VotingTypePicker — used when civic API is unreachable. */
export const BUNDLED_VOTING_CATALOG: VotingCatalog = {
  version: 1,
  updatedAt: "2026-09-10",
  categories: [
    { id: "decisions", title: "Решения" },
    { id: "citizenship", title: "Гражданство" },
    { id: "treasury", title: "Казна" },
    { id: "funds", title: "Фонды" },
    { id: "settings", title: "Настройки" },
    { id: "hub", title: "Хаб" },
    { id: "parties", title: "Партии" },
  ],
  items: [
    {
      id: "decision",
      vtype: 0,
      category: "decisions",
      label: "Референдум / решение",
      hint: "Без ончейн-исполнения — только мнение граждан",
    },
    {
      id: "cit-path",
      vtype: 6,
      category: "citizenship",
      label: "Путь гражданства (DaoParam)",
      hint: "cit.path.* — вкл/настройка пути",
    },
    {
      id: "ban-enable",
      vtype: 12,
      category: "citizenship",
      label: "Включить бан по голосу",
      hint: "cit.ban.enabled=1",
    },
    {
      id: "ban-citizen",
      vtype: 13,
      category: "citizenship",
      label: "Бан гражданина",
      hint: "cit.ban.* payload",
      require: { banByVote: true },
    },
    {
      id: "nft-pass-open",
      vtype: 19,
      category: "citizenship",
      label: "Открыть NFT-паспорт",
      hint: "cit.nft.collection = EQ…",
      require: { nftPassOpen: false },
    },
    {
      id: "sec-password",
      vtype: 16,
      category: "citizenship",
      label: "Пароль / sec",
      hint: "sec.password",
    },
    {
      id: "gas-treasury",
      vtype: 17,
      category: "citizenship",
      label: "Газ из казны",
      hint: "gas.treasury=1",
    },
    {
      id: "payout",
      vtype: 1,
      category: "treasury",
      label: "Выплата из казны",
      hint: "kind=1 · За/Против · исполнение",
    },
    {
      id: "convert-buffer",
      vtype: 20,
      category: "treasury",
      label: "Буфер конверта",
      hint: "выплата жетона на hot-wallet",
    },
    {
      id: "convert",
      vtype: 18,
      category: "treasury",
      label: "Автоконверт (порог TON)",
      hint: "fund.convert.ton.min",
    },
    {
      id: "chain-pay",
      vtype: 32,
      category: "treasury",
      label: "Выплата USDT TRC-20",
      hint: "mod.exec.forward · ChainEnqueue",
    },
    {
      id: "mod-allow",
      vtype: 30,
      category: "treasury",
      label: "Приклеить / отклеить модуль",
      hint: "mod.allow / mod.deny",
    },
    {
      id: "mod-exec",
      vtype: 31,
      category: "treasury",
      label: "Исполнить на модуле",
      hint: "mod.exec.* · DexLP / custom",
    },
    {
      id: "priv-enable",
      vtype: 11,
      category: "funds",
      label: "Приватизация — включить",
      hint: "hub.on.priv_fund=1",
      require: { privFundOn: false },
      preset: {
        hubAppMode: "enable",
        hubAppId: "priv_fund",
        title: "Приватизация",
      },
    },
    {
      id: "priv-unlock",
      vtype: 7,
      category: "funds",
      label: "Разблокировать приватизацию",
      hint: "kind=6 · totalCitizens",
      require: { privFundOn: true, hasPrivFund: true, privFundLive: false },
    },
    {
      id: "priv-disable",
      vtype: 11,
      category: "funds",
      label: "Приватизация — выключить",
      hint: "hub.on.priv_fund → tombstone",
      require: { privFundOn: true },
      preset: {
        hubAppMode: "disable",
        hubAppId: "priv_fund",
        title: "Приватизация",
      },
    },
    {
      id: "topup-create",
      vtype: 14,
      category: "funds",
      label: "Автопополнение казны",
      hint: "fund.topup.pct | fund.topup.fixed",
      require: { topupActive: false },
    },
    {
      id: "config",
      vtype: 2,
      category: "settings",
      label: "Изменить DaoConfig",
      hint: "кворум / поддержка / длительность / лого",
    },
    {
      id: "param-custom",
      vtype: 4,
      category: "settings",
      label: "Произвольный DaoParam",
      hint: "любой ключ kind=4",
    },
    {
      id: "hub-app",
      vtype: 11,
      category: "hub",
      label: "Подключённое приложение",
      hint: "hub.on.* / app.*",
    },
    {
      id: "short-url",
      vtype: 10,
      category: "hub",
      label: "Короткий URL",
      hint: "short_url",
    },
    {
      id: "party-allow",
      vtype: 21,
      category: "parties",
      label: "Разрешить партии",
      hint: "party.allow",
    },
    {
      id: "party-become",
      vtype: 22,
      category: "parties",
      label: "Разрешить вступление",
      hint: "party.become",
    },
  ],
};

function matchRequire(req: VotingCatalogRequire | undefined, ctx: VotingCatalogContext): boolean {
  if (!req) return true;
  if (req.privFundOn != null && req.privFundOn !== ctx.privFundOn) return false;
  if (req.hasPrivFund != null && req.hasPrivFund !== ctx.hasPrivFund) return false;
  if (req.privFundLive != null && req.privFundLive !== ctx.privFundLive) return false;
  if (req.topupActive != null && req.topupActive !== ctx.topupActive) return false;
  if (req.banByVote != null && req.banByVote !== ctx.banByVote) return false;
  if (req.nftPassOpen != null && req.nftPassOpen !== ctx.nftPassOpen) return false;
  return true;
}

export function filterVotingCatalog(
  catalog: VotingCatalog,
  ctx: VotingCatalogContext,
): { categories: VotingCatalogCategory[]; items: VotingCatalogItem[] } {
  const items = catalog.items.filter((it) => matchRequire(it.require, ctx));
  const used = new Set(items.map((i) => i.category));
  const categories = catalog.categories.filter((c) => used.has(c.id));
  return { categories, items };
}

export function catalogContextFromParams(
  params: Map<string, DaoParam>,
  extra?: Partial<Pick<VotingCatalogContext, "hasPrivFund" | "privFundLive">>,
): VotingCatalogContext {
  return {
    privFundOn: isPrivFundEnabled(params),
    hasPrivFund: !!extra?.hasPrivFund,
    privFundLive: !!extra?.privFundLive,
    topupActive: isTopupActive(params),
    banByVote: isBanByVoteEnabled(params),
    nftPassOpen: isNftPassportOpen(params),
  };
}

function normalizeCatalog(raw: unknown): VotingCatalog | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Partial<VotingCatalog> & { ok?: boolean };
  if (!Array.isArray(o.categories) || !Array.isArray(o.items)) return null;
  if (o.items.length === 0) return null;
  return {
    version: Number(o.version) || 1,
    updatedAt: typeof o.updatedAt === "string" ? o.updatedAt : undefined,
    categories: o.categories as VotingCatalogCategory[],
    items: o.items as VotingCatalogItem[],
  };
}

/** Prefer platform API; fall back to bundled catalog so cabinet never loses modules. */
export async function loadVotingCatalog(): Promise<{ catalog: VotingCatalog; source: "api" | "bundle" }> {
  try {
    const j = await civicGet<unknown>("/v1/platform/voting-catalog");
    const cat = normalizeCatalog(j);
    if (cat) return { catalog: cat, source: "api" };
  } catch {
    /* bundle */
  }
  return { catalog: BUNDLED_VOTING_CATALOG, source: "bundle" };
}
