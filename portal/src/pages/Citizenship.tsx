import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useApp } from "../state/AppState";
import {
  applyCitizenshipLang,
  claimCitizenshipDocs,
  claimCitizenshipPay,
  claimCitizenshipWallet,
  endorseCitizenshipLang,
  fetchCitizenshipStatus,
  listCitizenshipApplications,
  payDocsKycFee,
  type LangApplication,
} from "../lib/civicActions";
import { formatJettonAmount, pathEnabled } from "../lib/civic";
import { hasLocalVault, getSession, unlockPassport, unlockPassportSilent, issuePassport } from "../lib/passport";
import { openBulCoinDeposit } from "../lib/telegram";
import { daoTokenDedustBuyUrl } from "../lib/dedust";
import { ActionError } from "../components/TonConnectRecovery";

type PathId = "pay" | "docs" | "lang" | "wallet" | "token";

export function Citizenship() {
  const { tt, name, citizens, params, kyc, loading, wallet, config, setIsCitizen, isCitizen } = useApp();
  const nav = useNavigate();
  const [q, setQ] = useSearchParams();
  const [tonConnectUI] = useTonConnectUI();
  const [citizen, setCitizen] = useState<boolean | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);
  const [msg, setMsg] = useState("");
  const [kycOpen, setKycOpen] = useState(false);
  const retryRef = useRef<null | (() => void)>(null);
  const [langCode, setLangCode] = useState("");
  const [langNote, setLangNote] = useState("");
  const [langApps, setLangApps] = useState<LangApplication[]>([]);
  const [langPending, setLangPending] = useState<{ have: number; need: number } | null>(null);

  const active = (q.get("path") || "") as PathId | "";
  /** Citizens may open docs (KYC) or lang (endorse) paths; otherwise go to votings. */
  const allowCitizenStay = active === "docs" || active === "lang";

  const payAmount = BigInt(params.get("cit.path.pay.amount")?.numRaw || "0");
  const payMaster =
    params.get("cit.path.pay.amount")?.str ||
    config?.voteJettonMaster ||
    "";

  const civicPaths = useMemo(() => {
    const list: { id: PathId; title: string; blurb: string }[] = [];
    if (pathEnabled(params, "pay")) {
      list.push({
        id: "pay",
        title: tt("pathPay"),
        blurb: tt("pathPayMin", {
          amount: formatJettonAmount(params.get("cit.path.pay.amount")?.numRaw || params.get("cit.path.pay.amount")?.num),
        }),
      });
    }
    if (pathEnabled(params, "docs")) {
      list.push({
        id: "docs",
        title: tt("pathDocs"),
        blurb: kyc
          ? tt("pathDocsKyc", { fee: kyc.feeFloorUsdt ?? 0, symbol: kyc.defaultFeeSymbol || "USDT" })
          : tt("pathDocsSumsub"),
      });
    }
    if (pathEnabled(params, "lang")) {
      list.push({
        id: "lang",
        title: tt("pathLang"),
        blurb: tt("pathLangQuorum", { n: params.get("cit.path.lang.quorum")?.num ?? "—" }),
      });
    }
    if (pathEnabled(params, "wallet")) {
      list.push({
        id: "wallet",
        title: tt("pathWallet"),
        blurb: tt("pathWalletBlurb"),
      });
    }
    return list;
  }, [params, kyc, tt]);

  const tokenMode = civicPaths.length === 0 && !!config?.voteJettonMaster;
  const buyUrl = config?.voteJettonMaster ? daoTokenDedustBuyUrl(config.voteJettonMaster) : "";

  function openPath(id: PathId) {
    setErr("");
    setMsg("");
    setQ({ path: id }, { replace: false });
  }

  function clearPath() {
    setQ({}, { replace: false });
  }

  async function refreshStatus() {
    setBusy(true);
    setErr("");
    try {
      const hasPresent = (() => {
        try {
          const p = sessionStorage.getItem("chv_session_presentation");
          return !!(p && p.includes("~"));
        } catch {
          return false;
        }
      })();
      if (!getSession() && !hasPresent) {
        if (hasLocalVault()) unlockPassportSilent();
      }
      if (!getSession() && !hasPresent && !hasLocalVault()) {
        setCitizen(null);
        return;
      }
      const r = await fetchCitizenshipStatus();
      const ok = !!r.citizen;
      setCitizen(ok);
      setIsCitizen(ok);
      if (!ok && (r.applicationPending || r.have != null || r.haveConfirmations != null)) {
        const have = Number(r.have ?? r.haveConfirmations ?? 0);
        const need = Number(r.need ?? r.needConfirmations ?? params.get("cit.path.lang.quorum")?.num ?? 0);
        setLangPending({ have, need: need || 1 });
      } else if (ok) {
        setLangPending(null);
      }
      if (ok && !allowCitizenStay) {
        nav("/referendums", { replace: true });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setCitizen(null);
    } finally {
      setBusy(false);
      setChecking(false);
    }
  }

  useEffect(() => {
    if (isCitizen === true && !allowCitizenStay) {
      nav("/referendums", { replace: true });
      return;
    }
    const hasPresent = (() => {
      try {
        const p = sessionStorage.getItem("chv_session_presentation");
        return !!(p && p.includes("~"));
      } catch {
        return false;
      }
    })();
    if (getSession() || hasPresent || hasLocalVault()) {
      void refreshStatus();
    } else setChecking(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowCitizenStay]);

  useEffect(() => {
    if (isCitizen === true && !allowCitizenStay) {
      nav("/referendums", { replace: true });
    }
  }, [isCitizen, allowCitizenStay, nav]);

  async function ensurePassport() {
    if (!hasLocalVault()) {
      const r = await issuePassport();
      if (r.restorePhrase) setMsg(tt("saveSeed", { phrase: r.restorePhrase }));
    } else if (!getSession()) {
      await unlockPassport(tt("unlockReasonCitizenship"));
    }
  }

  async function doPay() {
    if (!wallet) {
      tonConnectUI.openModal();
      setErr(tt("connectWallet"));
      return;
    }
    if (!payMaster || payAmount <= 0n) {
      setErr(tt("payParamsMissing"));
      return;
    }
    retryRef.current = () => void doPay();
    setBusy(true);
    setErr("");
    setMsg(tt("sendingPay"));
    try {
      await ensurePassport();
      await claimCitizenshipPay({ tonConnectUI, wallet, amountNano: payAmount, payMaster });
      setCitizen(true);
      setIsCitizen(true);
      setMsg(tt("payCitizenOk"));
      retryRef.current = null;
      nav("/referendums", { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function doWallet() {
    if (!wallet) {
      tonConnectUI.openModal();
      setErr(tt("connectWallet"));
      return;
    }
    retryRef.current = () => void doWallet();
    setBusy(true);
    setErr("");
    try {
      await ensurePassport();
      const r = await claimCitizenshipWallet(wallet);
      if (r.merged || r.mergedInto) {
        setErr(tt("passportMerged"));
        return;
      }
      setCitizen(true);
      setIsCitizen(true);
      setMsg(tt("walletCitizenOk"));
      retryRef.current = null;
      nav("/referendums", { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function doDocs() {
    retryRef.current = () => void doDocs();
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await ensurePassport();
      // No PII in the cabinet — Sumsub collects document data; verifier uses OCR hashes.
      let j = await claimCitizenshipDocs();
      if (!j.ok && j.code === "need_kyc_fee" && j.fee && wallet) {
        setMsg(tt("payingKyc"));
        const commit = String(j.commit || "");
        await payDocsKycFee({ tonConnectUI, wallet, fee: j.fee, commit });
        for (let i = 0; i < 5; i++) {
          j = await claimCitizenshipDocs({ feeTxHash: commit });
          if (j.ok || j.code !== "fee_tx_not_found") break;
          setMsg(tt("waitingPayIndex"));
          await new Promise((r) => setTimeout(r, 5000));
        }
      }
      if (!j.ok) throw new Error(j.code || j.error || "docs fail");
      if (j.citizen) {
        setCitizen(true);
        setIsCitizen(true);
        setMsg(tt("docsCitizenOk"));
        retryRef.current = null;
        nav("/referendums", { replace: true });
        return;
      }
      const token = j.kyc?.accessToken;
      if (!token) {
        setMsg(tt("kycPending"));
        retryRef.current = null;
        return;
      }
      setMsg(tt("openingSumsub"));
      setKycOpen(true);
      const { launchSumsubSdk } = await import("../lib/sumsubUi");
      await launchSumsubSdk({
        accessToken: token,
        onTokenExpired: async () => {
          const jj = await claimCitizenshipDocs();
          if (!jj.ok || !jj.kyc?.accessToken) throw new Error(jj.error || "token refresh failed");
          return jj.kyc.accessToken;
        },
      });
      setKycOpen(false);
      setMsg(tt("kycSubmitted"));
      retryRef.current = null;
      await refreshStatus();
    } catch (e) {
      setKycOpen(false);
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function loadLangApps() {
    try {
      const r = await listCitizenshipApplications("pending");
      setLangApps(r.applications || []);
    } catch {
      setLangApps([]);
    }
  }

  async function doLangApply() {
    retryRef.current = () => void doLangApply();
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      const cw = langCode.trim();
      const nt = langNote.trim();
      if (cw.length < 2) throw new Error(tt("langNeedCodeWord"));
      if (nt.length < 4) throw new Error(tt("langNeedNote"));
      await ensurePassport();
      const initData =
        (window as unknown as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp
          ?.initData || "";
      const j = await applyCitizenshipLang({ codeWord: cw, note: nt, initData });
      if (j.alreadyCitizen) {
        setCitizen(true);
        setIsCitizen(true);
        setMsg(tt("langAlreadyCitizen"));
        retryRef.current = null;
        nav("/referendums", { replace: true });
        return;
      }
      const have = Number(j.have || 0);
      const need = Number(j.need || j.quorum || params.get("cit.path.lang.quorum")?.num || 1);
      setLangPending({ have, need });
      setMsg(tt("langApplied"));
      retryRef.current = null;
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function doEndorse(commit: string, decision: "yes" | "no") {
    setBusy(true);
    setErr("");
    try {
      const j = await endorseCitizenshipLang({ applicantCommit: commit, decision });
      setMsg(
        j.granted
          ? tt("langGranted")
          : tt("langEndorseOk", { n: String(j.net ?? j.yes ?? 0), q: String(j.need ?? j.quorum ?? "—") }),
      );
      await loadLangApps();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (active === "lang" && (citizen === true || isCitizen === true)) {
      void loadLangApps();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, citizen, isCitizen]);

  const pathMeta = civicPaths.find((p) => p.id === active);
  const showDetail = !!active && (active === "token" || !!pathMeta);

  // Already a citizen (and not opening verify docs) → votings, no join screen.
  if ((isCitizen === true || citizen === true) && !allowCitizenStay) {
    return <Navigate to="/referendums" replace />;
  }

  if (checking && !showDetail) {
    return (
      <div className="stack">
        <h1 className="page-title">{tt("citizenship")}</h1>
        <p className="muted">{tt("checkingCitizenship")}</p>
      </div>
    );
  }

  return (
    <div className="stack">
      <div>
        <h1 className="page-title">{showDetail ? pathMeta?.title || tt("pathToken") : tt("joinDao", { name: name || "DAO" })}</h1>
        <p className="muted">
          {name}
          {citizens != null ? ` · ${citizens} ${tt("citizens")}` : ""}
          {wallet ? ` · ${wallet.slice(0, 6)}…` : ""}
        </p>
      </div>

      {showDetail ? (
        <button type="button" className="btn btn-ghost" style={{ alignSelf: "flex-start" }} onClick={clearPath}>
          {tt("back")}
        </button>
      ) : null}

      {!showDetail ? (
        <>
          <p className="muted">{tt("obtainHintSimple")}</p>
          {loading ? <p className="muted">{tt("loading")}</p> : null}

          {tokenMode ? (
            <button type="button" className="btn btn-primary btn-wide" onClick={() => openPath("token")}>
              {tt("pathToken")}
            </button>
          ) : null}

          {civicPaths.map((p) => (
            <button
              key={p.id}
              type="button"
              className="btn btn-primary btn-wide"
              data-testid={`cit-path-${p.id}`}
              onClick={() => openPath(p.id)}
              style={{ textAlign: "left" }}
            >
              {p.title}
            </button>
          ))}

          {!tokenMode && !civicPaths.length && !loading ? (
            <div className="card">
              <p className="muted">{tt("noPathsYet")}</p>
            </div>
          ) : null}
        </>
      ) : null}

      {active === "token" ? (
        <div className="card stack">
          {!wallet ? (
            <button className="btn btn-primary" disabled={busy} onClick={() => tonConnectUI.openModal()}>
              {tt("connectWallet")}
            </button>
          ) : (
            <p className="muted">{tt("walletShort", { addr: wallet.slice(0, 8) })}</p>
          )}
          <button className="btn btn-primary" disabled={busy || !wallet} onClick={() => setMsg(tt("stakeHint"))}>
            {tt("stakeToken")}
          </button>
          {buyUrl ? (
            <a className="btn btn-ghost" href={buyUrl} target="_blank" rel="noreferrer">
              {tt("buyDaoToken")}
            </a>
          ) : null}
          <p className="muted" style={{ marginTop: 8 }}>
            {tt("pathTokenExplain")}
          </p>
        </div>
      ) : null}

      {active === "pay" ? (
        <div className="card stack">
          {!wallet ? (
            <button className="btn btn-primary" onClick={() => tonConnectUI.openModal()}>
              {tt("connectWallet")}
            </button>
          ) : null}
          <button className="btn btn-primary" disabled={busy || !wallet} data-testid="cit-pay-submit" onClick={() => void doPay()}>
            {tt("payInCabinet")}
          </button>
          <button className="btn btn-ghost" onClick={openBulCoinDeposit}>
            {tt("buyBlc")}
          </button>
          {buyUrl ? (
            <a className="btn btn-ghost" href={buyUrl} target="_blank" rel="noreferrer">
              {tt("buyDaoToken")}
            </a>
          ) : null}
          <p className="muted">{tt("pathPayExplain")}</p>
        </div>
      ) : null}

      {active === "wallet" ? (
        <div className="card stack">
          {!wallet ? (
            <button className="btn btn-primary" onClick={() => tonConnectUI.openModal()}>
              {tt("connectWallet")}
            </button>
          ) : null}
          <button className="btn btn-primary" disabled={busy || !wallet} data-testid="cit-wallet-submit" onClick={() => void doWallet()}>
            {tt("claimWalletNft")}
          </button>
          <p className="muted">{tt("pathWalletExplain")}</p>
        </div>
      ) : null}

      {active === "docs" ? (
        <div className="card stack">
          {!wallet ? (
            <button className="btn btn-primary" onClick={() => tonConnectUI.openModal()}>
              {tt("connectWallet")}
            </button>
          ) : null}
          <p className="muted">{tt("pathDocsExplain")}</p>
          <button
            className="btn btn-primary"
            data-testid="cit-docs-submit"
            disabled={busy || kycOpen}
            onClick={() => void doDocs()}
          >
            {tt("submitSumsub")}
          </button>
          <div
            id="sumsub-websdk-container"
            style={{
              display: kycOpen ? "block" : "none",
              minHeight: kycOpen ? 420 : 0,
            }}
          />
        </div>
      ) : null}

      {active === "lang" ? (
        <div className="card stack">
          <p className="muted">{tt("pathLangExplain")}</p>
          {citizen === true || isCitizen === true ? (
            <>
              <p className="muted">{tt("langEndorseHint")}</p>
              <button className="btn btn-ghost" disabled={busy} onClick={() => void loadLangApps()}>
                {tt("reload")}
              </button>
              {langApps.length === 0 ? (
                <p className="muted">{tt("langAppsEmpty")}</p>
              ) : (
                langApps.map((app) => (
                  <article key={app.commit} className="stack" style={{ gap: 6, borderTop: "1px solid var(--line, #333)", paddingTop: 8 }}>
                    <strong>{app.codeWord || app.commit.slice(0, 10)}</strong>
                    {app.note ? <p className="muted" style={{ margin: 0 }}>{app.note}</p> : null}
                    <p className="muted" style={{ margin: 0 }}>
                      {tt("langProgress", {
                        n: String(app.net ?? app.have ?? 0),
                        q: String(app.need ?? "—"),
                      })}
                      {app.myDecision ? ` · ${app.myDecision}` : ""}
                    </p>
                    {!app.myDecision ? (
                      <div className="row" style={{ gap: 8 }}>
                        <button
                          className="btn btn-primary"
                          disabled={busy}
                          onClick={() => void doEndorse(app.commit, "yes")}
                        >
                          {tt("langYes")}
                        </button>
                        <button
                          className="btn btn-ghost"
                          disabled={busy}
                          onClick={() => void doEndorse(app.commit, "no")}
                        >
                          {tt("langNo")}
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))
              )}
            </>
          ) : (
            <>
              {langPending ? (
                <p>
                  {tt("langProgress", { n: String(langPending.have), q: String(langPending.need) })}
                </p>
              ) : null}
              <label className="muted">
                {tt("langCodeWord")}
                <input
                  className="input"
                  style={{ width: "100%", marginTop: 4 }}
                  value={langCode}
                  onChange={(e) => setLangCode(e.target.value)}
                  placeholder={tt("langCodeWordPh")}
                  disabled={busy}
                />
              </label>
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                {tt("langCodeWordHint")}
              </p>
              <label className="muted">
                {tt("langNote")}
                <textarea
                  className="input"
                  style={{ width: "100%", marginTop: 4, minHeight: 72 }}
                  value={langNote}
                  onChange={(e) => setLangNote(e.target.value)}
                  placeholder={tt("langNotePh")}
                  disabled={busy}
                />
              </label>
              <button
                className="btn btn-primary"
                data-testid="cit-lang-apply"
                disabled={busy}
                onClick={() => void doLangApply()}
              >
                {tt("langApply")}
              </button>
            </>
          )}
        </div>
      ) : null}

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
  );
}
