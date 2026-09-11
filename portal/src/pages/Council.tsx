import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useApp } from "../state/AppState";
import { SafeHtml } from "../components/SafeHtml";
import { bioToPlain } from "../ton/safeHtml";
import {
  clearTargetDelegations,
  fetchDelegationStatus,
  normalizePassportCommit,
  revokeVoteDelegation,
  setVoteDelegation,
  type DelegationStatus,
} from "../lib/civicActions";
import { hasLocalVault } from "../lib/passport";
import type { DeputyCard } from "../lib/civic";
import { buildResignProfileTx, fetchDeputyVoteHistory, type DeputyVoteRecord } from "../ton/deputy";
import { pathEnabled } from "../lib/civic";
import { isPartyAllowEnabled } from "../lib/votingCatalog";
import { resolveWallet } from "../lib/e2eHooks";

function deputyCommit(d: DeputyCard): string {
  return normalizePassportCommit(d.passportCommit || d.subject);
}

export function Council() {
  const { tt, deputies, params, votings } = useApp();
  const wallet = resolveWallet(useTonAddress());
  const [ui] = useTonConnectUI();
  const [del, setDel] = useState<DelegationStatus | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [historyFor, setHistoryFor] = useState<DeputyCard | null>(null);
  const [votes, setVotes] = useState<DeputyVoteRecord[]>([]);
  const [votesLoading, setVotesLoading] = useState(false);

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
  const langOn = pathEnabled(params, "lang");
  const partiesOn = isPartyAllowEnabled(params);

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

  async function openHistory(d: DeputyCard) {
    const owner = (d as { owner?: string }).owner || wallet;
    if (!owner && !d.address) {
      setErr(tt("delNoHistory"));
      return;
    }
    setHistoryFor(d);
    setVotesLoading(true);
    setVotes([]);
    try {
      const known = votings.map((v) => ({
        id: v.address || v.id || v.voting || "",
        title: v.title,
      }));
      // Prefer profile owner wallet for CivicCast history.
      const src = (d as { owner?: string }).owner || d.address || owner || "";
      const list = await fetchDeputyVoteHistory(src, known);
      setVotes(list);
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setVotesLoading(false);
    }
  }

  async function onResign(d: DeputyCard) {
    if (!wallet) {
      ui.openModal();
      return;
    }
    if (!d.address) {
      setErr(tt("delNoCommit"));
      return;
    }
    setBusy(true);
    setMsg("");
    setErr("");
    try {
      const tx = buildResignProfileTx(d.address);
      await ui.sendTransaction(tx);
      try {
        const cleared = await clearTargetDelegations();
        setMsg(tt("delResignOk", { n: String(cleared.cleared ?? 0) }));
      } catch {
        setMsg(tt("delResignOkChain"));
      }
      await refreshDel();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  if (historyFor) {
    const title = historyFor.name || historyFor.fullName || historyFor.address;
    return (
      <div className="stack">
        <button type="button" className="btn btn-ghost" style={{ alignSelf: "flex-start" }} onClick={() => setHistoryFor(null)}>
          ← {tt("council")}
        </button>
        <h1 className="page-title">{tt("delVoteHistory")}</h1>
        <p className="muted">{title}</p>
        {votesLoading ? <p className="muted">{tt("loading")}</p> : null}
        {!votesLoading && votes.length === 0 ? <p className="muted">{tt("delNoVotes")}</p> : null}
        {votes.map((v, i) => (
          <article key={`${v.voting}-${i}`} className="card stack" style={{ gap: 4 }}>
            <strong>{v.votingTitle || v.title || `${v.voting.slice(0, 12)}…`}</strong>
            {v.optionTitle ? <p className="muted" style={{ margin: 0 }}>{tt("delVotedFor", { opt: v.optionTitle })}</p> : null}
            {v.at > 0 ? (
              <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                {new Date(v.at).toLocaleString()}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    );
  }

  return (
    <div className="stack">
      <h1 className="page-title">{tt("council")}</h1>
      <p className="muted">{tt("composition")}</p>

      <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
        {partiesOn ? (
          <Link className="btn btn-ghost" to="/council/parties">
            {tt("parties")}
          </Link>
        ) : null}
        {langOn ? (
          <Link className="btn btn-ghost" to="/citizenship?path=lang">
            {tt("langEndorseLink")}
          </Link>
        ) : null}
      </div>

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
              <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
                {commit ? (
                  isCurrent ? (
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
                  )
                ) : (
                  <p className="muted" style={{ margin: 0, fontSize: 12 }}>
                    {tt("delNoCommit")}
                  </p>
                )}
                <button className="btn btn-ghost" disabled={busy} onClick={() => void openHistory(d)}>
                  {tt("delVoteHistory")}
                </button>
                {isSelf && d.address ? (
                  <button className="btn btn-ghost" disabled={busy} onClick={() => void onResign(d)}>
                    {tt("delResign")}
                  </button>
                ) : null}
              </div>
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
