import { useState } from "react";
import { useApp } from "../state/AppState";
import { officialDaoUrl } from "../lib/civic";
import { openOfficial } from "../lib/telegram";

export function Council() {
  const { tt, deputies } = useApp();
  const [tab, setTab] = useState<"elections" | "bills" | "composition">("elections");
  const [applied, setApplied] = useState(false);

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <h1 className="page-title">{tt("council")}</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setApplied(true);
            openOfficial(officialDaoUrl());
          }}
        >
          {tt("becomeCandidate")}
        </button>
      </div>
      <div className="tabs">
        <button className={tab === "elections" ? "on" : ""} onClick={() => setTab("elections")}>
          {tt("elections")}
        </button>
        <button className={tab === "bills" ? "on" : ""} onClick={() => setTab("bills")}>
          {tt("bills")}
        </button>
        <button className={tab === "composition" ? "on" : ""} onClick={() => setTab("composition")}>
          {tt("composition")}
        </button>
      </div>
      {applied ? (
        <div className="card">
          <p style={{ color: "var(--ok)", fontWeight: 700 }}>{tt("voted")}</p>
        </div>
      ) : null}
      {tab === "bills" ? (
        <div className="card muted">Законопроекты идут как референдумы. Отдельного списка пока нет.</div>
      ) : deputies.length === 0 ? (
        <div className="card">
          <p>{tt("emptyDeputies")}</p>
          <button className="btn btn-ghost" onClick={() => openOfficial(officialDaoUrl())}>
            {tt("goOfficial")}
          </button>
        </div>
      ) : (
        deputies.map((d, i) => (
          <article key={d.address || i} className="card row">
            <div>
              <strong>{d.name || d.address}</strong>
              {d.age ? <span className="muted"> · {d.age}</span> : null}
              {d.bio ? <p className="muted">{d.bio}</p> : null}
              {d.votes != null ? <span className="badge">{String(d.votes)}</span> : null}
            </div>
            <button className="btn btn-primary" onClick={() => openOfficial(officialDaoUrl())}>
              {tab === "composition" ? tt("goOfficial") : tt("vote")}
            </button>
          </article>
        ))
      )}
    </div>
  );
}
