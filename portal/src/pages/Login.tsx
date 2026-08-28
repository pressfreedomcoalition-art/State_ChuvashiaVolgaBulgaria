import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { Ornament } from "../components/Icons";
import { useApp } from "../state/AppState";
import {
  biometricAvailable,
  hasLocalVault,
  issuePassport,
  restoreFromPhrase,
  unlockPassport,
} from "../lib/passport";

export function Login() {
  const wallet = useTonAddress();
  const [ui] = useTonConnectUI();
  const nav = useNavigate();
  const { tt, name } = useApp();
  const [phrase, setPhrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [shownPhrase, setShownPhrase] = useState<string | null>(null);
  const [hasVault, setHasVault] = useState(() => hasLocalVault());

  useEffect(() => {
    if (wallet && hasLocalVault() && sessionStorage.getItem("chv_passport_session_v1")) {
      nav("/citizenship", { replace: true });
    }
  }, [wallet, nav]);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setErr("");
    try {
      await fn();
      setHasVault(hasLocalVault());
      if (wallet) nav("/citizenship", { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-brand">
          <Ornament className="ornament" />
          <h1>{tt("loginTitle")}</h1>
          <p className="muted">{name}</p>
        </div>
        <div className="auth-form">
          <h2>1. {tt("connectWallet")}</h2>
          <p className="muted">{tt("loginLead")}</p>
          <button className="btn btn-primary btn-wide" disabled={busy} onClick={() => ui.openModal()}>
            {wallet ? `✓ ${wallet.slice(0, 6)}…` : tt("connectWallet")}
          </button>

          <h2 style={{ marginTop: 12 }}>2. Паспорт (Face ID)</h2>
          <p className="muted">
            Паспорт из бота DAO сюда не переносится сам. Восстановите его seed-фразой, затем Face ID
            разблокирует его в этом кабинете
            {biometricAvailable() ? " (биометрия Telegram доступна)" : ""}.
          </p>

          {hasVault ? (
            <button
              className="btn btn-primary btn-wide"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  await unlockPassport("Разблокировать паспорт");
                })
              }
            >
              Разблокировать Face ID
            </button>
          ) : null}

          <label className="muted" style={{ display: "block", marginTop: 8 }}>
            Seed-фраза паспорта (из DAO при выдаче)
          </label>
          <textarea
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            rows={3}
            placeholder="word1 word2 …"
            style={{
              width: "100%",
              borderRadius: 10,
              border: "1px solid var(--line)",
              padding: 10,
              resize: "vertical",
            }}
          />
          <button
            className="btn btn-ghost btn-wide"
            disabled={busy || !phrase.trim()}
            onClick={() =>
              run(async () => {
                await restoreFromPhrase(phrase);
              })
            }
          >
            Восстановить паспорт
          </button>
          <button
            className="btn btn-ghost btn-wide"
            disabled={busy}
            onClick={() =>
              run(async () => {
                const minted = await issuePassport();
                if (minted.restorePhrase) setShownPhrase(minted.restorePhrase);
              })
            }
          >
            Выдать новый паспорт
          </button>

          {shownPhrase ? (
            <div className="card" style={{ background: "#fff8e8" }}>
              <strong>Сохраните фразу!</strong>
              <p style={{ wordBreak: "break-word" }}>{shownPhrase}</p>
            </div>
          ) : null}
          {err ? <p style={{ color: "var(--maroon)" }}>{err}</p> : null}
          {wallet && hasVault ? (
            <button className="btn btn-primary btn-wide" onClick={() => nav("/citizenship")}>
              Войти в кабинет
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
