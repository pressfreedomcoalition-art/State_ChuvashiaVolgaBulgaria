import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useApp } from "../state/AppState";
import { bounceableAddr, votingStatus, type VotingState } from "../lib/civic";
import { castCivicVote } from "../lib/civicActions";
import { finalizeVoting, launchVoting, readPendingLaunch } from "../lib/createVotingFlow";
import { isE2eTestnet, resolveWallet } from "../lib/e2eHooks";
import { hasLocalVault, unlockPassportSilent } from "../lib/passport";

function optionVotes(o: { votes?: number; weight?: number }) {
  return Number(o.votes || o.weight || 0);
}

export function ReferendumDetail() {
  const { address: rawAddress = "" } = useParams();
  const address = bounceableAddr(decodeURIComponent(rawAddress));
  const [params] = useSearchParams();
  const { tt, loadVoting, votings, refresh } = useApp();
  const wallet = resolveWallet(useTonAddress());
  const [ui] = useTonConnectUI();
  const [state, setState] = useState<VotingState | null>(null);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");
  const pending = readPendingLaunch(address);

  async function reload() {
    const st = await loadVoting(address);
    setState(st);
    return st;
  }

  useEffect(() => {
    void reload();
    const t = window.setInterval(() => {
      void reload();
    }, 12_000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, loadVoting]);

  useEffect(() => {
    if (params.get("launch") !== "1" || !pending?.opts?.length || !wallet) return;
    let cancelled = false;
    void (async () => {
      setBusy(true);
      setInfo("Ждём деплой опроса…");
      await new Promise((r) => setTimeout(r, isE2eTestnet() ? 50 : 12_000));
      if (cancelled) return;
      setInfo("Добавляем опции и запускаем…");
      try {
        await launchVoting({
          ui,
          voting: address,
          optionTitles: pending.opts,
          executable: pending.executable,
        });
        if (cancelled) return;
        setInfo("Запущено");
        await refresh();
        await reload();
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, params, wallet]);

  const row = useMemo(() => {
    const want = bounceableAddr(address);
    return votings.find((v) => bounceableAddr(v.address || v.voting || "") === want);
  }, [votings, address]);

  const title = state?.title || state?.name || row?.title || address;
  const desc = state?.description || row?.description || "";
  const st = votingStatus(state || row);
  const options = state?.options || state?.results || row?.options || [];
  const total = options.reduce((s, o) => s + optionVotes(o), 0);
  const canVote = st === "active" || st === "unknown";

  function ResultsBars() {
    const list = options.length ? options : [{ title: tt("yes"), votes: 0 }, { title: tt("no"), votes: 0 }];
    return (
      <div className="card" data-testid="vote-bars">
        <h3>{tt("results")}</h3>
        {list.map((o) => {
          const n = optionVotes(o);
          const pct = o.pct ?? (total ? Math.round((n / total) * 100) : 0);
          return (
            <div key={o.address || o.title || o.text} style={{ marginTop: 12 }}>
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span>
                  {o.title || o.text}
                  {n ? ` · ${n}` : ""}
                </span>
                <strong>{pct}%</strong>
              </div>
              <div className="bar">
                <i style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  async function resolveOptionAddress(optionAddress?: string, label?: string): Promise<string> {
    let opts = options;
    if (!opts.some((o) => o.address)) {
      const fresh = await reload();
      opts = fresh?.options || [];
    }
    if (optionAddress) return optionAddress;

    const lab = (label || "").toLowerCase();
    const yesLike = lab === "yes" || lab === "да" || lab === "за" || lab === tt("yes").toLowerCase();
    const noLike = lab === "no" || lab === "нет" || lab === "против" || lab === tt("no").toLowerCase();

    const byTitle = opts.find((o) => {
      const t = (o.title || o.text || "").toLowerCase();
      if (!lab) return false;
      if (yesLike) return t.includes("за") || t.includes("yes") || t.includes("да") || t.includes("approve");
      if (noLike) return t.includes("против") || t.includes("no") || t.includes("нет") || t.includes("reject");
      return t.includes(lab);
    });
    if (byTitle?.address) return byTitle.address;

    const idx = noLike ? 1 : 0;
    const chosen = opts[idx]?.address || opts[0]?.address;
    if (!chosen) throw new Error("Нет адреса опции в кеше — обновите страницу через пару секунд");
    return chosen;
  }

  async function vote(optionAddress?: string, label?: string) {
    setBusy(true);
    setErr("");
    setInfo("");
    try {
      if (!wallet) throw new Error("Подключите кошелёк");
      if (!hasLocalVault()) throw new Error("Сначала разблокируйте паспорт");
      // Avoid Face ID hang on re-vote in Mini App — open vault silently when possible.
      unlockPassportSilent();
      const chosen = await resolveOptionAddress(optionAddress, label);
      await castCivicVote({ voting: address, optionAddress: chosen, voter: wallet });
      setDone(true);
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function doLaunch() {
    if (!wallet) {
      ui.openModal();
      return;
    }
    const titles =
      pending?.opts?.length && pending.opts.length >= 2
        ? pending.opts
        : options.map((o) => o.title || o.text || "").filter(Boolean);
    if (titles.length < 2 && !pending?.opts?.length) {
      setErr("Нужны минимум 2 опции (создайте голосование с вариантами или дождитесь кеша)");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await launchVoting({
        ui,
        voting: address,
        optionTitles: titles.length >= 2 ? titles : pending!.opts,
        executable: pending?.executable,
      });
      setInfo("Запущено");
      await refresh();
      await reload();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function doFinalize() {
    if (!wallet) {
      ui.openModal();
      return;
    }
    setBusy(true);
    setErr("");
    try {
      await finalizeVoting({ ui, voting: address });
      setInfo("Итог отправлен");
      await refresh();
      await reload();
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
        {st === "finished" ? tt("votingDone") : st === "pending" ? tt("votingPending") : tt("votingOpen")}
      </span>
      {desc ? (
        <div className="card">
          <p>{desc}</p>
        </div>
      ) : null}

      {st === "pending" || pending ? (
        <div className="card">
          <h3>Запуск</h3>
          <p className="muted">Добавить опции и отправить «start» на контракт опроса.</p>
          <button className="btn btn-primary" disabled={busy} data-testid="voting-launch" onClick={() => void doLaunch()}>
            Запустить референдум
          </button>
        </div>
      ) : null}

      {/* Always show tallies when we have a snapshot or placeholders */}
      {st !== "pending" || options.length > 0 ? <ResultsBars /> : null}

      {done ? (
        <div className="card" style={{ textAlign: "center" }}>
          <p style={{ color: "var(--ok)", fontWeight: 700 }}>{tt("voted")}</p>
        </div>
      ) : canVote ? (
        <div className="card">
          <h3>{tt("vote")}</h3>
          <p className="muted">{tt("voteSilentHint")}</p>
          {options.length >= 2 && options.some((o) => o.address) ? (
            <div className="row" style={{ flexWrap: "wrap" }}>
              {options.map((o) => (
                <button
                  key={o.address || o.title}
                  className="btn btn-primary"
                  data-testid="vote-option"
                  disabled={busy}
                  onClick={() => void vote(o.address, o.title || o.text)}
                >
                  {o.title || o.text || "…"}
                </button>
              ))}
            </div>
          ) : (
            <div className="row">
              <button className="btn btn-primary" data-testid="vote-option" disabled={busy} onClick={() => void vote(undefined, "yes")}>
                {tt("yes")}
              </button>
              <button className="btn btn-ghost" disabled={busy} onClick={() => void vote(undefined, "no")}>
                {tt("no")}
              </button>
            </div>
          )}
          <button className="btn btn-ghost" disabled={busy} data-testid="voting-finalize" onClick={() => void doFinalize()} style={{ marginTop: 12 }}>
            Подвести итог
          </button>
        </div>
      ) : null}

      {info ? <p style={{ color: "var(--ok)" }}>{info}</p> : null}
      {err ? <p style={{ color: "var(--maroon)" }}>{err}</p> : null}
    </div>
  );
}
