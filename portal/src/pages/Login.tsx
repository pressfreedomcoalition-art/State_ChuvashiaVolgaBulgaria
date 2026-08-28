import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { DAO_ADDRESS, OFFICIAL_UI, PORTAL_ORIGIN } from "../lib/config";
import { openExternal, isTelegram } from "../lib/telegram";
import {
  parsePresentReturn,
  saveIncomingPresentation,
  stripPresentFromUrl,
} from "../lib/presentReturn";
import { hasLocalVault, restoreFromPhrase, unlockPassport } from "../lib/passport";
import { restoreFromWallet } from "../lib/passportWalletBackup";

const SESSION_PRESENT = "chv_session_presentation";

export function saveSessionPresentation(presentation: string) {
  sessionStorage.setItem(SESSION_PRESENT, presentation);
  saveIncomingPresentation(presentation);
}

export function getSessionPresentation(): string | null {
  try {
    return sessionStorage.getItem(SESSION_PRESENT);
  } catch {
    return null;
  }
}

function daoFaceIdExportUrl() {
  const ret = encodeURIComponent(`${PORTAL_ORIGIN}/auth/return`);
  return `${OFFICIAL_UI}/#exportPresent=1&dao=${DAO_ADDRESS}&return=${ret}&app=${encodeURIComponent("CHV Cabinet")}`;
}

type Step = "choose" | "have" | "phrase" | "none";

export function Login() {
  const wallet = useTonAddress();
  const [ui] = useTonConnectUI();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [step, setStep] = useState<Step>("choose");
  const [phrase, setPhrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (params.get("from") === "dao" || parsePresentReturn() || params.get("presentation")) {
      const fromUrl = parsePresentReturn() || params.get("presentation");
      if (fromUrl) {
        saveSessionPresentation(fromUrl);
        stripPresentFromUrl();
      }
      if (getSessionPresentation()) {
        setInfo("Паспорт подтверждён через DAO Face ID. Подключите кошелёк и нажмите «Продолжить вход».");
        setStep("have");
      }
    }
  }, [params]);

  async function enterWithVault() {
    setBusy(true);
    setErr("");
    try {
      if (hasLocalVault()) {
        await unlockPassport("Вход в кабинет");
      } else if (getSessionPresentation()) {
        sessionStorage.setItem(
          "chv_passport_session_v1",
          JSON.stringify({ presentationOnly: true, unlockedAt: Date.now() }),
        );
      } else {
        throw new Error("Сначала Face ID через DAO или seed-фраза");
      }
      if (!wallet) {
        setInfo("Паспорт готов — подключите кошелёк");
        return;
      }
      nav("/citizenship", { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function doPhrase() {
    setBusy(true);
    setErr("");
    try {
      await restoreFromPhrase(phrase);
      setInfo("Паспорт восстановлен на этом устройстве");
      if (wallet) nav("/citizenship", { replace: true });
      else setStep("have");
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function doWalletRestore() {
    setBusy(true);
    setErr("");
    try {
      if (!wallet) {
        ui.openModal();
        setInfo("Подключите тот же кошелёк, что привязан к паспорту");
        return;
      }
      await restoreFromWallet(ui);
      setInfo("Паспорт восстановлен по кошельку");
      nav("/citizenship", { replace: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "not_found" || msg.includes("no wallet backup")) {
        setErr("К этому кошельку паспорт ещё не привязан. Сначала Face ID / фраза, затем привязка в «Паспорт».");
      } else if (msg === "connect_wallet") {
        setErr("Подключите кошелёк");
      } else {
        setErr(msg);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-brand" style={{ padding: 36 }}>
          <h1 style={{ fontFamily: "var(--serif)", fontSize: 28, margin: 0 }}>Хар пÿрт</h1>
          <p className="muted">Личный кабинет</p>
        </div>
        <div className="auth-form">
          <h2>Кошелёк</h2>
          <button className="btn btn-primary btn-wide" disabled={busy} onClick={() => ui.openModal()}>
            {wallet ? `✓ ${wallet.slice(0, 8)}…` : "Подключить TON-кошелёк"}
          </button>

          {step === "choose" ? (
            <>
              <h2 style={{ marginTop: 16 }}>Гражданство</h2>
              <button className="btn btn-primary btn-wide" onClick={() => setStep("have")}>
                Уже есть гражданство
              </button>
              <button
                className="btn btn-ghost btn-wide"
                onClick={() => {
                  setStep("none");
                  if (!wallet) setInfo("Сначала подключите кошелёк");
                }}
              >
                Нет гражданства — получить
              </button>
            </>
          ) : null}

          {step === "have" ? (
            <>
              <h2 style={{ marginTop: 16 }}>Восстановить доступ</h2>
              <p className="muted">
                Face ID в основном DAO — нормально: разблокируете там и вернётесь сюда, вход продолжится.
              </p>
              <button
                className="btn btn-primary btn-wide"
                disabled={busy}
                onClick={() => {
                  sessionStorage.setItem("chv_auth_pending", "1");
                  openExternal(daoFaceIdExportUrl());
                }}
              >
                Face ID через DAO (кошелёк + биометрия)
              </button>
              <button
                className="btn btn-ghost btn-wide"
                disabled={busy}
                onClick={() => void doWalletRestore()}
              >
                Восстановить через кошелёк
              </button>
              <button className="btn btn-ghost btn-wide" onClick={() => setStep("phrase")}>
                Восстановить через seed-фразу
              </button>
              {hasLocalVault() || getSessionPresentation() ? (
                <button className="btn btn-primary btn-wide" disabled={busy} onClick={() => void enterWithVault()}>
                  Продолжить вход
                </button>
              ) : null}
              <button className="btn btn-ghost btn-wide" onClick={() => setStep("choose")}>
                ← Назад
              </button>
            </>
          ) : null}

          {step === "phrase" ? (
            <>
              <h2 style={{ marginTop: 16 }}>Seed-фраза</h2>
              <textarea
                value={phrase}
                onChange={(e) => setPhrase(e.target.value)}
                rows={3}
                placeholder="word1 word2 …"
                style={{ width: "100%", borderRadius: 10, border: "1px solid var(--line)", padding: 10 }}
              />
              <button
                className="btn btn-primary btn-wide"
                disabled={busy || !phrase.trim()}
                onClick={() => void doPhrase()}
              >
                Восстановить
              </button>
              <button className="btn btn-ghost btn-wide" onClick={() => setStep("have")}>
                ← Назад
              </button>
            </>
          ) : null}

          {step === "none" ? (
            <>
              <h2 style={{ marginTop: 16 }}>Получение гражданства</h2>
              <p className="muted">Пути гражданства откроются в этом кабинете.</p>
              <button className="btn btn-primary btn-wide" disabled={!wallet} onClick={() => nav("/citizenship")}>
                Перейти к получению
              </button>
              <button className="btn btn-ghost btn-wide" onClick={() => setStep("choose")}>
                ← Назад
              </button>
            </>
          ) : null}

          {info ? <p style={{ color: "var(--ok)" }}>{info}</p> : null}
          {err ? <p style={{ color: "var(--maroon)" }}>{err}</p> : null}
          {!isTelegram() ? (
            <p className="muted">Face ID удобнее внутри Telegram Mini App бота.</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
