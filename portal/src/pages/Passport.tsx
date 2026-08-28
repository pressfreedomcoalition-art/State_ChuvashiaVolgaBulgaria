import { useEffect, useState } from "react";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useApp } from "../state/AppState";
import { fetchGasStatus } from "../lib/civicActions";
import {
  clearPassport,
  createPresentation,
  ensurePresentation,
  hasLocalVault,
  getSession,
  issuePassport,
  loadPassportVault,
  unlockPassport,
} from "../lib/passport";
import { biometricAvailable } from "../lib/passportVault";
import {
  bindWalletBackup,
  fetchPassportBackupStatus,
  unbindWalletBackup,
} from "../lib/passportWalletBackup";

const NUDGE_KEY = "chv_wallet_bind_nudge_v1";

export function Passport() {
  const { tt, health, wallet } = useApp();
  const [ui] = useTonConnectUI();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [gas, setGas] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [bound, setBound] = useState<string | null>(null);
  const [showNudge, setShowNudge] = useState(false);
  const unlocked = !!getSession();

  async function refreshBindStatus() {
    try {
      if (!hasLocalVault()) return;
      const presentation = await ensurePresentation({ reason: "Статус привязки кошелька" });
      const st = await fetchPassportBackupStatus(presentation);
      setBound(st.walletBound);
      if (!st.hasWalletBackup && !localStorage.getItem(NUDGE_KEY)) setShowNudge(true);
    } catch {
      /* status optional until API deployed */
    }
  }

  useEffect(() => {
    if (hasLocalVault()) void refreshBindStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function unlock() {
    setErr("");
    try {
      await unlockPassport("Разблокировать паспорт");
      setMsg("Паспорт разблокирован");
      await refreshBindStatus();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  async function gasBal() {
    setErr("");
    try {
      const r = await fetchGasStatus();
      setGas(String(r.balanceTon ?? r.nano ?? "0"));
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  async function doBind() {
    setBusy(true);
    setErr("");
    try {
      if (!wallet) {
        ui.openModal();
        throw new Error("Подключите кошелёк");
      }
      const rec = getSession() || loadPassportVault();
      if (!rec) throw new Error("no_passport");
      if (!getSession()) await unlockPassport("Привязать кошелёк");
      const presentation = await createPresentation(getSession() || rec);
      const out = await bindWalletBackup(presentation, getSession() || rec, ui);
      localStorage.setItem(NUDGE_KEY, "1");
      setShowNudge(false);
      setBound(out.wallet);
      setMsg("Кошелёк привязан — им можно восстановить паспорт на другом устройстве");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function doUnbind() {
    if (!bound) return;
    setBusy(true);
    setErr("");
    try {
      const presentation = await ensurePresentation({ reason: "Отвязать кошелёк" });
      await unbindWalletBackup(presentation, bound);
      setBound(null);
      setMsg("Кошелёк отвязан");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <h1 className="page-title">{tt("passport")}</h1>
      <div className="card">
        <p>
          Civic-паспорт хранится в этом приложении (Face ID Telegram
          {biometricAvailable() ? " доступен" : " недоступен на этом клиенте"}).
        </p>
        <p className="muted">
          Локальный vault: {hasLocalVault() ? "есть" : "нет"} · сессия:{" "}
          {unlocked ? "разблокирована" : "заблокирована"}
        </p>
        {health?.gas ? (
          <p className="muted">
            Тарифы: grant {health.gas.grantDebitTon} · cast {health.gas.castDebitTon} · finalize{" "}
            {health.gas.finalizeDebitTon} TON
          </p>
        ) : null}
        <div className="row">
          {hasLocalVault() ? (
            <button className="btn btn-primary" onClick={() => void unlock()}>
              Face ID / разблокировать
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() =>
                void issuePassport()
                  .then((r) => setMsg(r.restorePhrase ? `Фраза: ${r.restorePhrase}` : "Паспорт выдан"))
                  .catch((e) => setErr(String(e)))
              }
            >
              Выдать паспорт
            </button>
          )}
          <button className="btn btn-ghost" disabled={!hasLocalVault()} onClick={() => void gasBal()}>
            Баланс газа
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              clearPassport();
              setMsg("Паспорт очищен с этого устройства");
            }}
          >
            Сбросить локально
          </button>
        </div>
        {gas ? <p>Prepaid газ: {gas} TON</p> : null}
        {msg ? <p style={{ color: "var(--ok)" }}>{msg}</p> : null}
        {err ? <p style={{ color: "var(--maroon)" }}>{err}</p> : null}
      </div>

      {hasLocalVault() ? (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Восстановление через кошелёк</h3>
          {showNudge ? (
            <p className="muted">
              Один раз: привяжите кошелёк к паспорту (как seed). Лучше отдельный «гражданский»
              кошелёк — привязка снижает анонимность. Потеря кошелька = риск паспорта.
            </p>
          ) : (
            <p className="muted">
              Статус: {bound ? `привязан ${bound.slice(0, 8)}…` : "не привязан"}
            </p>
          )}
          <div className="row">
            {!bound ? (
              <button className="btn btn-primary" disabled={busy} onClick={() => void doBind()}>
                Привязать кошелёк
              </button>
            ) : (
              <button className="btn btn-ghost" disabled={busy} onClick={() => void doUnbind()}>
                Отвязать
              </button>
            )}
            {showNudge ? (
              <button
                className="btn btn-ghost"
                onClick={() => {
                  localStorage.setItem(NUDGE_KEY, "1");
                  setShowNudge(false);
                }}
              >
                Позже
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
