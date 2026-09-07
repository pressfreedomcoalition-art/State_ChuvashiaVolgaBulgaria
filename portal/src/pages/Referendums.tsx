import { useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../state/AppState";
import { votingAddress, votingStatus } from "../lib/civic";

export function Referendums() {
  const { tt, votings, loading, refresh, error } = useApp();
  const [busy, setBusy] = useState(false);

  async function onRefresh() {
    setBusy(true);
    try {
      await refresh({ forceVotings: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <h1 className="page-title">{tt("referendums")}</h1>
      <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
        <Link className="btn btn-primary" to="/referendums/new">
          {tt("createVote")}
        </Link>
        <button
          type="button"
          className="btn btn-ghost"
          disabled={busy || loading}
          onClick={() => void onRefresh()}
          data-testid="votings-refresh"
        >
          {tt("reload")}
        </button>
      </div>
      {loading || busy ? <p className="muted">{tt("loading")}</p> : null}
      {error ? <p style={{ color: "var(--maroon)" }}>{error}</p> : null}
      {!loading && !busy && votings.length === 0 ? (
        <div className="card">
          <p>{tt("emptyVotes")}</p>
          <p className="muted">{tt("miss")}</p>
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => void onRefresh()}>
            {tt("reload")}
          </button>
          <Link className="btn btn-primary" to="/referendums/new">
            {tt("createVote")}
          </Link>
        </div>
      ) : null}
      {votings.map((v) => {
        const addr = votingAddress(v);
        const st = votingStatus(v);
        return (
          <article key={addr || v.title} className="card" data-testid="voting-card">
            <span className={`badge ${st === "finished" ? "badge-ok" : "badge-run"}`}>
              {st === "finished" ? tt("votingDone") : st === "pending" ? tt("votingPending") : tt("votingOpen")}
            </span>
            <h3 style={{ margin: "10px 0 8px" }}>{v.title || addr}</h3>
            {v.description ? <p className="muted">{v.description}</p> : null}
            <Link className="btn btn-primary" to={`/referendums/${encodeURIComponent(addr)}`}>
              {st === "finished" ? tt("results") : tt("vote")}
            </Link>
          </article>
        );
      })}
    </div>
  );
}
