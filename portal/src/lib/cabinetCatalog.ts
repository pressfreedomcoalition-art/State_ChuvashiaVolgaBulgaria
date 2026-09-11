import { civicGet } from "./civic";
import { DAO_ADDRESS } from "./config";

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

/** Platform API only — no local builtin lists. */
export async function loadCabinetCatalog(
  dao = DAO_ADDRESS,
): Promise<{ catalog: CabinetCatalog; source: "api" }> {
  const j = await civicGet<unknown>(
    `/v1/platform/cabinet-catalog?dao=${encodeURIComponent(dao)}`,
  );
  const cat = normalize(j);
  if (!cat) throw new Error("cabinet_catalog_unavailable");
  return { catalog: cat, source: "api" };
}
