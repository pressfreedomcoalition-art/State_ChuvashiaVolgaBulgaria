import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useApp } from "../state/AppState";
import {
  claimCitizenshipDocs,
  claimCitizenshipPay,
  claimCitizenshipWallet,
  fetchCitizenshipStatus,
  payDocsKycFee,
  type DocsClaims,
} from "../lib/civicActions";
import { formatJettonAmount, pathEnabled } from "../lib/civic";
import { hasLocalVault, getSession, unlockPassport, unlockPassportSilent, issuePassport } from "../lib/passport";
import { openBulCoinDeposit } from "../lib/telegram";
import { daoTokenDedustBuyUrl } from "../lib/dedust";

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
  const [claims, setClaims] = useState<DocsClaims>({
    surname: "",
    givenName: "",
    nationality: "RU",
    birthPlace: "",
    documentType: "passport",
    documentNumber: "",
  });

  const active = (q.get("path") || "") as PathId | "";
  /** Citizens may open docs path from «Требуют верификацию»; otherwise go to votings. */
  const allowCitizenStay = active === "docs";

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
    setBusy(true);
    setErr("");
    setMsg(tt("sendingPay"));
    try {
      await ensurePassport();
      await claimCitizenshipPay({ tonConnectUI, wallet, amountNano: payAmount, payMaster });
      setCitizen(true);
      setIsCitizen(true);
      setMsg(tt("payCitizenOk"));
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
      nav("/referendums", { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function doDocs() {
    setBusy(true);
    setErr("");
    setMsg("");
    try {
      await ensurePassport();
      let j = await claimCitizenshipDocs({ claims });
      if (!j.ok && j.code === "need_kyc_fee" && j.fee && wallet) {
        setMsg(tt("payingKyc"));
        const commit = String(j.commit || "");
        await payDocsKycFee({ tonConnectUI, wallet, fee: j.fee, commit });
        for (let i = 0; i < 5; i++) {
          j = await claimCitizenshipDocs({ claims, feeTxHash: commit });
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
        nav("/referendums", { replace: true });
        return;
      }
      const token = j.kyc?.accessToken;
      if (!token) {
        setMsg(tt("kycPending"));
        return;
      }
      setMsg(tt("openingSumsub"));
      const { launchSumsubSdk } = await import("../lib/sumsubUi");
      await launchSumsubSdk({
        accessToken: token,
        onTokenExpired: async () => {
          const jj = await claimCitizenshipDocs({ claims });
          if (!jj.ok || !jj.kyc?.accessToken) throw new Error(jj.error || "token refresh failed");
          return jj.kyc.accessToken;
        },
      });
      setMsg(tt("kycSubmitted"));
      await refreshStatus();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

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
          {(
            [
              ["surname", "fieldSurname"],
              ["givenName", "fieldGivenName"],
              ["patronymic", "fieldPatronymic"],
              ["nationality", "fieldNationality"],
              ["birthPlace", "fieldBirthPlace"],
              ["regPlace", "fieldRegPlace"],
              ["documentNumber", "fieldDocNumber"],
            ] as const
          ).map(([key, labelKey]) => (
            <label key={key} className="muted" style={{ display: "block" }}>
              {tt(labelKey)}
              <input
                value={(claims as Record<string, string>)[key] || ""}
                onChange={(e) => setClaims((c) => ({ ...c, [key]: e.target.value }))}
                style={{
                  display: "block",
                  width: "100%",
                  marginTop: 4,
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid var(--line)",
                  boxSizing: "border-box",
                }}
              />
            </label>
          ))}
          <button
            className="btn btn-primary"
            data-testid="cit-docs-submit"
            disabled={
              busy ||
              !claims.surname.trim() ||
              !claims.givenName.trim() ||
              !claims.birthPlace.trim() ||
              !claims.documentNumber.trim()
            }
            onClick={() => void doDocs()}
          >
            {tt("submitSumsub")}
          </button>
          <div id="sumsub-websdk-container" />
          <p className="muted">{tt("pathDocsExplain")}</p>
        </div>
      ) : null}

      {active === "lang" ? (
        <div className="card stack">
          <p className="muted">{tt("langPathSoon")}</p>
          <p className="muted">{tt("pathLangExplain")}</p>
        </div>
      ) : null}

      {msg ? <p style={{ color: "var(--ok)" }}>{msg}</p> : null}
      {err ? <p style={{ color: "var(--maroon)" }}>{err}</p> : null}
    </div>
  );
}
