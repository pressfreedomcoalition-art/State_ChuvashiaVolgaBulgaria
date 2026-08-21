import { Link } from "react-router-dom";
import { useApp } from "../state/AppState";
import { officialDaoUrl, votingAddress, votingStatus } from "../lib/civic";
import { openOfficial } from "../lib/telegram";

export function Referendums() {
  const { tt, votings, loading } = useApp();
  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 className="page-title">{tt("referendums")}</h1>
        <button className="btn btn-ghost" onClick={() => openOfficial(officialDaoUrl("&create=1"))}>
          {tt("createVote")}
        </button>
      </div>
      {loading ? <p className="muted">{tt("loading")}</p> : null}
      {!loading && votings.length === 0 ? (
        <div className="card">
          <p>{tt("emptyVotes")}</p>
          <p className="muted">{tt("miss")}</p>
        </div>
      ) : null}
      {votings.map((v) => {
        const addr = votingAddress(v);
        const st = votingStatus(v);
        return (
          <article key={addr || v.title} className="card">
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
