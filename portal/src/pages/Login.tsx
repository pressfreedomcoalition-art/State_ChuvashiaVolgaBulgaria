import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { Ornament } from "../components/Icons";
import { useApp } from "../state/AppState";
import { officialDaoUrl } from "../lib/civic";
import { openOfficial } from "../lib/telegram";

export function Login() {
  const wallet = useTonAddress();
  const [ui] = useTonConnectUI();
  const nav = useNavigate();
  const { tt, name } = useApp();

  useEffect(() => {
    if (wallet) nav("/citizenship", { replace: true });
  }, [wallet, nav]);

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="auth-brand">
          <Ornament className="ornament" />
          <h1>{tt("loginTitle")}</h1>
          <p className="muted">{name}</p>
        </div>
        <div className="auth-form">
          <h2>{tt("connectWallet")}</h2>
          <p className="muted">{tt("loginLead")}</p>
          <button className="btn btn-primary btn-wide" onClick={() => ui.openModal()}>
            {tt("connectWallet")}
          </button>
          <button
            className="btn btn-ghost btn-wide"
            onClick={() => openOfficial(officialDaoUrl())}
          >
            {tt("unlockPassport")}
          </button>
          <p className="muted">{tt("passportHint")}</p>
        </div>
      </div>
    </div>
  );
}
