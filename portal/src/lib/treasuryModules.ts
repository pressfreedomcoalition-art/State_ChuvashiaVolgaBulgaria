import { civicGet } from "./civic";
import { DAO_ADDRESS } from "./config";

export type TreasuryModuleId =
  | "dexlp"
  | "chainwallet"
  | "priv_fund"
  | "treasury_topup"
  | "custom"
  | string;

export type TreasuryModuleEntry = {
  id: TreasuryModuleId;
  kind?: "module" | "fund" | string;
  label: string;
  hint: string;
  codeHash?: string | null;
  needsGuardian?: boolean;
  hubAppId?: string;
  vtypes?: number[];
  address?: string | null;
};

export type TreasuryModulesCatalog = {
  version: number;
  dao?: string | null;
  guardian?: string | null;
  modules: TreasuryModuleEntry[];
};

function normalize(raw: unknown): TreasuryModulesCatalog | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Partial<TreasuryModulesCatalog> & { ok?: boolean };
  if (!Array.isArray(o.modules) || o.modules.length === 0) return null;
  return {
    version: Number(o.version) || 1,
    dao: o.dao ?? null,
    guardian: o.guardian ?? null,
    modules: o.modules as TreasuryModuleEntry[],
  };
}

/** Platform API only — addresses resolved server-side. */
export async function loadTreasuryModules(
  dao = DAO_ADDRESS,
): Promise<{ catalog: TreasuryModulesCatalog; source: "api" }> {
  const j = await civicGet<unknown>(
    `/v1/platform/treasury-modules?dao=${encodeURIComponent(dao)}`,
  );
  const cat = normalize(j);
  if (!cat) throw new Error("treasury_modules_unavailable");
  return { catalog: cat, source: "api" };
}

export function modulesForVtype(modules: TreasuryModuleEntry[], vtype: number): TreasuryModuleEntry[] {
  return modules.filter((m) => !m.vtypes?.length || m.vtypes.includes(vtype));
}
