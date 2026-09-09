import { Link } from "react-router-dom";
import { useApp } from "../state/AppState";

export function Council() {
  const { tt, deputies } = useApp();

  return (
    <div className="stack">
      <h1 className="page-title">{tt("council")}</h1>
      <p className="muted">{tt("composition")}</p>

      {deputies.length === 0 ? (
        <div className="card">
          <p>{tt("emptyDeputies")}</p>
          <Link className="btn btn-ghost" to="/referendums">
            {tt("referendums")}
          </Link>
        </div>
      ) : (
        deputies.map((d, i) => (
          <article key={d.address || i} className="card">
            <strong>{d.name || d.address}</strong>
            {d.age ? <p className="muted">{d.age}</p> : null}
            {d.bio ? <p className="muted">{d.bio}</p> : null}
            {d.votes != null ? <span className="badge">{String(d.votes)}</span> : null}
            <div className="row" style={{ marginTop: 10 }}>
              <Link className="btn btn-ghost" to="/referendums">
                {tt("vote")}
              </Link>
            </div>
          </article>
        ))
      )}

      <div className="card stack" style={{ marginTop: 8 }}>
        <p className="muted">{tt("candidateHint")}</p>
        <Link className="btn btn-primary btn-wide" to="/council/nominate" data-testid="become-candidate">
          {tt("becomeCandidate")}
        </Link>
      </div>
    </div>
  );
}
