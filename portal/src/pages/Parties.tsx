import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../state/AppState";
import { DAO_ADDRESS } from "../lib/config";
import { cacheGet, type DeputyCard } from "../lib/civic";
import { SafeHtml } from "../components/SafeHtml";
import { bioToPlain } from "../ton/safeHtml";
import { isPartyAllowEnabled } from "../lib/votingCatalog";

function asList<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v && typeof v === "object" && Array.isArray((v as { items?: unknown[] }).items)) {
    return (v as { items: T[] }).items;
  }
  return [];
}

export function Parties() {
  const { tt, params, deputies } = useApp();
  const [parties, setParties] = useState<DeputyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const allowed = isPartyAllowEnabled(params);

  useEffect(() => {
    let alive = true;
    void (async () => {
      setLoading(true);
      try {
        const fromCache = await cacheGet<unknown>(`parties:${DAO_ADDRESS}`).catch(() => null);
        let list = asList<DeputyCard>(fromCache);
        if (!list.length) {
          list = deputies.filter((d) => (d as { kind?: number }).kind === 1);
        }
        if (alive) setParties(list);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [deputies]);

  return (
    <div className="stack">
      <Link className="btn btn-ghost" style={{ alignSelf: "flex-start" }} to="/council">
        ← {tt("council")}
      </Link>
      <h1 className="page-title">{tt("parties")}</h1>
      <p className="muted">{tt("partiesHint")}</p>
      {!allowed ? <p className="muted">{tt("partiesOff")}</p> : null}
      {loading ? <p className="muted">{tt("loading")}</p> : null}
      {!loading && parties.length === 0 ? (
        <div className="card">
          <p className="muted">{tt("partiesEmpty")}</p>
          <Link className="btn btn-ghost" to="/referendums/new?vtype=21">
            {tt("partiesEnableVote")}
          </Link>
        </div>
      ) : null}
      {parties.map((p, i) => {
        const title = p.name || p.fullName || p.address;
        const photo = p.photo || p.photoUrl;
        const bio = p.bio || "";
        return (
          <article key={p.address || i} className="card stack" style={{ gap: 8 }}>
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
                {p.address ? (
                  <p className="muted" style={{ margin: "4px 0 0", fontSize: 12, wordBreak: "break-all" }}>
                    {p.address}
                  </p>
                ) : null}
              </div>
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
      })}
    </div>
  );
}
