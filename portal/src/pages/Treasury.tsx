import { useState } from "react";
import { useApp } from "../state/AppState";
import { DAO_ADDRESS } from "../lib/config";
import { formatTon, shortAddr } from "../lib/civic";

export function Treasury() {
  const { tt, treasury, loading } = useApp();
  const [copied, setCopied] = useState(false);

  const ton = treasury?.ton ?? treasury?.governance;
  const extra = treasury?.jettons || [];

  return (
    <div className="stack">
      <h1 className="page-title">{tt("treasury")}</h1>
      <p className="muted">{tt("treasuryLead")}</p>
      {loading ? <p className="muted">{tt("loading")}</p> : null}
      <div className="card">
        <h3>TON</h3>
        <p style={{ fontSize: 28, margin: "8px 0" }}>{formatTon(ton)}</p>
        {extra.map((j) => (
          <p key={j.master || j.symbol}>
            {j.symbol || "JETTON"}: {String(j.amount ?? "—")}
          </p>
        ))}
        {treasury?.jetton != null && !extra.length ? <p>Jetton: {String(treasury.jetton)}</p> : null}
        {!treasury ? <p className="muted">{tt("miss")}</p> : null}
      </div>
      <div className="card">
        <h3>DAO</h3>
        <p>{shortAddr(DAO_ADDRESS, 10, 8)}</p>
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
      </div>
    </div>
  );
}
