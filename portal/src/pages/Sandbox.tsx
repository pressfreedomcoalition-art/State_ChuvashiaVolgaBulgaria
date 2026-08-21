import { useEffect, useState } from "react";
import { civicBase, DAO_ADDRESS, PORTAL_ORIGIN, TG_BOT_URL } from "../lib/config";
import { civicGet } from "../lib/civic";

export function Sandbox() {
  const [pub, setPub] = useState("…");
  const [count, setCount] = useState("…");

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
    </div>
  );
}
