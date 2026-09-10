import { Link } from "react-router-dom";
import { useApp } from "../state/AppState";
import { SafeHtml } from "../components/SafeHtml";
import { bioToPlain } from "../ton/safeHtml";

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
        deputies.map((d, i) => {
          const title = d.name || (d as { fullName?: string }).fullName || d.address;
          const photo = d.photo || (d as { photoUrl?: string }).photoUrl;
          const bio = d.bio || "";
          return (
            <article key={d.address || i} className="card stack" style={{ gap: 8 }}>
              <div className="row" style={{ gap: 12, alignItems: "flex-start" }}>
                {photo ? (
                  <img
                    src={photo}
                    alt=""
                    style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover" }}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : null}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <strong>{title}</strong>
                  {d.age ? <p className="muted" style={{ margin: "4px 0 0" }}>{d.age}</p> : null}
                </div>
                {d.votes != null ? <span className="badge">{String(d.votes)}</span> : null}
              </div>
              {bio ? (
                /<[a-z][\s\S]*>/i.test(bio) ? (
                  <SafeHtml html={bio} className="profile-bio" />
                ) : (
                  <p className="muted" style={{ margin: 0 }}>
                    {bioToPlain(bio, 280)}
                  </p>
                )
              ) : null}
            </article>
          );
        })
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
