import { useEffect, useState } from "react";
import { useApp } from "../state/AppState";
import { fetchCitizenshipStatus } from "../lib/civicActions";
import { formatJettonAmount, pathEnabled } from "../lib/civic";
import { hasLocalVault, getSession, unlockPassport } from "../lib/passport";
import { openBulCoinDeposit } from "../lib/telegram";

export function Citizenship() {
  const { tt, name, citizens, params, kyc, loading, wallet } = useApp();
  const [status, setStatus] = useState<string>("");
  const [citizen, setCitizen] = useState<boolean | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const paths = [
    pathEnabled(params, "pay") && {
      id: "pay",
      title: tt("pathPay"),
      body: `мин. ${formatJettonAmount(params.get("cit.path.pay.amount")?.numRaw || params.get("cit.path.pay.amount")?.num)}`,
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
          <p className="muted">Сначала восстановите или выдайте паспорт на экране входа.</p>
        ) : null}
        <div className="row">
          <button className="btn btn-primary" disabled={busy || !hasLocalVault()} onClick={() => void refreshStatus()}>
            {tt("checkStatus")}
          </button>
        </div>
        {err ? <p style={{ color: "var(--maroon)" }}>{err}</p> : null}
      </div>
      {loading ? <p className="muted">{tt("loading")}</p> : null}
      {paths.map((p) => (
        <article key={p.id} className="card">
          <h3 style={{ margin: "0 0 8px" }}>{p.title}</h3>
          <p className="muted">{p.body}</p>
          {p.id === "pay" ? (
            <button className="btn btn-primary" onClick={openBulCoinDeposit}>
              Купить BulCoin / оплатить путь
            </button>
          ) : (
            <p className="muted">Путь активируется после паспорта и оплаты/KYC в этом кабинете (без ухода на dao UI).</p>
          )}
        </article>
      ))}
    </div>
  );
}
