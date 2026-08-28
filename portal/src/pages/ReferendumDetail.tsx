import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTonAddress } from "@tonconnect/ui-react";
import { useApp } from "../state/AppState";
import { votingStatus, type VotingState } from "../lib/civic";
import { castCivicVote } from "../lib/civicActions";
import { hasLocalVault } from "../lib/passport";

export function ReferendumDetail() {
  const { address = "" } = useParams();
  const { tt, loadVoting, votings } = useApp();
  const wallet = useTonAddress();
  const [state, setState] = useState<VotingState | null>(null);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void loadVoting(address).then(setState);
  }, [address, loadVoting]);

  const row = votings.find((v) => (v.address || v.voting) === address);
  const title = state?.title || row?.title || address;
  const desc = state?.description || row?.description || "";
  const st = votingStatus(state || row);
  const options = state?.options || state?.results || row?.options || [];
  const total = options.reduce((s, o) => s + Number(o.votes || o.weight || 0), 0);

  async function vote(optionAddress?: string, label?: string) {
    setBusy(true);
    setErr("");
    try {
      if (!wallet) throw new Error("Подключите кошелёк");
      if (!hasLocalVault()) throw new Error("Сначала разблокируйте паспорт");
      const opt =
        optionAddress ||
        options.find((o) => (o.title || o.text || "").toLowerCase().includes((label || "").toLowerCase()))
          ?.address;
      if (!opt && options[0]?.address) {
        // pick by index: yes=0 no=1 heuristic
        const idx = label === "no" || label === tt("no") ? 1 : 0;
        const chosen = options[idx]?.address || options[0]?.address;
        if (!chosen) throw new Error("Нет адреса опции в кеше — дождитесь votingState");
        await castCivicVote({ voting: address, optionAddress: chosen, voter: wallet });
      } else if (opt) {
        await castCivicVote({ voting: address, optionAddress: opt, voter: wallet });
      } else {
        throw new Error("Нет optionAddress в снимке опроса");
      }
      setDone(true);
      void loadVoting(address).then(setState);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <Link to="/referendums" className="muted">
        ← {tt("referendums")}
      </Link>
      <h1 className="page-title">{title}</h1>
      <span className={`badge ${st === "finished" ? "badge-ok" : "badge-run"}`}>
        {st === "finished" ? tt("votingDone") : tt("votingOpen")}
      </span>
      {desc ? (
        <div className="card">
          <p>{desc}</p>
        </div>
      ) : null}

      {done ? (
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--ok)", fontWeight: 700 }}>{tt("voted")}</p>
        </div>
      ) : st === "finished" ? (
        <div className="card">
          <h3>{tt("results")}</h3>
          {(options.length ? options : [{ title: tt("yes") }, { title: tt("no") }]).map((o) => {
            const n = Number(o.votes || o.weight || 0);
            const pct = o.pct ?? (total ? Math.round((n / total) * 100) : 0);
            return (
              <div key={o.title || o.address} style={{ marginTop: 12 }}>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span>{o.title || o.text}</span>
                  <strong>{pct}%</strong>
                </div>
                <div className="bar">
                  <i style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card">
          <h3>{tt("vote")}</h3>
          <p className="muted">Голос уходит silent-relay с вашим presentation (Face ID), без открытия dao UI.</p>
          {options.length >= 2 ? (
            <div className="row">
              {options.map((o) => (
                <button
                  key={o.address || o.title}
                  className="btn btn-primary"
                  disabled={busy}
                  onClick={() => void vote(o.address, o.title || o.text)}
                >
                  {o.title || o.text || "…"}
                </button>
              ))}
            </div>
          ) : (
            <div className="row">
              <button className="btn btn-primary" disabled={busy} onClick={() => void vote(undefined, "yes")}>
                {tt("yes")}
              </button>
              <button className="btn btn-ghost" disabled={busy} onClick={() => void vote(undefined, "no")}>
                {tt("no")}
              </button>
            </div>
          )}
          {err ? <p style={{ color: "var(--maroon)" }}>{err}</p> : null}
        </div>
      )}
    </div>
  );
}
