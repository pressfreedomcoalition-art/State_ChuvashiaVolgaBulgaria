import { civicGet } from "./civic";
import { DAO_ADDRESS } from "./config";
import { chainWalletAddress, dexLpAddress } from "./treasuryOps";
import { fetchDaoCreator } from "../ton/rpc";

export type TreasuryModuleId = "dexlp" | "chainwallet" | "custom" | string;

export type TreasuryModuleEntry = {
  id: TreasuryModuleId;
  label: string;
  hint: string;
  codeHash?: string | null;
  needsGuardian?: boolean;
  vtypes?: number[];
  address?: string | null;
};

export type TreasuryModulesCatalog = {
  version: number;
  dao?: string | null;
  guardian?: string | null;
  modules: TreasuryModuleEntry[];
};

/** Bundled fallback when civic API is unreachable. */
export const BUNDLED_TREASURY_MODULES: TreasuryModuleEntry[] = [
  {
    id: "dexlp",
    label: "DexLP",
    hint: "DeDust LP vault · guardian = creator DAO",
    needsGuardian: true,
    vtypes: [30, 31],
  },
  {
    id: "chainwallet",
    label: "ChainWallet (USDT TRC-20)",
    hint: "Мультивалютная казна · payout vtype 32",
    needsGuardian: false,
    vtypes: [30, 31, 32],
  },
  {
    id: "custom",
    label: "Свой модуль",
    hint: "Любой EQ… на шине mod.allow / mod.exec",
    needsGuardian: false,
    vtypes: [30, 31, 32],
  },
];

async function resolveLocalAddresses(
  modules: TreasuryModuleEntry[],
  dao: string,
): Promise<{ modules: TreasuryModuleEntry[]; guardian: string | null }> {
  let guardian: string | null = null;
  try {
    guardian = await fetchDaoCreator(dao);
  } catch {
    guardian = null;
  }
  const out = modules.map((m) => {
    if (m.address) return m;
    if (m.id === "chainwallet") {
      try {
        return { ...m, address: chainWalletAddress(dao) };
      } catch {
        return m;
      }
    }
    if (m.id === "dexlp" && guardian) {
      try {
        return { ...m, address: dexLpAddress(dao, guardian) };
      } catch {
        return m;
      }
    }
    return m;
  });
  return { modules: out, guardian };
}

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

/** Prefer platform API; fall back to bundled + local address derivation. */
export async function loadTreasuryModules(
  dao = DAO_ADDRESS,
): Promise<{ catalog: TreasuryModulesCatalog; source: "api" | "bundle" }> {
  try {
    const j = await civicGet<unknown>(
      `/v1/platform/treasury-modules?dao=${encodeURIComponent(dao)}`,
    );
    const cat = normalize(j);
    if (cat) {
      const needsLocal = cat.modules.some(
        (m) => (m.id === "dexlp" || m.id === "chainwallet") && !m.address,
      );
      if (needsLocal) {
        const { modules, guardian } = await resolveLocalAddresses(cat.modules, dao);
        return {
          catalog: { ...cat, modules, guardian: cat.guardian || guardian },
          source: "api",
        };
      }
      return { catalog: cat, source: "api" };
    }
  } catch {
    /* bundle */
  }
  const { modules, guardian } = await resolveLocalAddresses(BUNDLED_TREASURY_MODULES, dao);
  return {
    catalog: { version: 1, dao, guardian, modules },
    source: "bundle",
  };
}

export function modulesForVtype(modules: TreasuryModuleEntry[], vtype: number): TreasuryModuleEntry[] {
  return modules.filter((m) => !m.vtypes?.length || m.vtypes.includes(vtype));
}
