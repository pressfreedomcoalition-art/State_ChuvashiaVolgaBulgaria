import { Link } from "react-router-dom";
import { useApp } from "../state/AppState";
import { votingAddress, votingStatus } from "../lib/civic";

/** Passed / finished referendums — public (no login required). */
export function Laws() {
  const { tt, votings, loading, error } = useApp();
  const laws = votings.filter((v) => votingStatus(v) === "finished");

  return (
    <div className="stack">
      <h1 className="page-title">{tt("laws")}</h1>
      <p className="muted">{tt("lawsHint")}</p>
      {loading ? <p className="muted">{tt("loading")}</p> : null}
      {error ? <p style={{ color: "var(--maroon)" }}>{error}</p> : null}
      {!loading && laws.length === 0 ? (
        <div className="card">
          <p>{tt("lawsEmpty")}</p>
          <Link className="btn btn-ghost" to="/referendums">
            {tt("referendums")}
          </Link>
        </div>
      ) : null}
      {laws.map((v) => {
        const addr = votingAddress(v);
        return (
          <article key={addr || v.title} className="card" data-testid="law-card">
            <span className="badge badge-ok">{tt("votingDone")}</span>
            <h3 style={{ margin: "10px 0 8px" }}>{v.title || addr}</h3>
            {v.description ? <p className="muted">{v.description}</p> : null}
            <Link className="btn btn-primary" to={`/referendums/${encodeURIComponent(addr)}`}>
              {tt("results")}
            </Link>
          </article>
        );
      })}
    </div>
  );
}
