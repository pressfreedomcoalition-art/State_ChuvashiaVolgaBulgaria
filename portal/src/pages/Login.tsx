import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { CABINET_LOGO, PORTAL_ORIGIN } from "../lib/config";
import { officialExportPresentUrl } from "../lib/civic";
import { isTelegram, openOfficial } from "../lib/telegram";
import {
  parsePresentReturn,
  saveIncomingPresentation,
  stripPresentFromUrl,
} from "../lib/presentReturn";
import {
  biometricAvailable,
  getSession,
  hasLocalVault,
  restoreFromPhrase,
  unlockPassport,
  unlockPassportSilent,
} from "../lib/passport";
import { restoreFromWallet } from "../lib/passportWalletBackup";
import {
  pathAfterGate,
  readCitizenFlag,
  resolveCitizenshipGate,
  writeCitizenFlag,
} from "../lib/authGate";
import { useApp } from "../state/AppState";

const SESSION_PRESENT = "chv_session_presentation";

export function saveSessionPresentation(presentation: string) {
  sessionStorage.setItem(SESSION_PRESENT, presentation);
  saveIncomingPresentation(presentation);
}

export function getSessionPresentation(): string | null {
  try {
    return sessionStorage.getItem(SESSION_PRESENT);
  } catch {
    return null;
  }
}

type Step = "home" | "phrase";

export function Login() {
  const wallet = useTonAddress();
  const [ui] = useTonConnectUI();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const { setIsCitizen, isCitizen, tt, name } = useApp();
  const [step, setStep] = useState<Step>("home");
  const [phrase, setPhrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [booting, setBooting] = useState(true);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const pendingWalletAuth = useRef(false);
  const bootDone = useRef(false);
  const authInFlight = useRef(false);

  async function finishAfterUnlock() {
    setInfo(tt("checkingCitizenship"));
    const gate = await resolveCitizenshipGate();
    const citizen = gate === "citizen" ? true : gate === "not_citizen" ? false : readCitizenFlag();
    writeCitizenFlag(citizen);
    setIsCitizen(citizen);
    nav(pathAfterGate(gate), { replace: true });
  }

  /** Prepare presentation/session without Face ID (boot path). */
  function prepareSilentAuth(): boolean {
    if (getSessionPresentation()) {
      try {
        sessionStorage.setItem(
          "chv_passport_session_v1",
          JSON.stringify({ presentationOnly: true, unlockedAt: Date.now() }),
        );
      } catch {
        /* ignore */
      }
      return true;
    }
    if (getSession()) return true;
    if (hasLocalVault() && unlockPassportSilent()) return true;
    return false;
  }

  /**
   * On Mini App open: if passport material exists → check citizenship → votings.
   * No intermediate «you are a citizen» / «continue» screens.
   */
  async function trySilentGate(): Promise<boolean> {
    try {
      if (!prepareSilentAuth()) return false;
      await finishAfterUnlock();
      return true;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    if (bootDone.current) return;
    bootDone.current = true;
    void (async () => {
      try {
        const fromUrl = parsePresentReturn() || params.get("presentation");
        if (fromUrl) {
          saveSessionPresentation(fromUrl);
          stripPresentFromUrl();
        }

        // Known citizen → votings immediately (re-check in background via finish if possible).
        const known = isCitizen === true || readCitizenFlag() === true;
        if (known) {
          setIsCitizen(true);
          writeCitizenFlag(true);
          if (prepareSilentAuth()) {
            nav("/referendums", { replace: true });
            void resolveCitizenshipGate().then((gate) => {
              if (gate === "not_citizen") {
                writeCitizenFlag(false);
                setIsCitizen(false);
                nav("/citizenship", { replace: true });
              } else if (gate === "citizen") {
                writeCitizenFlag(true);
                setIsCitizen(true);
              }
            });
            return;
          }
          // Flag says citizen but no material — still open votings; vote will ask to restore.
          nav("/referendums", { replace: true });
          return;
        }

        setBusy(true);
        setInfo(tt("checkingCitizenship"));
        await trySilentGate();
      } finally {
        setBusy(false);
        setBooting(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isCitizen === true) nav("/referendums", { replace: true });
  }, [isCitizen, nav]);

  async function doPhrase() {
    setBusy(true);
    setErr("");
    try {
      await restoreFromPhrase(phrase);
      setInfo(tt("phraseRestored"));
      await finishAfterUnlock();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function doFaceId() {
    setBusy(true);
    setErr("");
    setInfo("");
    try {
      if (hasLocalVault()) {
        await unlockPassport(tt("unlockReasonLogin"));
        setInfo(tt("daoFaceIdDone"));
        await finishAfterUnlock();
        return;
      }
      const ret = `${PORTAL_ORIGIN.replace(/\/$/, "")}/auth/return`;
      openOfficial(officialExportPresentUrl(ret));
      setInfo(tt("faceIdOpenDaoHint"));
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "biometric_timeout" || msg === "biometric denied") {
        setErr(tt("faceIdTimeout"));
      } else if (msg === "biometric_unavailable") {
        setErr(tt("faceIdUnavailable"));
      } else {
        setErr(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  async function doConnectAndAuth() {
    if (authInFlight.current) return;
    authInFlight.current = true;
    setBusy(true);
    setErr("");
    setInfo(tt("walletAuthProgress"));
    try {
      if (!wallet) {
        pendingWalletAuth.current = true;
        ui.openModal();
        setInfo(tt("connectThenAuth"));
        return;
      }
      pendingWalletAuth.current = false;

      if (prepareSilentAuth()) {
        if (await trySilentGate()) return;
      }

      try {
        setInfo(tt("walletAuthConfirmTx"));
        await restoreFromWallet(ui);
        setInfo(tt("walletRestored"));
        await finishAfterUnlock();
        return;
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg === "connect_wallet") {
          pendingWalletAuth.current = true;
          ui.openModal();
          setInfo(tt("connectThenAuth"));
          return;
        }
        if (msg === "timeout") {
          setErr(tt("walletAuthTimeout"));
          return;
        }
        if (await trySilentGate()) return;
        if (
          msg === "not_found" ||
          msg.includes("no wallet backup") ||
          msg.includes("wallet_bind_needs_memo") ||
          msg.includes("challenge failed")
        ) {
          writeCitizenFlag(false);
          setIsCitizen(false);
          nav("/citizenship", { replace: true });
          return;
        }
        throw e;
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      authInFlight.current = false;
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!wallet || busy || isCitizen === true || booting) return;
    if (!pendingWalletAuth.current) return;
    pendingWalletAuth.current = false;
    void doConnectAndAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet, busy, booting]);

  function goJoin() {
    writeCitizenFlag(false);
    setIsCitizen(false);
    nav("/citizenship", { replace: true });
  }

  if (isCitizen === true) {
    return <Navigate to="/referendums" replace />;
  }

  if (booting) {
    return (
      <div className="auth">
        <div className="auth-card" style={{ padding: 40, textAlign: "center" }}>
          <img className="auth-flag" src={CABINET_LOGO} alt="" style={{ width: 64, marginBottom: 16 }} />
          <p className="muted">{tt("checkingCitizenship")}</p>
        </div>
      </div>
    );
  }

  const showLocalFaceId = hasLocalVault() || biometricAvailable();

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-brand" style={{ padding: 36 }}>
          <img className="auth-flag" src={CABINET_LOGO} alt="" />
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 28, margin: 0 }}>{tt("loginTitle")}</h1>
          <p className="muted">{tt("loginLeadSimple")}</p>
        </div>
        <div className="auth-form">
          {step === "home" ? (
            <>
              <h2>{name || tt("citizenship")}</h2>
              <p className="muted">{tt("loginNeedAccessSimple")}</p>
              <button
                className="btn btn-primary btn-wide"
                disabled={busy}
                onClick={() => void doConnectAndAuth()}
              >
                {busy ? tt("walletAuthProgress") : tt("connectAndAuth")}
              </button>
              <p className="muted" style={{ marginTop: 4, fontSize: 13 }}>
                {tt("connectAndAuthHint")}
              </p>
              {(showLocalFaceId || !hasLocalVault()) && (
                <button className="btn btn-ghost btn-wide" disabled={busy} onClick={() => void doFaceId()}>
                  {tt("faceIdViaDao")}
                </button>
              )}
              <button className="btn btn-ghost btn-wide" disabled={busy} onClick={() => setStep("phrase")}>
                {tt("restoreViaKey")}
              </button>
              <button className="btn btn-ghost btn-wide" disabled={busy} onClick={goJoin}>
                {tt("joinDao", { name: name || "DAO" })}
              </button>
              <p className="muted" style={{ marginTop: 12 }}>
                {tt("browsePublicHint")}
              </p>
              <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => nav("/laws")}>
                  {tt("laws")}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => nav("/leaders")}>
                  {tt("leaders")}
                </button>
                <button type="button" className="btn btn-ghost" onClick={() => nav("/apps")}>
                  {tt("apps")}
                </button>
              </div>
            </>
          ) : null}

          {step === "phrase" ? (
            <>
              <h2>{tt("seedPhrase")}</h2>
              <p className="muted">{tt("restoreViaKeyHint")}</p>
              <textarea
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                rows={3}
                placeholder="word1 word2 …"
                style={{ width: "100%", borderRadius: 10, border: "1px solid var(--line)", padding: 10 }}
              />
              <button
                className="btn btn-primary btn-wide"
                disabled={busy || !phrase.trim()}
                onClick={() => void doPhrase()}
              >
                {tt("restore")}
              </button>
              <button className="btn btn-ghost btn-wide" disabled={busy} onClick={() => setStep("home")}>
                {tt("back")}
              </button>
            </>
          ) : null}

          {info ? <p style={{ color: "var(--ok)" }}>{info}</p> : null}
          {err ? <p style={{ color: "var(--maroon)" }}>{err}</p> : null}
          {!isTelegram() ? <p className="muted">{tt("faceIdBetterInTg")}</p> : null}
        </div>
      </div>
    </div>
  );
}
