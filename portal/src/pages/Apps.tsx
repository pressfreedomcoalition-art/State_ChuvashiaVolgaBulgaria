import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../state/AppState";
import { loadCabinetCatalog, type CabinetApp } from "../lib/cabinetCatalog";
import { openExternal } from "../lib/telegram";

export function Apps() {
  const { tt } = useApp();
  const [apps, setApps] = useState<CabinetApp[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void (async () => {
      setLoading(true);
      setErr("");
      try {
        const { catalog } = await loadCabinetCatalog();
        if (alive) setApps(catalog.apps);
      } catch (e) {
        if (alive) setErr(e instanceof Error ? e.message : String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="stack">
      <h1 className="page-title">{tt("apps")}</h1>
      <p className="muted">{tt("appsHint")}</p>
      {loading ? <p className="muted">{tt("loading")}</p> : null}
      {err ? <p style={{ color: "var(--maroon)" }}>{err}</p> : null}
      {apps.map((a) => (
        <article key={a.id} className="card" data-testid="hub-app">
          <div className="row" style={{ gap: 12, alignItems: "center" }}>
            {a.icon ? (
              <img src={a.icon} alt="" width={40} height={40} style={{ borderRadius: 8 }} />
            ) : null}
            <div style={{ flex: 1 }}>
              <strong>{a.name}</strong>
              {a.description ? <p className="muted" style={{ margin: "4px 0 0" }}>{a.description}</p> : null}
              <p className="muted" style={{ margin: "4px 0 0", fontSize: 12 }}>
                {a.type}
              </p>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            style={{ marginTop: 12 }}
            onClick={() => openExternal(a.url)}
          >
            {tt("openApp")}
          </button>
        </article>
      ))}
      {!loading && !err && !apps.length ? (
        <div className="card">
          <p className="muted">{tt("appsEmpty")}</p>
        </div>
      ) : null}
      <Link className="btn btn-ghost" to="/settings">
        ← {tt("settings")}
      </Link>
    </div>
  );
}
