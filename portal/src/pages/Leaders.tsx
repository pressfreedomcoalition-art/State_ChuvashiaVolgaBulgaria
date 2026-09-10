import { Link } from "react-router-dom";
import { useMemo } from "react";
import { useApp } from "../state/AppState";
import { shortAddr } from "../lib/civic";
import { bioToPlain } from "../ton/safeHtml";

/** Opinion leaders / deputies ranked by votes — public. */
export function Leaders() {
  const { tt, deputies, loading } = useApp();
  const ranked = useMemo(() => {
    return [...deputies].sort((a, b) => Number(b.votes || 0) - Number(a.votes || 0));
  }, [deputies]);

  return (
    <div className="stack">
      <h1 className="page-title">{tt("leaders")}</h1>
      <p className="muted">{tt("leadersHint")}</p>
      {loading ? <p className="muted">{tt("loading")}</p> : null}
      {!loading && ranked.length === 0 ? (
        <div className="card">
          <p>{tt("emptyDeputies")}</p>
          <Link className="btn btn-ghost" to="/council">
            {tt("council")}
          </Link>
        </div>
      ) : null}
      {ranked.map((d, i) => (
        <article key={d.address || i} className="card" data-testid="leader-card">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <strong>
              {i + 1}. {d.name || (d as { fullName?: string }).fullName || shortAddr(d.address || "", 4, 4)}
            </strong>
            {d.votes != null ? (
              <span className="badge badge-ok">
                {tt("leaderVotes")}: {String(d.votes)}
              </span>
            ) : null}
          </div>
          {d.age ? <p className="muted">{d.age}</p> : null}
          {d.bio ? <p className="muted">{bioToPlain(d.bio, 160)}</p> : null}
          {d.address ? <p className="muted">{shortAddr(d.address, 6, 4)}</p> : null}
        </article>
      ))}
    </div>
  );
}
