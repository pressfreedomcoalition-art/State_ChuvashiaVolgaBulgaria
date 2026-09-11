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

/** Load create-voting catalog from civic platform API (no local fallback). */
export async function loadVotingCatalog(): Promise<{ catalog: VotingCatalog; source: "api" }> {
  const j = await civicGet<unknown>("/v1/platform/voting-catalog");
  const cat = normalizeCatalog(j);
  if (!cat) throw new Error("voting_catalog_unavailable");
  return { catalog: cat, source: "api" };
}
