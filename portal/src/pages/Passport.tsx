import { useState } from "react";
import { useApp } from "../state/AppState";
import { fetchGasStatus } from "../lib/civicActions";
import {
  clearPassport,
  hasLocalVault,
  getSession,
  issuePassport,
  unlockPassport,
} from "../lib/passport";
import { biometricAvailable } from "../lib/passportVault";

export function Passport() {
  const { tt, health } = useApp();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [gas, setGas] = useState<string>("");
  const unlocked = !!getSession();

  async function unlock() {
    setErr("");
    try {
      await unlockPassport("Разблокировать паспорт");
      setMsg("Паспорт разблокирован");
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
    </div>
  );
}
