import { useTonConnectUI } from "@tonconnect/ui-react";
import { useApp } from "../state/AppState";
import { DAO_ADDRESS, TG_BOT_URL } from "../lib/config";
import { officialDaoUrl, shortAddr } from "../lib/civic";
import { openBulCoinDeposit, openOfficial } from "../lib/telegram";

export function Settings() {
  const { tt, wallet, lang, setLang } = useApp();
  const [ui] = useTonConnectUI();
  return (
    <div className="stack">
      <h1 className="page-title">{tt("settings")}</h1>
      <div className="card">
        <h3>{tt("settingsWallet")}</h3>
        <p>{wallet ? shortAddr(wallet, 8, 6) : "—"}</p>
        <div className="row">
          {!wallet ? (
            <button className="btn btn-primary" onClick={() => ui.openModal()}>
              {tt("connectWallet")}
            </button>
          ) : (
            <button className="btn btn-ghost" onClick={() => ui.disconnect()}>
              {tt("logout")}
            </button>
          )}
        </div>
      </div>
      <div className="card">
        <h3>{tt("settingsLang")}</h3>
        <div className="lang">
          {(["ru", "cv", "en"] as const).map((l) => (
            <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)}>
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <div className="card">
        <h3>{tt("settingsGas")}</h3>
        <button className="btn btn-primary" onClick={() => openOfficial(officialDaoUrl())}>
          {tt("goOfficial")}
        </button>
      </div>
      <div className="card">
        <h3>{tt("buyBlc")}</h3>
        <button className="btn btn-primary" onClick={openBulCoinDeposit}>
          {tt("buyBlc")}
        </button>
        <p className="muted">
          DAO {shortAddr(DAO_ADDRESS)} ·{" "}
          <a href={TG_BOT_URL} target="_blank" rel="noreferrer">
            @bulgaria_state_bot
          </a>
        </p>
      </div>
    </div>
  );
}
