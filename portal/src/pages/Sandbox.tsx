import { useEffect, useState } from "react";
import { civicBase, DAO_ADDRESS, PORTAL_ORIGIN, TG_BOT_URL } from "../lib/config";
import { civicGet } from "../lib/civic";
import { clearBugLog, getBugLog, type BugEntry } from "../lib/bugLog";

export function Sandbox() {
  const [pub, setPub] = useState("…");
  const [count, setCount] = useState("…");
  const [bugs, setBugs] = useState<BugEntry[]>(() => getBugLog());

  useEffect(() => {
    void civicGet<{ ok?: boolean }>("/v1/public")
      .then((r) => setPub(r.ok ? "ok" : "fail"))
      .catch((e) => setPub(String(e)));
    void civicGet<{ count?: number }>(`/v1/citizenship/count?dao=${DAO_ADDRESS}`)
      .then((r) => setCount(String(r.count ?? "?")))
      .catch((e) => setCount(String(e)));
  }, []);

  return (
    <div className="content stack">
      <h1 className="page-title">Sandbox</h1>
      <div className="card" data-testid="sandbox-public">
        civic /v1/public: <strong>{pub}</strong>
      </div>
      <div className="card" data-testid="sandbox-count">
        citizens: <strong>{count}</strong>
      </div>
      <div className="card">
        origin {PORTAL_ORIGIN} · api {civicBase()} · bot {TG_BOT_URL}
      </div>
      <div className="card stack" data-testid="sandbox-bugs">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <strong>Bug log ({bugs.length})</strong>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              clearBugLog();
              setBugs([]);
            }}
          >
            Очистить
          </button>
        </div>
        {bugs.length === 0 ? (
          <p className="muted">Ошибок в localStorage нет.</p>
        ) : (
          bugs.slice(0, 15).map((b) => (
            <details key={b.id}>
              <summary>
                [{b.kind}] {new Date(b.ts).toLocaleString()} — {b.message.slice(0, 120)}
                {b.autoFix ? ` · fix: ${b.autoFix}${b.fixed ? " ✓" : ""}` : ""}
              </summary>
              {b.stack ? <pre style={{ fontSize: 11, overflow: "auto" }}>{b.stack}</pre> : null}
            </details>
          ))
        )}
      </div>
    </div>
  );
}
