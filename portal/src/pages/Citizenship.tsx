import { useApp } from "../state/AppState";
import { formatJettonAmount, officialDaoUrl, officialEligUrl, pathEnabled } from "../lib/civic";
import { PORTAL_ORIGIN } from "../lib/config";
import { openOfficial } from "../lib/telegram";

export function Citizenship() {
  const { tt, name, citizens, params, kyc, eligible, loading } = useApp();

  const paths = [
    pathEnabled(params, "pay") && {
      id: "pay",
      title: tt("pathPay"),
      body: `мин. ${formatJettonAmount(params.get("cit.path.pay.amount")?.numRaw || params.get("cit.path.pay.amount")?.num)} · ${params.get("cit.path.pay.amount")?.str ? "jetton" : "TON"}`,
    },
    pathEnabled(params, "docs") && {
      id: "docs",
      title: tt("pathDocs"),
      body: kyc
        ? `Sumsub · от ${kyc.feeFloorUsdt} ${kyc.defaultFeeSymbol || "USDT"}`
        : "Sumsub KYC",
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

  const status =
    eligible === true ? tt("isCitizen") : eligible === false ? tt("notCitizen") : tt("unknownCitizen");

  return (
    <div className="stack">
      <div>
        <h1 className="page-title">{tt("citizenship")}</h1>
        <p className="muted">
          {name}
          {citizens != null ? ` · ${citizens} ${tt("citizens")}` : ""}
        </p>
      </div>
      <div className="card">
        <strong>{status}</strong>
        <p className="muted">{tt("passportHint")}</p>
        <div className="row">
          <button className="btn btn-primary" onClick={() => openOfficial(officialDaoUrl())}>
            {tt("goOfficial")}
          </button>
          <button
            className="btn btn-ghost"
            onClick={() =>
              openOfficial(officialEligUrl(`${PORTAL_ORIGIN}/elig`))
            }
          >
            {tt("checkStatus")}
          </button>
        </div>
      </div>
      {loading ? <p className="muted">{tt("loading")}</p> : null}
      {paths.length === 0 ? (
        <div className="card muted">Пути гражданства появятся, когда ДАО включит cit.path.*</div>
      ) : (
        paths.map((p) => (
          <article key={p.id} className="card">
            <h3 style={{ margin: "0 0 8px" }}>{p.title}</h3>
            <p className="muted">{p.body}</p>
            <button className="btn btn-primary" onClick={() => openOfficial(officialDaoUrl())}>
              {tt("goOfficial")}
            </button>
          </article>
        ))
      )}
    </div>
  );
}
