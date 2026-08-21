import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useTonAddress } from "@tonconnect/ui-react";
import { DAO_ADDRESS } from "../lib/config";
import {
  cacheGet,
  civicGet,
  paramMap,
  pickLogo,
  pickName,
  type DaoConfig,
  type DaoParam,
  type DeputyCard,
  type HealthSnap,
  type KycTariff,
  type TreasurySnap,
  type VotingRow,
  type VotingState,
} from "../lib/civic";
import { t, type Lang } from "../lib/i18n";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  tt: (key: string) => string;
  wallet: string;
  name: string;
  logo: string;
  shortUrl: string;
  params: Map<string, DaoParam>;
  config: DaoConfig | null;
  citizens: number | null;
  votings: VotingRow[];
  treasury: TreasurySnap | null;
  deputies: DeputyCard[];
  health: HealthSnap | null;
  kyc: KycTariff | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  loadVoting: (addr: string) => Promise<VotingState | null>;
  eligible: boolean | null;
  setEligible: (v: boolean | null) => void;
};

const AppCtx = createContext<Ctx | null>(null);

function asList<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v && typeof v === "object" && Array.isArray((v as { items?: unknown[] }).items)) {
    return (v as { items: T[] }).items;
  }
  return [];
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const wallet = useTonAddress();
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("chv-lang") as Lang) || "ru");
  const [config, setConfig] = useState<DaoConfig | null>(null);
  const [params, setParams] = useState<DaoParam[]>([]);
  const [citizens, setCitizens] = useState<number | null>(null);
  const [votings, setVotings] = useState<VotingRow[]>([]);
  const [treasury, setTreasury] = useState<TreasurySnap | null>(null);
  const [deputies, setDeputies] = useState<DeputyCard[]>([]);
  const [health, setHealth] = useState<HealthSnap | null>(null);
  const [kyc, setKyc] = useState<KycTariff | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [eligible, setEligible] = useState<boolean | null>(() => {
    const raw = sessionStorage.getItem("chv-elig");
    if (raw === "1") return true;
    if (raw === "0") return false;
    return null;
  });

  useEffect(() => {
    localStorage.setItem("chv-lang", lang);
  }, [lang]);

  useEffect(() => {
    if (eligible == null) sessionStorage.removeItem("chv-elig");
    else sessionStorage.setItem("chv-elig", eligible ? "1" : "0");
  }, [eligible]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [cfg, par, count, votes, treas, deps, hl, tariff] = await Promise.all([
        cacheGet<DaoConfig>(`daoConfig:${DAO_ADDRESS}`),
        cacheGet<DaoParam[]>(`params:${DAO_ADDRESS}`),
        civicGet<{ count?: number }>(`/v1/citizenship/count?dao=${DAO_ADDRESS}`).catch(() => null),
        cacheGet<unknown>(`votings:${DAO_ADDRESS}`),
        cacheGet<TreasurySnap>(`treasury:${DAO_ADDRESS}`),
        cacheGet<unknown>(`deputyProfiles:${DAO_ADDRESS}`),
        civicGet<HealthSnap>("/health").catch(() => null),
        civicGet<KycTariff>("/v1/platform/kyc-tariff").catch(() => null),
      ]);
      setConfig(cfg);
      setParams(par || []);
      setCitizens(count?.count ?? null);
      setVotings(asList<VotingRow>(votes));
      setTreasury(treas);
      setDeputies(asList<DeputyCard>(deps));
      setHealth(hl);
      setKyc(tariff);
    } catch (e) {
      setError(e instanceof Error ? e.message : "load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const loadVoting = useCallback(async (addr: string) => {
    const [state, meta] = await Promise.all([
      cacheGet<VotingState>(`votingState:${addr}`),
      cacheGet<VotingState>(`votingMeta:${addr}`),
    ]);
    if (!state && !meta) return null;
    return { ...meta, ...state };
  }, []);

  const pmap = useMemo(() => paramMap(params), [params]);
  const name = pickName(config, pmap);
  const logo = pickLogo(config);
  const shortUrl = pmap.get("short_url")?.str || "CHV";

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      tt: (key) => t(lang, key),
      wallet,
      name,
      logo,
      shortUrl,
      params: pmap,
      config,
      citizens,
      votings,
      treasury,
      deputies,
      health,
      kyc,
      loading,
      error,
      refresh,
      loadVoting,
      eligible,
      setEligible,
    }),
    [
      lang,
      wallet,
      name,
      logo,
      shortUrl,
      pmap,
      config,
      citizens,
      votings,
      treasury,
      deputies,
      health,
      kyc,
      loading,
      error,
      refresh,
      loadVoting,
      eligible,
    ],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp outside provider");
  return ctx;
}
