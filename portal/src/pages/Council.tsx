import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../state/AppState";
import { SafeHtml } from "../components/SafeHtml";
import { bioToPlain } from "../ton/safeHtml";
import {
  fetchDelegationStatus,
  normalizePassportCommit,
  revokeVoteDelegation,
  setVoteDelegation,
  type DelegationStatus,
} from "../lib/civicActions";
import { hasLocalVault } from "../lib/passport";
import type { DeputyCard } from "../lib/civic";

function deputyCommit(d: DeputyCard): string {
  return normalizePassportCommit(d.passportCommit || d.subject);
}

export function Council() {
  const { tt, deputies } = useApp();
  const [del, setDel] = useState<DelegationStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const refreshDel = useCallback(async () => {
    if (!hasLocalVault()) {
      setDel(null);
      return;
    }
    try {
      const st = await fetchDelegationStatus();
      setDel(st);
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    void refreshDel();
  }, [refreshDel]);

  const myCommit = normalizePassportCommit(del?.myCommit);
  const delegateTo = normalizePassportCommit(del?.delegateTo);

  async function onDelegate(toCommit: string) {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const st = await setVoteDelegation(toCommit);
      setDel(st);
      setMsg(tt("delSetOk"));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function onRevoke() {
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const st = await revokeVoteDelegation();
      setDel(st);
      setMsg(tt("delRevokeOk"));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <h1 className="page-title">{tt("council")}</h1>
      <p className="muted">{tt("composition")}</p>

      <div className="card stack" style={{ gap: 8 }}>
        <strong>{tt("delTitle")}</strong>
        <p className="muted" style={{ margin: 0 }}>
          {tt("delHint")}
        </p>
        {delegateTo ? (
          <p style={{ margin: 0 }}>
            {tt("delDelegateTo")}: <code>{delegateTo.slice(0, 16)}…</code>
          </p>
        ) : (
          <p className="muted" style={{ margin: 0 }}>
            {tt("delCurrentNone")}
          </p>
        )}
        {delegateTo ? (
          <button className="btn btn-ghost" disabled={busy || !hasLocalVault()} onClick={() => void onRevoke()}>
            {tt("delRevoke")}
          </button>
        ) : null}
        {msg ? <p style={{ color: "var(--ok)", margin: 0 }}>{msg}</p> : null}
        {err ? <p style={{ color: "var(--maroon)", margin: 0 }}>{err}</p> : null}
      </div>

      {deputies.length === 0 ? (
        <div className="card">
          <p>{tt("emptyDeputies")}</p>
          <Link className="btn btn-ghost" to="/referendums">
            {tt("referendums")}
          </Link>
        </div>
      ) : (
        deputies.map((d, i) => {
          const title = d.name || d.fullName || d.address;
          const photo = d.photo || d.photoUrl;
          const bio = d.bio || "";
          const commit = deputyCommit(d);
          const isSelf = !!myCommit && !!commit && myCommit === commit;
          const isCurrent = !!delegateTo && !!commit && delegateTo === commit;
          return (
            <article key={d.address || commit || i} className="card stack" style={{ gap: 8 }}>
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
                  {commit ? (
                    <p className="muted" style={{ margin: "4px 0 0", wordBreak: "break-all", fontSize: 12 }}>
                      {commit.slice(0, 14)}…
                    </p>
                  ) : null}
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
              {commit ? (
                <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                  {isCurrent ? (
                    <button className="btn btn-ghost" disabled={busy} onClick={() => void onRevoke()}>
                      {tt("delRevoke")}
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary"
                      disabled={busy || isSelf || !hasLocalVault()}
                      title={isSelf ? tt("delSelf") : undefined}
                      onClick={() => void onDelegate(commit)}
                    >
                      {tt("delSet")}
                    </button>
                  )}
                </div>
              ) : (
                <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                  {tt("delNoCommit")}
                </p>
              )}
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
