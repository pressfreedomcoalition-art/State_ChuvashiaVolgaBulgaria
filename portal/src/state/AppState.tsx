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
import { CABINET_LOGO, DAO_ADDRESS } from "../lib/config";
import {
  cacheGet,
  civicGet,
  paramMap,
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
import { loadTreasury } from "../lib/treasury";
import { loadDaoParams } from "../lib/daoParams";
import { loadVotings } from "../lib/votings";
import { applyLang, resolveInitialLang, t, type I18nVars, type Lang } from "../lib/i18n";
import { readCitizenFlag, writeCitizenFlag } from "../lib/authGate";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  tt: (key: string, vars?: I18nVars) => string;
  wallet: string;
  name: string;
  logo: string;
  shortUrl: string;
  params: Map<string, DaoParam>;
  /** Raw params list (preserves duplicate keys like multiple mod.allow). */
  paramsList: DaoParam[];
  config: DaoConfig | null;
  citizens: number | null;
  votings: VotingRow[];
  treasury: TreasurySnap | null;
  deputies: DeputyCard[];
  health: HealthSnap | null;
  kyc: KycTariff | null;
  loading: boolean;
  error: string;
  refresh: (opts?: { forceVotings?: boolean }) => Promise<void>;
  loadVoting: (addr: string) => Promise<VotingState | null>;
  eligible: boolean | null;
  setEligible: (v: boolean | null) => void;
  /** CHV citizenship after Face ID / restore (gates sidebar). */
  isCitizen: boolean | null;
  setIsCitizen: (v: boolean | null) => void;
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
  const [lang, setLangState] = useState<Lang>(() => {
    const initial = resolveInitialLang();
    applyLang(initial);
    return initial;
  });
  const setLang = useCallback((l: Lang) => {
    applyLang(l, true);
    setLangState(l);
  }, []);
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
  const [isCitizen, setIsCitizenState] = useState<boolean | null>(() => readCitizenFlag());

  const setIsCitizen = useCallback((v: boolean | null) => {
    writeCitizenFlag(v);
    setIsCitizenState(v);
  }, []);

  useEffect(() => {
    applyLang(lang);
  }, [lang]);

  useEffect(() => {
    if (typeof localStorage !== "undefined" && localStorage.getItem("chv-lang-user") === "1") return;
    const fromTg = resolveInitialLang();
    if (fromTg !== lang) setLangState(fromTg);
    // Re-read Telegram language if the WebApp object appears after first paint.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (eligible == null) sessionStorage.removeItem("chv-elig");
    else sessionStorage.setItem("chv-elig", eligible ? "1" : "0");
  }, [eligible]);

  const refresh = useCallback(async (opts?: { forceVotings?: boolean }) => {
    setLoading(true);
    setError("");
    try {
      const force = !!opts?.forceVotings;
      // Each loader is isolated — a dead cache tunnel must not wipe referendums.
      const [cfg, par, count, votes, treas, deps, hl, tariff] = await Promise.all([
        cacheGet<DaoConfig>(`daoConfig:${DAO_ADDRESS}`).catch(() => null),
        loadDaoParams(DAO_ADDRESS, { force }).catch(() => [] as DaoParam[]),
        civicGet<{ count?: number }>(`/v1/citizenship/count?dao=${DAO_ADDRESS}`).catch(() => null),
        loadVotings(DAO_ADDRESS, { force }).catch(() => [] as VotingRow[]),
        loadTreasury(DAO_ADDRESS).catch(() => null),
        cacheGet<unknown>(`deputyProfiles:${DAO_ADDRESS}`).catch(() => null),
        civicGet<HealthSnap>("/health").catch(() => null),
        civicGet<KycTariff>("/v1/platform/kyc-tariff").catch(() => null),
      ]);
      setConfig(cfg);
      setParams(par);
      setCitizens(count?.count ?? null);
      setVotings(votes);
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
  const logo = CABINET_LOGO;
  const shortUrl = pmap.get("short_url")?.str || "CHV";

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      tt: (key, vars) => t(lang, key, vars),
      wallet,
      name,
      logo,
      shortUrl,
      params: pmap,
      paramsList: params,
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
      isCitizen,
      setIsCitizen,
    }),
    [
      lang,
      wallet,
      name,
      logo,
      shortUrl,
      pmap,
      params,
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
      isCitizen,
      setIsCitizen,
      setLang,
    ],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp outside provider");
  return ctx;
}
