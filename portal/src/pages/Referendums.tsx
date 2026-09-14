import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../state/AppState";
import { endsAtMs, votingAddress, votingDeadlineKind, votingDisplayStatus } from "../lib/civic";
import { formatDateTime } from "../lib/format";

const LIST_POLL_MS = 45_000;

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

  // Soft revalidate while the tab is open (CACHE_POLICY: votings ~45s).
  useEffect(() => {
    const t = window.setInterval(() => {
      void refresh({ forceVotings: true });
    }, LIST_POLL_MS);
    return () => window.clearInterval(t);
  }, [refresh]);

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
        const st = votingDisplayStatus(v);
        const endMs = endsAtMs(v);
        const endLabel = endMs ? formatDateTime(endMs) : "";
        const deadlineKind = votingDeadlineKind(v);
        const opts = (v.options || []).filter((o) => o.title || o.text || o.address);
        const showOutcome = (st === "finished" || st === "awaiting_finalize") && opts.length > 0;
        const deadlineCaption =
          endLabel && deadlineKind
            ? deadlineKind === "ended"
              ? tt("endedAt", { when: endLabel })
              : deadlineKind === "expired"
                ? tt("expiredAt", { when: endLabel })
                : tt("endsAt", { when: endLabel })
            : "";
        return (
          <article key={addr || v.title} className="card" data-testid="voting-card">
            <span className={`badge ${st === "finished" ? "badge-ok" : "badge-run"}`}>
              {st === "finished"
                ? tt("votingDone")
                : st === "pending"
                  ? tt("votingPending")
                  : st === "awaiting_finalize"
                    ? tt("votingAwaitFinalize")
                    : tt("votingOpen")}
            </span>
            {deadlineCaption ? (
              <p className="muted" style={{ margin: "8px 0 0" }}>
                {deadlineCaption}
              </p>
            ) : null}
            <h3 style={{ margin: "10px 0 8px" }}>{v.title || addr}</h3>
            {v.description ? <p className="muted">{v.description}</p> : null}
            {showOutcome ? (
              <ul style={{ margin: "0 0 12px", paddingLeft: 18 }} data-testid="voting-card-results">
                {opts.map((o) => {
                  const votes = Number(o.votes ?? o.weight ?? 0);
                  const pct = o.pct != null ? Number(o.pct) : null;
                  return (
                    <li key={o.address || o.title || o.text} className="muted" style={{ marginBottom: 4 }}>
                      <strong style={{ color: "var(--ink, inherit)" }}>{o.title || o.text || "—"}</strong>
                      {": "}
                      {votes}
                      {pct != null && Number.isFinite(pct) ? ` (${pct}%)` : ""}
                    </li>
                  );
                })}
              </ul>
            ) : null}
            <Link className="btn btn-primary" to={`/referendums/${encodeURIComponent(addr)}`}>
              {st === "finished" || st === "awaiting_finalize" ? tt("results") : tt("vote")}
            </Link>
          </article>
        );
      })}
    </div>
  );
}
