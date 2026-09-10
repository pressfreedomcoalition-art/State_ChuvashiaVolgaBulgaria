import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Address } from "@ton/core";
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
import { isPrivFundEnabled, isTopupActive } from "../lib/votingCatalog";
import { fetchDaoCreator, fetchPrivatizationStatus } from "../ton/rpc";
import { ActionError, isTonConnectFail } from "../components/TonConnectRecovery";

type Sub = "hub" | "convert" | "txHistory" | "dexlp" | "trc20" | "eth" | "btc" | "xmr" | "funds";

const SUB_TITLE: Record<Exclude<Sub, "hub">, string> = {
  convert: "Конверт",
  txHistory: "История",
  dexlp: "DexLP",
  trc20: "USDT TRC-20",
  eth: "ETH",
  btc: "BTC",
  xmr: "XMR",
  funds: "Фонды",
};

function createHref(vtype: number, extra: Record<string, string | undefined> = {}) {
  const q = new URLSearchParams({ vtype: String(vtype) });
  for (const [k, v] of Object.entries(extra)) {
    if (v != null && v !== "") q.set(k, v);
  }
  return `/referendums/new?${q.toString()}`;
}

export function Treasury() {
  const { tt, treasury, loading, refresh, params, paramsList, config, wallet: appWallet } = useApp();
  const wallet = useTonAddress() || appWallet;
  const [ui] = useTonConnectUI();
  const [sub, setSub] = useState<Sub>("hub");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const [txRows, setTxRows] = useState<TreasuryTxRow[] | null>(null);
  const [txErr, setTxErr] = useState("");
  const [convertStatus, setConvertStatus] = useState<ConvertStatus | null>(null);
  const [deployMsg, setDeployMsg] = useState("");
  const deployRetryRef = useRef<null | (() => void)>(null);
  /** DexLP guardian = DAO creator (same as dao.blc.cab), not the visitor wallet. */
  const [guardian, setGuardian] = useState("");
  const [privStatus, setPrivStatus] = useState<{ fund: string | null; live: boolean }>({
    fund: null,
    live: false,
  });

  const tonNano = Number(treasury?.ton ?? treasury?.governance ?? NaN);
  const tonHuman = Number.isFinite(tonNano) ? (tonNano > 1e6 ? tonNano / 1e9 : tonNano) : null;
  const jettons = treasury?.jettons || [];
  const tonLabel = tonHuman == null ? "—" : trimNum(tonHuman);

  const convertParam = params.get(FUND_CONVERT_TON_MIN_PARAM);
  const convertOn = isFundConvertEnabled(convertParam);
  const convertMinTon = nanoToTon(Number(convertParam?.numRaw ?? convertParam?.num ?? 0));
  const privFundOn = isPrivFundEnabled(params);
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

  const chainAllowed = chainAddr ? isModuleAllowed(paramsList, chainAddr) : false;
  const dexAllowed = dexAddr ? isModuleAllowed(paramsList, dexAddr) : false;

  const loadExtra = useCallback(async () => {
    const [st, hist, creator, priv] = await Promise.all([
      fetchConvertStatus(DAO_ADDRESS).catch(() => null),
      sub === "txHistory" ? fetchTreasuryTxHistory(DAO_ADDRESS).catch((e) => {
        setTxErr(e instanceof Error ? e.message : String(e));
        return null;
      }) : Promise.resolve(null),
      fetchDaoCreator(DAO_ADDRESS).catch(() => null),
      fetchPrivatizationStatus(DAO_ADDRESS).catch(() => ({ fund: null, live: false })),
    ]);
    setConvertStatus(st);
    if (creator) setGuardian(creator);
    setPrivStatus(priv);
    if (hist) {
      setTxRows(hist);
      setTxErr("");
    }
  }, [sub]);

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

  return (
    <div className="stack">
      <h1 className="page-title">
        {sub === "hub" ? tt("treasury") : SUB_TITLE[sub]}
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
          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setSub("funds")}>
              Фонды
              {privFundOn || topupOn ? " · вкл" : ""}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setSub("convert")}>
              {convertOn ? `Конверт · ≥${trimNum(convertMinTon)} TON` : "Конверт · выкл"}
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setSub("txHistory")}>
              История
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setSub("dexlp")}>
              DexLP
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setSub("trc20")}>
              TRC-20
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setSub("eth")}>
              ETH
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setSub("btc")}>
              BTC
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => setSub("xmr")}>
              XMR
            </button>
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
            {!privFundOn
              ? "Модуль выключен (нет hub.on.priv_fund)."
              : privStatus.live
                ? "Фонд разблокирован — приватизация активна."
                : privStatus.fund
                  ? "Модуль включён, фонд задеплоен — нужна разблокировка (vtype 7)."
                  : "Модуль включён — дождитесь деплоя child-контракта фонда."}
          </p>
          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            {!privFundOn ? (
              <Link
                className="btn btn-primary"
                to={createHref(11, {
                  item: "priv-enable",
                  hubAppMode: "enable",
                  hubAppId: "priv_fund",
                  title: "Включить приватизацию",
                })}
              >
                Включить приватизацию
              </Link>
            ) : (
              <>
                {privStatus.fund && !privStatus.live ? (
                  <Link className="btn btn-primary" to={createHref(7, { item: "priv-unlock", title: "Разблокировать приватизацию" })}>
                    Разблокировать
                  </Link>
                ) : null}
                <Link
                  className="btn btn-ghost"
                  to={createHref(11, {
                    item: "priv-disable",
                    hubAppMode: "disable",
                    hubAppId: "priv_fund",
                    title: "Выключить приватизацию",
                  })}
                >
                  Выключить
                </Link>
              </>
            )}
          </div>

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
          <p className="muted">Сеть {SUB_TITLE[sub]} — скоро. Сейчас доступны TON-казна, конверт, DexLP и USDT TRC-20.</p>
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
