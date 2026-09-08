import { useEffect, useState } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useApp } from "../state/AppState";
import { fetchGasStatus } from "../lib/civicActions";
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

const NUDGE_KEY = "chv_wallet_bind_nudge_v1";

export function Passport() {
  const { tt, health, wallet } = useApp();
  const [ui] = useTonConnectUI();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [gas, setGas] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [bound, setBound] = useState<string | null>(null);
  const [showNudge, setShowNudge] = useState(false);
  const [bioOk, setBioOk] = useState(false);
  const [bioProbed, setBioProbed] = useState(false);
  const unlocked = !!getSession();

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

  async function doBind() {
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
        {err ? <p style={{ color: "var(--maroon)" }}>{err}</p> : null}
      </div>

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
