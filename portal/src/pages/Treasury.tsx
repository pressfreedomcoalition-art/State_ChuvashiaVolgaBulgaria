import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Address, beginCell, toNano } from "@ton/core";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useApp } from "../state/AppState";
import { DAO_ADDRESS } from "../lib/config";
import { formatTon, shortAddr } from "../lib/civic";
import {
  buildChainWalletDeployTx,
  buildDexLpDeployTx,
  chainWalletAddress,
  dexLpAddress,
  fetchConvertStatus,
  fetchTreasuryTxHistory,
  FUND_CONVERT_TON_MIN_PARAM,
  isFundConvertEnabled,
  isModuleAllowed,
  nanoToTon,
  tonscanAccountUrl,
  type ConvertStatus,
  type TreasuryTxRow,
} from "../lib/treasuryOps";
import { isTopupActive } from "../lib/votingCatalog";
import { claimPrivatizationShare } from "../lib/civicActions";
import { loadCabinetCatalog, type CabinetSection } from "../lib/cabinetCatalog";
import { fetchDaoCreator } from "../ton/rpc";
import { ActionError, isTonConnectFail } from "../components/TonConnectRecovery";
import { hasLocalVault } from "../lib/passport";
import { resolveJettonWallet } from "../lib/tonResolve";
import { toJettonUnits } from "../ton/coins";
import {
  buildBindJettonWalletBody,
  buildPausePrivBody,
  buildUnlockPrivBody,
  ensurePrivFundDeployed,
  fetchPrivFundClaimed,
  fetchPrivFundModuleLive,
  privFundDeployedForDao,
  privFundModuleAddress,
  type PrivFundLive,
} from "../ton/privFundModule";

const OP_JETTON_TRANSFER = 0x0f8a7ea5;

type Sub = string;

function createHref(vtype: number, extra: Record<string, string | undefined> = {}) {
  const q = new URLSearchParams({ vtype: String(vtype) });
  for (const [k, v] of Object.entries(extra)) {
    if (v != null && v !== "") q.set(k, v);
  }
  return `/referendums/new?${q.toString()}`;
}

export function Treasury() {
  const { tt, treasury, loading, refresh, params, paramsList, config, wallet: appWallet, citizens } = useApp();
  const wallet = useTonAddress() || appWallet;
  const [ui] = useTonConnectUI();
  const nav = useNavigate();
  const [sub, setSub] = useState<Sub>("hub");
  const [sections, setSections] = useState<CabinetSection[]>([]);
  const [catalogErr, setCatalogErr] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [txRows, setTxRows] = useState<TreasuryTxRow[] | null>(null);
  const [txErr, setTxErr] = useState("");
  const [convertStatus, setConvertStatus] = useState<ConvertStatus | null>(null);
  const [deployMsg, setDeployMsg] = useState("");
  const deployRetryRef = useRef<null | (() => void)>(null);
  /** DexLP / PrivFund guardian = DAO creator (same as dao.blc.cab). */
  const [guardian, setGuardian] = useState("");
  const [privLive, setPrivLive] = useState<PrivFundLive | null>(null);
  const [privClaimed, setPrivClaimed] = useState<boolean | null>(null);
  const [depositAmt, setDepositAmt] = useState("");
  const [privMsg, setPrivMsg] = useState("");
  const [privErr, setPrivErr] = useState("");
  const [copiedFund, setCopiedFund] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const { catalog } = await loadCabinetCatalog();
        if (alive) {
          setSections(catalog.treasurySections);
          setCatalogErr("");
        }
      } catch (e) {
        if (alive) setCatalogErr(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const sectionTitle = (id: string) => sections.find((s) => s.id === id)?.label || id;

  const tonNano = Number(treasury?.ton ?? treasury?.governance ?? NaN);
  const tonHuman = Number.isFinite(tonNano) ? (tonNano > 1e6 ? tonNano / 1e9 : tonNano) : null;
  const jettons = treasury?.jettons || [];
  const tonLabel = tonHuman == null ? "—" : trimNum(tonHuman);

  const convertParam = params.get(FUND_CONVERT_TON_MIN_PARAM);
  const convertOn = isFundConvertEnabled(convertParam);
  const convertMinTon = nanoToTon(Number(convertParam?.numRaw ?? convertParam?.num ?? 0));
  const topupOn = isTopupActive(params);

  const chainAddr = useMemo(() => {
    try {
      return chainWalletAddress(DAO_ADDRESS);
    } catch {
      return "";
    }
  }, []);

  const dexAddr = useMemo(() => {
    if (!guardian) return "";
    try {
      return dexLpAddress(DAO_ADDRESS, guardian);
    } catch {
      return "";
    }
  }, [guardian]);

  const privFundAddr = useMemo(() => {
    if (!guardian) return "";
    try {
      return privFundModuleAddress(DAO_ADDRESS, guardian);
    } catch {
      return "";
    }
  }, [guardian]);

  const chainAllowed = chainAddr ? isModuleAllowed(paramsList, chainAddr) : false;
  const dexAllowed = dexAddr ? isModuleAllowed(paramsList, dexAddr) : false;
  const moduleBound = privFundAddr ? isModuleAllowed(paramsList, privFundAddr) : false;
  const deployed = privFundDeployedForDao(privLive, DAO_ADDRESS);
  const walletBound = !!(privLive?.wallet);
  const unlocked = deployed ? !!privLive?.unlocked : false;
  const amGuardian = !!(wallet && guardian && sameMaster(wallet, guardian));
  const voteMaster = config?.voteJettonMaster || "";
  const fundsOpen = moduleBound || unlocked;

  const loadExtra = useCallback(async () => {
    const creator = await fetchDaoCreator(DAO_ADDRESS).catch(() => null);
    if (creator) setGuardian(creator);
    const fundAddr =
      creator
        ? (() => {
            try {
              return privFundModuleAddress(DAO_ADDRESS, creator);
            } catch {
              return "";
            }
          })()
        : "";

    const [st, hist, live, claimed] = await Promise.all([
      fetchConvertStatus(DAO_ADDRESS).catch(() => null),
      sub === "txHistory"
        ? fetchTreasuryTxHistory(DAO_ADDRESS).catch((e) => {
            setTxErr(e instanceof Error ? e.message : String(e));
            return null;
          })
        : Promise.resolve(null),
      fundAddr ? fetchPrivFundModuleLive(fundAddr).catch(() => null) : Promise.resolve(null),
      fundAddr && wallet
        ? fetchPrivFundClaimed(fundAddr, wallet).catch(() => null)
        : Promise.resolve(null),
    ]);
    setConvertStatus(st);
    setPrivLive(live);
    setPrivClaimed(claimed);
    if (hist) {
      setTxRows(hist);
      setTxErr("");
    }
  }, [sub, wallet]);

  useEffect(() => {
    void loadExtra();
  }, [loadExtra]);

  async function onRefresh() {
    setBusy(true);
    try {
      await refresh();
      await loadExtra();
    } finally {
      setBusy(false);
    }
  }

  async function deployChain() {
    if (!wallet) {
      ui.openModal();
      return;
    }
    deployRetryRef.current = () => void deployChain();
    setDeployMsg("Подтвердите деплой ChainWallet…");
    try {
      const tx = buildChainWalletDeployTx(DAO_ADDRESS);
      await ui.sendTransaction({ validUntil: tx.validUntil, messages: tx.messages });
      setDeployMsg("Отправлено. После подтверждения — приклейте модуль голосом.");
      deployRetryRef.current = null;
    } catch (e) {
      setDeployMsg(e instanceof Error ? e.message : String(e));
    }
  }

  async function deployDex() {
    if (!wallet) {
      ui.openModal();
      return;
    }
    const g = guardian || (await fetchDaoCreator(DAO_ADDRESS).catch(() => null));
    if (!g) {
      setDeployMsg("Не удалось прочитать creator ДАО (guardian для DexLP).");
      return;
    }
    if (!guardian) setGuardian(g);
    deployRetryRef.current = () => void deployDex();
    setDeployMsg("Подтвердите деплой DexLP…");
    try {
      const tx = buildDexLpDeployTx(DAO_ADDRESS, g);
      await ui.sendTransaction({ validUntil: tx.validUntil, messages: tx.messages });
      setDeployMsg("Отправлено. После подтверждения — приклейте vault голосом.");
      deployRetryRef.current = null;
    } catch (e) {
      setDeployMsg(e instanceof Error ? e.message : String(e));
    }
  }

  async function advancePriv() {
    if (!wallet) {
      ui.openModal();
      return;
    }
    const g = guardian || (await fetchDaoCreator(DAO_ADDRESS).catch(() => null));
    if (!g) {
      setPrivErr("Не удалось прочитать creator ДАО (guardian фонда).");
      return;
    }
    if (!guardian) setGuardian(g);
    const fundAddr = privFundModuleAddress(DAO_ADDRESS, g);
    setBusy(true);
    setPrivMsg("");
    setPrivErr("");
    try {
      if (!moduleBound) {
        setPrivMsg("Деплой PrivFundModule…");
        let bindJw: string | undefined;
        if (voteMaster && amGuardian) {
          try {
            bindJw = await resolveJettonWallet(voteMaster, fundAddr);
          } catch {
            /* optional */
          }
        }
        await ensurePrivFundDeployed({
          dao: DAO_ADDRESS,
          guardian: g,
          sendTransaction: (tx) => ui.sendTransaction(tx as never),
          bindWallet: bindJw,
        });
        await loadExtra();
        setPrivMsg("Модуль готов — создайте голос приклейки.");
        nav(
          createHref(30, {
            item: "priv-activate",
            module: fundAddr,
            modCatalogId: "custom",
            ensurePrivFund: "1",
            title: "Активировать фонд приватизации",
          }),
        );
        return;
      }

      if (!walletBound) {
        if (!voteMaster) {
          setPrivErr("Нет vote jetton master в конфиге ДАО.");
          return;
        }
        const jw = await resolveJettonWallet(voteMaster, fundAddr);
        if (amGuardian) {
          await ui.sendTransaction({
            validUntil: Math.floor(Date.now() / 1000) + 600,
            messages: [
              {
                address: fundAddr,
                amount: toNano("0.05").toString(),
                payload: buildBindJettonWalletBody(jw).toBoc().toString("base64"),
              },
            ],
          });
          setPrivMsg("Jetton-кошелёк привязан.");
          await loadExtra();
          return;
        }
        nav(
          createHref(31, {
            item: "priv-bind",
            module: fundAddr,
            modCatalogId: "custom",
            exec: "forward",
            dest: fundAddr,
            body: buildBindJettonWalletBody(jw).toBoc().toString("base64"),
            ensurePrivFund: "1",
            title: "Привязать jetton-кошелёк фонда",
          }),
        );
        return;
      }

      const n = citizens != null && citizens > 0 ? citizens : 0;
      if (!(n > 0)) {
        setPrivErr("Нужно число граждан (> 0) для запуска раздачи.");
        return;
      }
      nav(
        createHref(31, {
          item: "priv-start",
          module: fundAddr,
          modCatalogId: "custom",
          exec: "forward",
          dest: fundAddr,
          body: buildUnlockPrivBody(n).toBoc().toString("base64"),
          ensurePrivFund: "1",
          title: unlocked ? "Новый раунд приватизации" : "Запустить раздачу приватизации",
        }),
      );
    } catch (e) {
      setPrivErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onDepositPriv() {
    if (!wallet) {
      ui.openModal();
      return;
    }
    if (!privFundAddr || !voteMaster) {
      setPrivErr("Нет адреса фонда или vote jetton.");
      return;
    }
    const amount = Number(String(depositAmt).replace(",", "."));
    if (!(amount > 0)) {
      setPrivErr("Укажите сумму депозита.");
      return;
    }
    setBusy(true);
    setPrivMsg("");
    setPrivErr("");
    try {
      const decimals = 9;
      const userWallet = await resolveJettonWallet(voteMaster, wallet);
      const amountNano = toJettonUnits(amount, decimals);
      const body = beginCell()
        .storeUint(OP_JETTON_TRANSFER, 32)
        .storeUint(0, 64)
        .storeCoins(amountNano)
        .storeAddress(Address.parse(privFundAddr))
        .storeAddress(Address.parse(wallet))
        .storeBit(false)
        .storeCoins(toNano("0.05"))
        .storeBit(false)
        .endCell();
      await ui.sendTransaction({
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: userWallet,
            amount: toNano("0.08").toString(),
            payload: body.toBoc().toString("base64"),
          },
        ],
      });
      setDepositAmt("");
      setPrivMsg("Депозит отправлен.");
      await loadExtra();
    } catch (e) {
      setPrivErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onClaimPriv() {
    if (!wallet) {
      ui.openModal();
      return;
    }
    if (!privFundAddr || !unlocked) return;
    setBusy(true);
    setPrivMsg("");
    setPrivErr("");
    try {
      await claimPrivatizationShare({
        tonConnectUI: ui,
        wallet,
        fund: privFundAddr,
      });
      setPrivMsg(tt("fundsClaimSent"));
      await loadExtra();
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      if (/claimed/i.test(m)) setPrivErr(tt("fundsAlreadyClaimed"));
      else setPrivErr(m);
    } finally {
      setBusy(false);
    }
  }

  function privStatusText() {
    if (!guardian) return "Читаем creator ДАО…";
    if (!moduleBound) return "Фонд не приклеен. Любой кошелёк может задеплоить модуль и создать голос активации.";
    if (!walletBound) return "Модуль приклеен — нужна привязка jetton-кошелька фонда.";
    if (!unlocked) return "Кошелёк привязан — пополните фонд и запустите раздачу голосом.";
    return "Раздача активна — граждане могут забрать долю.";
  }

  function primaryPrivLabel() {
    if (!moduleBound) return "＋ Активировать фонд";
    if (!walletBound) return amGuardian ? "Привязать jetton-кошелёк" : "Голос: привязать кошелёк";
    return unlocked ? "Новый раунд" : "Запустить раздачу";
  }

  return (
    <div className="stack">
      <h1 className="page-title">
        {sub === "hub" ? tt("treasury") : sectionTitle(sub)}
      </h1>
      {sub !== "hub" ? (
        <button type="button" className="btn btn-ghost" style={{ alignSelf: "flex-start" }} onClick={() => setSub("hub")}>
          ← {tt("treasury")}
        </button>
      ) : (
        <button
          className="btn btn-ghost"
          style={{ alignSelf: "flex-start" }}
          disabled={busy || loading}
          onClick={() => void onRefresh()}
        >
          {tt("reload")}
        </button>
      )}
      <p className="muted">{tt("treasuryLead")}</p>
      {loading && !treasury ? <p className="muted">{tt("loading")}</p> : null}

      {sub === "hub" && (
        <>
          {catalogErr ? <p style={{ color: "var(--maroon)" }}>{catalogErr}</p> : null}
          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            {sections.map((s) => {
              let suffix = "";
              if (s.id === "funds" && (fundsOpen || topupOn)) suffix = " · вкл";
              if (s.id === "convert") {
                suffix = convertOn ? ` · ≥${trimNum(convertMinTon)} TON` : " · выкл";
              }
              return (
                <button key={s.id} type="button" className="btn btn-ghost" onClick={() => setSub(s.id)}>
                  {s.label}
                  {suffix}
                </button>
              );
            })}
          </div>

          <div className="card stack">
            <h3 style={{ margin: 0 }}>Балансы</h3>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div>
                <strong>TON</strong>
                <div style={{ fontSize: 24 }}>{tonLabel}</div>
              </div>
            </div>
            {jettons.map((j) => (
              <div
                key={j.master || j.symbol}
                className="row"
                style={{ justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}
              >
                <div>
                  <strong>{j.symbol || "JETTON"}</strong>
                  <div>
                    {typeof j.amount === "number"
                      ? j.amount.toLocaleString("ru-RU", { maximumFractionDigits: 6 })
                      : String(j.amount ?? "—")}
                  </div>
                </div>
                <Link
                  className="btn btn-primary"
                  to={createHref(1, {
                    amount: String(j.amount ?? ""),
                    wallet: j.wallet,
                    decimals: String(j.decimals ?? 9),
                    master: j.master,
                    title: `Выплата ${j.symbol || "jetton"}`,
                  })}
                >
                  Вывести
                </Link>
              </div>
            ))}
            {!loading && !jettons.length && !(tonHuman != null && tonHuman > 0) ? (
              <p className="muted">{tt("treasuryEmpty")}</p>
            ) : null}
          </div>

          <div className="card stack">
            <h3 style={{ margin: 0 }}>DAO</h3>
            <p style={{ margin: 0 }}>{shortAddr(DAO_ADDRESS, 10, 8)}</p>
            <p className="muted" style={{ margin: 0 }}>
              {formatTon(treasury?.ton ?? treasury?.governance)}
            </p>
            <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
              <button
                className="btn btn-ghost"
                onClick={async () => {
                  await navigator.clipboard.writeText(DAO_ADDRESS);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
              >
                {copied ? tt("copied") : tt("copy")}
              </button>
              <a className="btn btn-ghost" href={tonscanAccountUrl()} target="_blank" rel="noreferrer">
                Explorer
              </a>
              <Link className="btn btn-primary" to="/referendums/new?vtype=1">
                {tt("createVote")}
              </Link>
            </div>
          </div>
        </>
      )}

      {sub === "funds" && (
        <div className="card stack">
          <h3 style={{ margin: 0 }}>Приватизация</h3>
          <p className="muted" style={{ margin: 0 }}>
            {privStatusText()}
          </p>
          {privFundAddr ? (
            <p style={{ margin: 0, wordBreak: "break-all" }}>
              PrivFundModule: <code>{shortAddr(privFundAddr, 10, 8)}</code>
              {" · "}
              {moduleBound ? <span style={{ color: "var(--ok)" }}>приклеен</span> : <span>не приклеен</span>}
              {deployed ? ` · баланс ${trimNum((privLive?.balance ?? 0) / 1e9)}` : null}
              {unlocked ? " · раздача" : null}
            </p>
          ) : null}
          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy || (!moduleBound ? false : !walletBound && !voteMaster)}
              onClick={() => void advancePriv()}
            >
              {primaryPrivLabel()}
            </button>
            {moduleBound ? (
              <Link
                className="btn btn-ghost"
                to={createHref(30, {
                  item: "priv-stop",
                  module: privFundAddr,
                  modCatalogId: "custom",
                  deny: "1",
                  ensurePrivFund: "1",
                  title: "Отклеить фонд приватизации",
                })}
              >
                Отклеить
              </Link>
            ) : null}
            {moduleBound && unlocked ? (
              <Link
                className="btn btn-ghost"
                to={createHref(31, {
                  item: "priv-pause",
                  module: privFundAddr,
                  modCatalogId: "custom",
                  exec: "forward",
                  dest: privFundAddr,
                  body: buildPausePrivBody().toBoc().toString("base64"),
                  ensurePrivFund: "1",
                  title: "Пауза раздачи",
                })}
              >
                Пауза
              </Link>
            ) : null}
            {unlocked && privFundAddr ? (
              <button
                className="btn btn-primary"
                disabled={busy || !wallet || !hasLocalVault() || privClaimed === true}
                data-testid="priv-claim"
                onClick={() => void onClaimPriv()}
              >
                {privClaimed ? tt("fundsAlreadyClaimed") : tt("fundsClaimShare")}
              </button>
            ) : null}
          </div>
          {moduleBound && walletBound ? (
            <div className="stack" style={{ gap: 6 }}>
              <p className="muted" style={{ margin: 0 }}>
                Пополните фонд jetton’ом ДАО, затем запустите раздачу.
              </p>
              <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={async () => {
                    await navigator.clipboard.writeText(privFundAddr);
                    setCopiedFund(true);
                    setTimeout(() => setCopiedFund(false), 1500);
                  }}
                >
                  {copiedFund ? tt("copied") : "Копировать адрес фонда"}
                </button>
              </div>
              <label>
                Сумма депозита
                <input
                  value={depositAmt}
                  inputMode="decimal"
                  placeholder="0"
                  onChange={(e) => setDepositAmt(e.target.value)}
                  style={{ display: "block", width: "100%", marginTop: 4, padding: 10, borderRadius: 10, border: "1px solid var(--line)", boxSizing: "border-box" }}
                />
              </label>
              <button type="button" className="btn btn-ghost" disabled={busy || !wallet} onClick={() => void onDepositPriv()}>
                Пополнить фонд
              </button>
            </div>
          ) : null}
          {unlocked ? <p className="muted" style={{ margin: 0 }}>{tt("fundsClaimHint")}</p> : null}
          {privMsg ? <p style={{ color: "var(--ok)", margin: 0 }}>{privMsg}</p> : null}
          {privErr ? <p style={{ color: "var(--maroon)", margin: 0 }}>{privErr}</p> : null}

          <h3 style={{ margin: "16px 0 0" }}>Автопополнение казны</h3>
          <p className="muted" style={{ margin: 0 }}>
            {topupOn
              ? "Параметр fund.topup.* задан — автопополнение активно."
              : "Периодическое пополнение казны (% или фикс) — как в основном DAO."}
          </p>
          {!topupOn ? (
            <Link
              className="btn btn-primary"
              to={createHref(14, { item: "topup-create", title: "Автопополнение казны", topupMode: "pct", topupAmount: "1" })}
            >
              Включить автопополнение
            </Link>
          ) : (
            <Link className="btn btn-ghost" to={createHref(14, { item: "topup-create", title: "Изменить автопополнение" })}>
              Изменить параметры
            </Link>
          )}
        </div>
      )}

      {sub === "convert" && (
        <div className="card stack">
          {!convertOn ? (
            <>
              <p className="muted">Автоконверт жетона ДАО → TON, когда баланс TON ниже порога.</p>
              <Link className="btn btn-primary" to={createHref(18, { minTon: "1", title: "Включить автоконверт" })}>
                Включить автоконверт
              </Link>
            </>
          ) : (
            <>
              <p>
                Порог: <strong>{trimNum(convertMinTon)} TON</strong>
                {tonHuman != null && tonHuman < convertMinTon ? (
                  <span style={{ color: "var(--maroon)" }}> · сейчас {trimNum(tonHuman)} TON — ниже порога</span>
                ) : null}
              </p>
              <Link
                className="btn btn-ghost"
                to={createHref(18, { minTon: String(convertMinTon || 1), title: "Изменить порог конверта" })}
              >
                Изменить порог
              </Link>
              <p className="muted">
                Hot-wallet: {convertStatus?.hotWallet ? shortAddr(convertStatus.hotWallet, 8, 6) : "—"}
                {convertStatus?.auto ? " · авто вкл" : " · авто выкл / неизвестно"}
              </p>
              <Link
                className="btn btn-primary"
                to={createHref(20, {
                  to: convertStatus?.hotWallet,
                  wallet: jettons.find((j) => j.master && config?.voteJettonMaster && sameMaster(j.master, config.voteJettonMaster))
                    ?.wallet,
                  decimals: String(
                    jettons.find((j) => j.master && config?.voteJettonMaster && sameMaster(j.master, config.voteJettonMaster))
                      ?.decimals ?? 9,
                  ),
                  amount: "100",
                  title: "Буфер конверта",
                })}
              >
                Пополнить буфер
              </Link>
            </>
          )}
        </div>
      )}

      {sub === "txHistory" && (
        <div className="card stack">
          <a className="btn btn-ghost" href={tonscanAccountUrl()} target="_blank" rel="noreferrer" style={{ alignSelf: "flex-start" }}>
            Открыть в explorer
          </a>
          {txErr ? <p style={{ color: "var(--maroon)" }}>{txErr}</p> : null}
          {txRows == null && !txErr ? <p className="muted">{tt("loading")}</p> : null}
          {txRows?.length === 0 ? <p className="muted">Нет событий</p> : null}
          {txRows?.map((r) => (
            <div key={r.id} style={{ borderTop: "1px solid var(--line)", paddingTop: 8 }}>
              <div className="row" style={{ justifyContent: "space-between", gap: 8 }}>
                <strong style={{ color: r.failed ? "var(--maroon)" : undefined }}>{r.title}</strong>
                <span className="muted" style={{ fontSize: 12 }}>
                  {r.at ? new Date(r.at * 1000).toLocaleString("ru-RU") : ""}
                </span>
              </div>
              {r.amount ? <div>{r.amount}</div> : null}
              {r.detail ? <p className="muted" style={{ margin: "4px 0 0" }}>{r.detail}</p> : null}
            </div>
          ))}
        </div>
      )}

      {sub === "dexlp" && (
        <div className="card stack">
          <p className="muted">LP-vault (DeDust / TONCO): деплой → приклеить → исполнение через голоса.</p>
          {!guardian ? <p className="muted">Читаем creator ДАО (guardian vault)…</p> : null}
          {dexAddr ? (
            <p>
              Vault: <code style={{ wordBreak: "break-all" }}>{shortAddr(dexAddr, 10, 8)}</code>
              {" · "}
              {dexAllowed ? <span style={{ color: "var(--ok)" }}>приклеен</span> : <span>не приклеен</span>}
            </p>
          ) : null}
          {!dexAllowed ? (
            <button type="button" className="btn btn-ghost" onClick={() => void deployDex()}>
              Деплой DexLP (~0.05 TON)
            </button>
          ) : null}
          {dexAddr && !dexAllowed ? (
            <Link
              className="btn btn-primary"
              to={createHref(30, { module: dexAddr, title: "Приклеить DexLP" })}
            >
              Приклеить DexLP
            </Link>
          ) : null}
          {dexAddr && dexAllowed ? (
            <Link
              className="btn btn-primary"
              to={createHref(31, { module: dexAddr, exec: "returnTon", title: "Исполнить на DexLP" })}
            >
              Исполнить на DexLP
            </Link>
          ) : null}
          {dexAddr && dexAllowed ? (
            <Link className="btn btn-ghost" to={createHref(30, { module: dexAddr, deny: "1", title: "Отклеить DexLP" })}>
              Отклеить
            </Link>
          ) : null}
          {deployMsg && isTonConnectFail(deployMsg) ? (
            <ActionError
              error={deployMsg}
              onRetry={deployRetryRef.current ? () => deployRetryRef.current?.() : undefined}
              onDismiss={() => {
                setDeployMsg("");
                deployRetryRef.current = null;
              }}
            />
          ) : deployMsg ? (
            <p className="muted">{deployMsg}</p>
          ) : null}
        </div>
      )}

      {sub === "trc20" && (
        <div className="card stack">
          <p className="muted">Мультивалютная казна: выплаты USDT TRC-20.</p>
          {chainAddr ? (
            <p>
              ChainWallet: <code style={{ wordBreak: "break-all" }}>{shortAddr(chainAddr, 10, 8)}</code>
              {" · "}
              {chainAllowed ? <span style={{ color: "var(--ok)" }}>приклеен</span> : <span>не приклеен</span>}
            </p>
          ) : null}
          {!chainAllowed ? (
            <button type="button" className="btn btn-ghost" onClick={() => void deployChain()}>
              Деплой ChainWallet (~0.15 TON)
            </button>
          ) : null}
          {chainAddr && !chainAllowed ? (
            <Link
              className="btn btn-primary"
              to={createHref(30, { module: chainAddr, title: "Приклеить ChainWallet" })}
            >
              Приклеить ChainWallet
            </Link>
          ) : null}
          {chainAddr && chainAllowed ? (
            <Link
              className="btn btn-primary"
              to={createHref(32, { module: chainAddr, title: "Выплата USDT TRC-20" })}
            >
              Выплатить USDT
            </Link>
          ) : (
            <p className="muted">Сначала приклейте модуль, затем доступна выплата.</p>
          )}
          {deployMsg && isTonConnectFail(deployMsg) ? (
            <ActionError
              error={deployMsg}
              onRetry={deployRetryRef.current ? () => deployRetryRef.current?.() : undefined}
              onDismiss={() => {
                setDeployMsg("");
                deployRetryRef.current = null;
              }}
            />
          ) : deployMsg ? (
            <p className="muted">{deployMsg}</p>
          ) : null}
        </div>
      )}

      {(sub === "eth" || sub === "btc" || sub === "xmr") && (
        <div className="card">
          <p className="muted">Сеть {sectionTitle(sub)} — скоро. Сейчас доступны TON-казна, конверт, DexLP и USDT TRC-20.</p>
        </div>
      )}
    </div>
  );
}

function trimNum(n: number) {
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 4 });
}

function sameMaster(a: string, b: string) {
  try {
    return Address.parse(a).equals(Address.parse(b));
  } catch {
    return a === b;
  }
}
