import { useEffect, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useApp } from "../state/AppState";
import { votingStatus, type VotingState } from "../lib/civic";
import { castCivicVote } from "../lib/civicActions";
import { finalizeVoting, launchVoting, readPendingLaunch } from "../lib/createVotingFlow";
import { isE2eTestnet, resolveWallet } from "../lib/e2eHooks";
import { hasLocalVault } from "../lib/passport";

export function ReferendumDetail() {
  const { address = "" } = useParams();
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

  useEffect(() => {
    void loadVoting(address).then(setState);
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
        const st = await loadVoting(address);
        setState(st);
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
      setState(await loadVoting(address));
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
      setState(await loadVoting(address));
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
      ) : st === "active" || st === "unknown" ? (
        <div className="card">
          <h3>{tt("vote")}</h3>
          <p className="muted">{tt("voteSilentHint")}</p>
          {options.length >= 2 ? (
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
              <button className="btn btn-primary" disabled={busy} onClick={() => void vote(undefined, "yes")}>
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
