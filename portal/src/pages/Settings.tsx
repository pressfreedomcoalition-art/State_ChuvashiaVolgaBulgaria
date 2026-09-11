import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useApp } from "../state/AppState";
import { DAO_ADDRESS, TG_BOT_URL } from "../lib/config";
import { shortAddr } from "../lib/civic";
import { openBulCoinDeposit } from "../lib/telegram";
import { pathAfterGate, resolveCitizenshipGate, writeCitizenFlag } from "../lib/authGate";
import { restoreFromWallet } from "../lib/passportWalletBackup";
import { loadCabinetCatalog, type CabinetSection } from "../lib/cabinetCatalog";

export function Settings() {
  const { tt, wallet, lang, setLang, isCitizen, setIsCitizen } = useApp();
  const connected = useTonAddress();
  const [ui] = useTonConnectUI();
  const nav = useNavigate();
  const pendingRestore = useRef(false);
  const tried = useRef<string | null>(null);
  const [sections, setSections] = useState<CabinetSection[]>([]);
  const [catalogErr, setCatalogErr] = useState("");

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const { catalog } = await loadCabinetCatalog();
        if (alive) {
          setSections(catalog.settingsSections);
          setCatalogErr("");
        }
      } catch (e) {
        if (alive) setCatalogErr(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  async function tryRestoreAfterConnect(addr: string) {
    if (isCitizen === true) return;
    if (tried.current === addr) return;
    tried.current = addr;
    try {
      await restoreFromWallet(ui);
      const gate = await resolveCitizenshipGate();
      const citizen = gate === "citizen";
      writeCitizenFlag(citizen ? true : gate === "not_citizen" ? false : null);
      setIsCitizen(citizen ? true : gate === "not_citizen" ? false : null);
      if (citizen) nav(pathAfterGate(gate), { replace: true });
    } catch {
      /* no backup on this wallet — stay in settings */
    }
  }

  useEffect(() => {
    if (!connected || isCitizen === true) return;
    if (!pendingRestore.current) return;
    pendingRestore.current = false;
    void tryRestoreAfterConnect(connected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  const show = (id: string) => sections.some((s) => s.id === id);
  const label = (id: string, fallback: string) =>
    sections.find((s) => s.id === id)?.label || fallback;

  return (
    <div className="stack">
      <h1 className="page-title">{tt("settings")}</h1>
      {catalogErr ? <p style={{ color: "var(--maroon)" }}>{catalogErr}</p> : null}
      {show("wallet") ? (
        <div className="card">
          <h3>{label("wallet", tt("settingsWallet"))}</h3>
          <p>{wallet ? shortAddr(wallet, 8, 6) : "—"}</p>
          <div className="row">
            {!wallet ? (
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (isCitizen !== true) pendingRestore.current = true;
                  ui.openModal();
                }}
              >
                {tt("connectWallet")}
              </button>
            ) : (
              <button className="btn btn-ghost" onClick={() => ui.disconnect()}>
                {tt("logout")}
              </button>
            )}
          </div>
        </div>
      ) : null}
      {show("lang") ? (
        <div className="card">
          <h3>{label("lang", tt("settingsLang"))}</h3>
          <div className="lang">
            {(["ru", "cv", "en"] as const).map((l) => (
              <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {show("gas") ? (
        <div className="card">
          <h3>{label("gas", tt("settingsGas"))}</h3>
          <p className="muted">{tt("settingsGasHint")}</p>
          <Link className="btn btn-ghost" to="/passport">
            {tt("openPassport")}
          </Link>
        </div>
      ) : null}
      <div className="card">
        <h3>{tt("apps")}</h3>
        <p className="muted">{tt("appsHint")}</p>
        <Link className="btn btn-primary" to="/apps">
          {tt("apps")}
        </Link>
      </div>
      <div className="card">
        <h3>{tt("buyBlc")}</h3>
        <button className="btn btn-primary" onClick={openBulCoinDeposit}>
          {tt("buyBlc")}
        </button>
        <p className="muted">
          {shortAddr(DAO_ADDRESS)} ·{" "}
          <a href={TG_BOT_URL} target="_blank" rel="noreferrer">
            @bulgaria_state_bot
          </a>
        </p>
      </div>
    </div>
  );
}
