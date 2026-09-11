import { useEffect, useRef, useState } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useApp } from "../state/AppState";
import {
  claimNftPassport,
  fetchDaoGasStatus,
  fetchGasStatus,
  retryPendingDaoGasClaim,
  retryPendingGasClaim,
  topUpDaoGas,
  topUpPrepaidGas,
} from "../lib/civicActions";
import {
  clearPassport,
  createPresentation,
  ensurePresentation,
  hasLocalVault,
  getSession,
  issuePassport,
  loadPassportVault,
  unlockPassport,
} from "../lib/passport";
import { probeBiometricAvailable } from "../lib/passportVault";
import { isTelegram } from "../lib/telegram";
import {
  bindWalletBackup,
  fetchPassportBackupStatus,
  unbindWalletBackup,
} from "../lib/passportWalletBackup";
import { ActionError } from "../components/TonConnectRecovery";
import { isGasTreasuryEnabled, nftPassportCollection } from "../lib/votingCatalog";

const NUDGE_KEY = "chv_wallet_bind_nudge_v1";

export function Passport() {
  const { tt, health, wallet, params, isCitizen } = useApp();
  const [ui] = useTonConnectUI();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [gas, setGas] = useState<string>("");
  const [daoGas, setDaoGas] = useState<string>("");
  const [gasAmount, setGasAmount] = useState("0.2");
  const [daoGasAmount, setDaoGasAmount] = useState("0.5");
  const [busy, setBusy] = useState(false);
  const [bound, setBound] = useState<string | null>(null);
  const [showNudge, setShowNudge] = useState(false);
  const [bioOk, setBioOk] = useState(false);
  const [bioProbed, setBioProbed] = useState(false);
  const unlocked = !!getSession();
  const retryRef = useRef<null | (() => void)>(null);
  const nftCollection = nftPassportCollection(params);
  const daoGasOn = isGasTreasuryEnabled(params);
  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const ok = await probeBiometricAvailable();
        if (alive) {
          setBioOk(ok);
          setBioProbed(true);
        }
      } catch {
        if (alive) {
          setBioOk(false);
          setBioProbed(true);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function refreshBindStatus() {
    try {
      if (!hasLocalVault()) return;
      const presentation = await ensurePresentation({ reason: tt("unlockReasonBindStatus") });
      const st = await fetchPassportBackupStatus(presentation);
      setBound(st.walletBound);
      if (!st.hasWalletBackup && !localStorage.getItem(NUDGE_KEY)) setShowNudge(true);
    } catch {
      /* status optional until API deployed */
    }
  }

  useEffect(() => {
    if (hasLocalVault()) void refreshBindStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasLocalVault()) return;
    void (async () => {
      const claimed = await retryPendingGasClaim();
      if (claimed?.ok) {
        setGas(String(claimed.balanceTon ?? claimed.creditedTon ?? ""));
        setMsg(tt("gasClaimed"));
      }
      const daoClaimed = await retryPendingDaoGasClaim();
      if (daoClaimed?.ok) {
        setDaoGas(String(daoClaimed.balanceTon ?? daoClaimed.creditedTon ?? ""));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hasLocalVault() || !daoGasOn) return;
    void (async () => {
      try {
        const st = await fetchDaoGasStatus();
        if (st.balanceTon != null) setDaoGas(String(st.balanceTon));
      } catch {
        /* optional */
      }
    })();
  }, [daoGasOn]);

  async function unlock() {
    setErr("");
    try {
      await unlockPassport(tt("unlockReasonUnlock"));
      setMsg(tt("passportUnlocked"));
      const ok = await probeBiometricAvailable();
      setBioOk(ok);
      setBioProbed(true);
      await refreshBindStatus();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  async function gasBal() {
    setErr("");
    try {
      const r = await fetchGasStatus();
      setGas(String(r.balanceTon ?? r.nano ?? "0"));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  async function doGasTopUp() {
    retryRef.current = () => void doGasTopUp();
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      if (!wallet) {
        ui.openModal();
        throw new Error(tt("connectWallet"));
      }
      if (!hasLocalVault()) throw new Error(tt("needUnlockPassport"));
      setMsg(tt("gasSending"));
      const ton = Number(String(gasAmount).replace(",", "."));
      const r = await topUpPrepaidGas({
        tonConnectUI: ui,
        wallet,
        amountTon: ton,
        fundAddressHint: health?.gas?.fundAddress,
      });
      setGas(String(r.balanceTon ?? r.creditedTon ?? ""));
      setMsg(tt("gasTopUpOk", { ton: String(r.creditedTon ?? ton) }));
      retryRef.current = null;
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      const retry = await retryPendingGasClaim();
      if (retry?.ok) {
        setGas(String(retry.balanceTon ?? retry.creditedTon ?? ""));
        setMsg(tt("gasClaimed"));
        setErr("");
        retryRef.current = null;
      } else {
        setErr(m);
        setMsg(tt("gasWaitIndex"));
      }
    } finally {
      setBusy(false);
    }
  }

  async function doDaoGasTopUp() {
    retryRef.current = () => void doDaoGasTopUp();
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      if (!wallet) {
        ui.openModal();
        throw new Error(tt("connectWallet"));
      }
      if (!hasLocalVault()) throw new Error(tt("needUnlockPassport"));
      setMsg(tt("gasSending"));
      const ton = Number(String(daoGasAmount).replace(",", "."));
      const r = await topUpDaoGas({
        tonConnectUI: ui,
        wallet,
        amountTon: ton,
        fundAddressHint: health?.gas?.fundAddress,
      });
      setDaoGas(String(r.balanceTon ?? r.creditedTon ?? ""));
      setMsg(tt("gasDaoTopUpOk", { ton: String(r.creditedTon ?? ton) }));
      retryRef.current = null;
    } catch (e) {
      const m = e instanceof Error ? e.message : String(e);
      const retry = await retryPendingDaoGasClaim();
      if (retry?.ok) {
        setDaoGas(String(retry.balanceTon ?? retry.creditedTon ?? ""));
        setMsg(tt("gasClaimed"));
        setErr("");
        retryRef.current = null;
      } else {
        setErr(m);
        setMsg(tt("gasWaitIndex"));
      }
    } finally {
      setBusy(false);
    }
  }

  async function doNftClaim() {
    retryRef.current = () => void doNftClaim();
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      if (!wallet) {
        ui.openModal();
        throw new Error(tt("connectWallet"));
      }
      if (!hasLocalVault()) throw new Error(tt("needUnlockPassport"));
      const r = await claimNftPassport({
        wallet,
        collection: nftCollection || undefined,
      });
      if (r.already) setMsg(tt("nftAlready"));
      else setMsg(tt("nftClaimed", { addr: (r.nftAddress || "").slice(0, 12) }));
      retryRef.current = null;
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function doBind() {
    retryRef.current = () => void doBind();
    setBusy(true);
    setErr("");
    try {
      if (!wallet) {
        ui.openModal();
        throw new Error(tt("connectWallet"));
      }
      const rec = getSession() || loadPassportVault();
      if (!rec) throw new Error("no_passport");
      if (!getSession()) await unlockPassport(tt("unlockReasonBind"));
      const presentation = await createPresentation(getSession() || rec);
      const out = await bindWalletBackup(presentation, getSession() || rec, ui);
      localStorage.setItem(NUDGE_KEY, "1");
      setShowNudge(false);
      setBound(out.wallet);
      setMsg(tt("walletBoundOk"));
      retryRef.current = null;
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function doUnbind() {
    if (!bound) return;
    setBusy(true);
    setErr("");
    try {
      const presentation = await ensurePresentation({ reason: tt("unlockReasonUnbind") });
      await unbindWalletBackup(presentation, bound);
      setBound(null);
      setMsg(tt("walletUnboundOk"));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <h1 className="page-title">{tt("passport")}</h1>
      <div className="card">
        <p>
          {tt("passportBioHint", {
            bio: !bioProbed
              ? tt("bioChecking")
              : bioOk
                ? tt("bioOn")
                : !isTelegram()
                  ? tt("bioOffBrowser")
                  : tt("bioOff"),
          })}
        </p>
        <p className="muted">
          {tt("vaultLine", {
            vault: hasLocalVault() ? tt("vaultYes") : tt("vaultNo"),
            session: unlocked ? tt("sessionOn") : tt("sessionOff"),
          })}
        </p>
        <p className="muted">{tt("gasExplain")}</p>
        {health?.gas ? (
          <p className="muted">
            {tt("gasTariffs", {
              grant: health.gas.grantDebitTon ?? 0,
              cast: health.gas.castDebitTon ?? 0,
              finalize: health.gas.finalizeDebitTon ?? 0,
            })}
          </p>
        ) : null}
        <div className="row">
          {hasLocalVault() ? (
            <button className="btn btn-primary" onClick={() => void unlock()}>
              {tt("faceIdUnlock")}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() =>
                void issuePassport()
                  .then((r) => setMsg(r.restorePhrase ? tt("phraseIssued", { phrase: r.restorePhrase }) : tt("passportIssued")))
                  .catch((e) => setErr(String(e)))
              }
            >
              {tt("issuePassportBtn")}
            </button>
          )}
          <button className="btn btn-ghost" disabled={!hasLocalVault()} onClick={() => void gasBal()}>
            {tt("gasBalanceBtn")}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              clearPassport();
              setMsg(tt("passportCleared"));
            }}
          >
            {tt("resetLocal")}
          </button>
        </div>
        {gas ? <p>{tt("prepaidGas", { gas })}</p> : null}
        {msg ? <p style={{ color: "var(--ok)" }}>{msg}</p> : null}
        {err ? (
          <ActionError
            error={err}
            busy={busy}
            onRetry={retryRef.current ? () => retryRef.current?.() : undefined}
            onDismiss={() => {
              setErr("");
              retryRef.current = null;
            }}
          />
        ) : null}
      </div>

      {hasLocalVault() ? (
        <div className="card stack" style={{ gap: 8 }}>
          <h3 style={{ marginTop: 0 }}>{tt("gasTopUpTitle")}</h3>
          <p className="muted" style={{ margin: 0 }}>
            {tt("gasTopUpHint")}
          </p>
          <label className="muted" style={{ display: "block" }}>
            {tt("gasAmount")}
            <input
              className="input"
              style={{ width: "100%", marginTop: 4 }}
              value={gasAmount}
              onChange={(e) => setGasAmount(e.target.value)}
              inputMode="decimal"
              disabled={busy}
            />
          </label>
          <button
            className="btn btn-primary"
            disabled={busy || !wallet}
            data-testid="gas-topup"
            onClick={() => void doGasTopUp()}
          >
            {tt("gasTopUpBtn")}
          </button>
        </div>
      ) : null}

      {hasLocalVault() && daoGasOn ? (
        <div className="card stack" style={{ gap: 8 }}>
          <h3 style={{ marginTop: 0 }}>{tt("gasDaoTitle")}</h3>
          <p className="muted" style={{ margin: 0 }}>
            {tt("gasDaoHint")}
          </p>
          {daoGas ? <p>{tt("gasDaoBalance", { gas: daoGas })}</p> : null}
          <label className="muted" style={{ display: "block" }}>
            {tt("gasAmount")}
            <input
              className="input"
              style={{ width: "100%", marginTop: 4 }}
              value={daoGasAmount}
              onChange={(e) => setDaoGasAmount(e.target.value)}
              inputMode="decimal"
              disabled={busy}
            />
          </label>
          <button
            className="btn btn-primary"
            disabled={busy || !wallet}
            data-testid="gas-dao-topup"
            onClick={() => void doDaoGasTopUp()}
          >
            {tt("gasDaoTopUpBtn")}
          </button>
        </div>
      ) : null}

      {hasLocalVault() && nftCollection && isCitizen === true ? (
        <div className="card stack" style={{ gap: 8 }}>
          <h3 style={{ marginTop: 0 }}>{tt("nftTitle")}</h3>
          <p className="muted" style={{ margin: 0 }}>
            {tt("nftHint")}
          </p>
          <button className="btn btn-primary" disabled={busy || !wallet} onClick={() => void doNftClaim()}>
            {tt("nftClaimBtn")}
          </button>
        </div>
      ) : null}

      {hasLocalVault() ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>{tt("walletRestoreTitle")}</h3>
          {showNudge ? (
            <p className="muted">{tt("walletBindNudge")}</p>
          ) : (
            <p className="muted">
              {tt("bindStatusLine", {
                status: bound ? tt("boundTo", { addr: bound.slice(0, 8) }) : tt("notBound"),
              })}
            </p>
          )}
          <div className="row">
            {!bound ? (
              <button className="btn btn-primary" disabled={busy} onClick={() => void doBind()}>
                {tt("bindWallet")}
              </button>
            ) : (
              <button className="btn btn-ghost" disabled={busy} onClick={() => void doUnbind()}>
                {tt("unbind")}
              </button>
            )}
            {showNudge ? (
              <button
                className="btn btn-ghost"
                onClick={() => {
                  localStorage.setItem(NUDGE_KEY, "1");
                  setShowNudge(false);
                }}
              >
                {tt("later")}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
