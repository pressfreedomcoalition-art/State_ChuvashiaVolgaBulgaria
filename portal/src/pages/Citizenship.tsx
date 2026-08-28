import { useEffect, useState } from "react";
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
import { hasLocalVault, getSession, unlockPassport, issuePassport } from "../lib/passport";
import { openBulCoinDeposit } from "../lib/telegram";

export function Citizenship() {
  const { tt, name, citizens, params, kyc, loading, wallet, config } = useApp();
  const [tonConnectUI] = useTonConnectUI();
  const [status, setStatus] = useState("");
  const [citizen, setCitizen] = useState<boolean | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [docsOpen, setDocsOpen] = useState(false);
  const [claims, setClaims] = useState<DocsClaims>({
    surname: "",
    givenName: "",
    nationality: "RU",
    birthPlace: "",
    documentType: "passport",
    documentNumber: "",
  });

  const payAmount = BigInt(params.get("cit.path.pay.amount")?.numRaw || "0");
  const payMaster =
    params.get("cit.path.pay.amount")?.str ||
    config?.voteJettonMaster ||
    "";

  const paths = [
    pathEnabled(params, "pay") && {
      id: "pay",
      title: tt("pathPay"),
      body: `мин. ${formatJettonAmount(params.get("cit.path.pay.amount")?.numRaw || params.get("cit.path.pay.amount")?.num)} BLC`,
    },
    pathEnabled(params, "docs") && {
      id: "docs",
      title: tt("pathDocs"),
      body: kyc ? `Sumsub · от ${kyc.feeFloorUsdt} ${kyc.defaultFeeSymbol || "USDT"}` : "Sumsub KYC",
    },
    pathEnabled(params, "lang") && {
      id: "lang",
      title: tt("pathLang"),
      body: `кворум ${params.get("cit.path.lang.quorum")?.num ?? "—"}`,
    },
    pathEnabled(params, "wallet") && {
      id: "wallet",
      title: tt("pathWallet"),
      body: params.get("cit.path.wallet.policy")?.str || "NFT / source DAO",
    },
  ].filter(Boolean) as { id: string; title: string; body: string }[];

  async function refreshStatus() {
    setBusy(true);
    setErr("");
    try {
      if (!getSession() && hasLocalVault()) await unlockPassport("Статус гражданства");
      if (!hasLocalVault()) {
        setCitizen(null);
        setStatus("no_passport");
        return;
      }
      const r = await fetchCitizenshipStatus();
      setCitizen(!!r.citizen);
      setStatus(r.status || (r.citizen ? "citizen" : "not_citizen"));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setCitizen(null);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (hasLocalVault()) void refreshStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function ensurePassport() {
    if (!hasLocalVault()) {
      const r = await issuePassport();
      if (r.restorePhrase) setMsg(`Сохраните seed: ${r.restorePhrase}`);
    } else if (!getSession()) {
      await unlockPassport("Гражданство");
    }
  }

  async function doPay() {
    if (!wallet) {
      setErr("Подключите кошелёк");
      return;
    }
    if (!payMaster || payAmount <= 0n) {
      setErr("Параметры оплаты не найдены");
      return;
    }
    setBusy(true);
    setErr("");
    setMsg("Отправка оплаты…");
    try {
      await ensurePassport();
      await claimCitizenshipPay({
        tonConnectUI,
        wallet,
        amountNano: payAmount,
        payMaster,
      });
      setCitizen(true);
      setMsg("Гражданство по взносу получено");
      await refreshStatus();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function doWallet() {
    if (!wallet) {
      setErr("Подключите кошелёк");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await ensurePassport();
      const r = await claimCitizenshipWallet(wallet);
      if (r.merged || r.mergedInto) {
        setErr("Паспорт уже был связан с другим устройством — восстановите seed/кошельком");
        return;
      }
      setCitizen(true);
      setMsg("Гражданство по кошельку/NFT получено");
      await refreshStatus();
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
        setMsg("Оплата KYC-сбора…");
        const commit = String(j.commit || "");
        await payDocsKycFee({ tonConnectUI, wallet, fee: j.fee, commit });
        for (let i = 0; i < 5; i++) {
          j = await claimCitizenshipDocs({ claims, feeTxHash: commit });
          if (j.ok || j.code !== "fee_tx_not_found") break;
          setMsg("Ждём индексацию платежа…");
          await new Promise((r) => setTimeout(r, 5000));
        }
      }
      if (!j.ok) throw new Error(j.code || j.error || "docs fail");
      if (j.citizen) {
        setCitizen(true);
        setMsg("Гражданство по документам получено");
        return;
      }
      const token = j.kyc?.accessToken;
      if (!token) {
        setMsg("KYC в обработке — обновите статус позже");
        return;
      }
      setMsg("Открываем Sumsub…");
      const { launchSumsubSdk } = await import("../lib/sumsubUi");
      await launchSumsubSdk({
        accessToken: token,
        onTokenExpired: async () => {
          const jj = await claimCitizenshipDocs({ claims });
          if (!jj.ok || !jj.kyc?.accessToken) throw new Error(jj.error || "token refresh failed");
          return jj.kyc.accessToken;
        },
      });
      setMsg("KYC отправлен — ждём проверку, обновите статус");
      await refreshStatus();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  const label =
    citizen === true ? tt("isCitizen") : citizen === false ? tt("notCitizen") : tt("unknownCitizen");

  return (
    <div className="stack">
      <div>
        <h1 className="page-title">{tt("citizenship")}</h1>
        <p className="muted">
          {name}
          {citizens != null ? ` · ${citizens} ${tt("citizens")}` : ""}
          {wallet ? ` · ${wallet.slice(0, 6)}…` : ""}
        </p>
      </div>
      <div className="card">
        <strong>{label}</strong>
        {status ? <p className="muted">{status}</p> : null}
        {!hasLocalVault() ? (
          <p className="muted">Нет локального паспорта — будет выдан при первом шаге пути.</p>
        ) : null}
        <div className="row">
          <button className="btn btn-primary" disabled={busy} onClick={() => void refreshStatus()}>
            {tt("checkStatus")}
          </button>
        </div>
        {msg ? <p style={{ color: "var(--ok)" }}>{msg}</p> : null}
        {err ? <p style={{ color: "var(--maroon)" }}>{err}</p> : null}
      </div>
      {loading ? <p className="muted">{tt("loading")}</p> : null}
      {paths.map((p) => (
        <article key={p.id} className="card">
          <h3 style={{ margin: "0 0 8px" }}>{p.title}</h3>
          <p className="muted">{p.body}</p>
          {p.id === "pay" ? (
            <div className="row">
              <button className="btn btn-primary" disabled={busy || !wallet} onClick={() => void doPay()}>
                Оплатить взнос в кабинете
              </button>
              <button className="btn btn-ghost" onClick={openBulCoinDeposit}>
                Купить BulCoin
              </button>
            </div>
          ) : null}
          {p.id === "wallet" ? (
            <button className="btn btn-primary" disabled={busy || !wallet} onClick={() => void doWallet()}>
              Получить по кошельку / NFT
            </button>
          ) : null}
          {p.id === "docs" ? (
            <>
              <button className="btn btn-primary" disabled={busy} onClick={() => setDocsOpen((v) => !v)}>
                {docsOpen ? "Скрыть форму" : "Заполнить документы"}
              </button>
              {docsOpen ? (
                <div className="stack" style={{ marginTop: 12, gap: 8 }}>
                  {(
                    [
                      ["surname", "Фамилия"],
                      ["givenName", "Имя"],
                      ["patronymic", "Отчество"],
                      ["nationality", "Гражданство"],
                      ["birthPlace", "Место рождения"],
                      ["regPlace", "Регистрация"],
                      ["documentNumber", "Номер документа"],
                    ] as const
                  ).map(([key, label]) => (
                    <label key={key} className="muted" style={{ display: "block" }}>
                      {label}
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
                        }}
                      />
                    </label>
                  ))}
                  <button
                    className="btn btn-primary"
                    disabled={
                      busy ||
                      !claims.surname.trim() ||
                      !claims.givenName.trim() ||
                      !claims.birthPlace.trim() ||
                      !claims.documentNumber.trim()
                    }
                    onClick={() => void doDocs()}
                  >
                    Отправить + Sumsub
                  </button>
                  <div id="sumsub-websdk-container" />
                </div>
              ) : null}
            </>
          ) : null}
          {p.id === "lang" ? (
            <p className="muted">Endorse-путь — в следующей итерации (apply/endorse API уже в civicActions-плане).</p>
          ) : null}
        </article>
      ))}
    </div>
  );
}
