import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useApp } from "../state/AppState";
import { officialDaoUrl, votingStatus, type VotingState } from "../lib/civic";
import { openOfficial } from "../lib/telegram";

export function ReferendumDetail() {
  const { address = "" } = useParams();
  const { tt, loadVoting, votings } = useApp();
  const [state, setState] = useState<VotingState | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    void loadVoting(address).then(setState);
  }, [address, loadVoting]);

  const row = votings.find((v) => (v.address || v.voting) === address);
  const title = state?.title || row?.title || address;
  const desc = state?.description || row?.description || "";
  const st = votingStatus(state || row);
  const options = state?.options || state?.results || row?.options || [];
  const total = options.reduce((s, o) => s + Number(o.votes || o.weight || 0), 0);

  return (
    <div className="stack">
      <Link to="/referendums" className="muted">
        ← {tt("referendums")}
      </Link>
      <h1 className="page-title">{title}</h1>
      <span className={`badge ${st === "finished" ? "badge-ok" : "badge-run"}`}>
        {st === "finished" ? tt("votingDone") : tt("votingOpen")}
      </span>
      {desc ? (
        <div className="card">
          <h3>{tt("results") === "Результаты" ? "Обоснование" : "Rationale"}</h3>
          <p>{desc}</p>
        </div>
      ) : null}

      {done ? (
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--ok)", fontWeight: 700 }}>{tt("voted")}</p>
        </div>
      ) : st === "finished" ? (
        <div className="card">
          <h3>{tt("results")}</h3>
          {(options.length ? options : [{ title: tt("yes") }, { title: tt("no") }]).map((o) => {
            const n = Number(o.votes || o.weight || 0);
            const pct = o.pct ?? (total ? Math.round((n / total) * 100) : 0);
            return (
              <div key={o.title || o.address} style={{ marginTop: 12 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span>{o.title || o.text}</span>
                  <strong>{pct}%</strong>
                </div>
                <div className="bar">
                  <i style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <h3>{tt("vote")}</h3>
          <div className="row">
            <button
              className="btn btn-primary"
              onClick={() => {
                setDone(true);
                openOfficial(officialDaoUrl(`&voting=${address}`));
              }}
            >
              {tt("yes")}
            </button>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setDone(true);
                openOfficial(officialDaoUrl(`&voting=${address}`));
              }}
            >
              {tt("no")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
