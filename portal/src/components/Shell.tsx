import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useApp } from "../state/AppState";
import { Icon, type IconName } from "./Icons";
import { openBulCoinDeposit } from "../lib/telegram";
import { DAO_ADDRESS, TG_BOT_URL } from "../lib/config";
import { pathEnabled, shortAddr } from "../lib/civic";
import { writeCitizenFlag } from "../lib/authGate";

type NavItem = { to: string; key: string; icon: IconName };

export function Shell() {
  const { tt, name, logo, shortUrl, wallet, isCitizen, setIsCitizen, params } = useApp();
  const [ui] = useTonConnectUI();
  const nav = useNavigate();
  const needsVerify = pathEnabled(params, "docs");

  const citizenItems: NavItem[] = [
    { to: "/referendums", key: "referendums", icon: "vote" },
    { to: "/passport", key: "passport", icon: "id" },
    ...(needsVerify ? [{ to: "/citizenship?path=docs", key: "needVerify", icon: "shield" as const }] : []),
    { to: "/council", key: "council", icon: "people" },
    { to: "/treasury", key: "treasury", icon: "chest" },
  ];

  const obtainItems: NavItem[] = [
    { to: "/citizenship", key: "citizenship", icon: "home" },
    ...(needsVerify ? [{ to: "/citizenship?path=docs", key: "needVerify", icon: "shield" as const }] : []),
  ];

  const items = isCitizen === true ? citizenItems : obtainItems;
  const home = isCitizen === true ? "/referendums" : "/citizenship";

  const bottomCitizen: NavItem[] = [
    { to: "/referendums", key: "referendums", icon: "vote" },
    ...(needsVerify ? [{ to: "/citizenship?path=docs", key: "needVerify", icon: "shield" as const }] : []),
    { to: "/council", key: "council", icon: "people" },
    { to: "/treasury", key: "treasury", icon: "chest" },
    { to: "/passport", key: "passport", icon: "id" },
    { to: "/settings", key: "more", icon: "gear" },
  ];

  const bottomObtain: NavItem[] = [
    { to: "/citizenship", key: "citizenship", icon: "home" },
    ...(needsVerify ? [{ to: "/citizenship?path=docs", key: "needVerify", icon: "shield" as const }] : []),
    { to: "/settings", key: "more", icon: "gear" },
  ];

  const bottom = isCitizen === true ? bottomCitizen : bottomObtain;

  return (
    <div className="shell">
      <aside className="sidebar">
        <NavLink to={home} className="brand">
          <img className="brand-flag" src={logo} alt={tt("flagAlt")} />
          <span>
            <strong>{name}</strong>
            <span>
              {shortUrl} · {shortAddr(DAO_ADDRESS)}
            </span>
          </span>
        </NavLink>
        <nav className="nav">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} className={({ isActive }) => (isActive ? "active" : "")}>
              <Icon name={it.icon} /> {tt(it.key)}
            </NavLink>
          ))}
          {isCitizen === true ? (
            <button type="button" onClick={openBulCoinDeposit}>
              <Icon name="coin" /> {tt("buyBlc")}
            </button>
          ) : null}
          <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "")}>
            <Icon name="gear" /> {tt("settings")}
          </NavLink>
          <button
            type="button"
            onClick={async () => {
              await ui.disconnect();
              writeCitizenFlag(null);
              setIsCitizen(null);
              nav("/");
            }}
          >
            <Icon name="out" /> {tt("logout")}
          </button>
        </nav>
        <div className="side-foot">
          <a href={TG_BOT_URL} target="_blank" rel="noreferrer">
            t.me/bulgaria_state_bot
          </a>
          <span>{tt("terms")}</span>
          <span>{tt("privacy")}</span>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <span className="muted">{wallet ? shortAddr(wallet, 4, 4) : "—"}</span>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </div>
      <nav
        className="bottom-nav"
        style={{ gridTemplateColumns: `repeat(${bottom.length}, 1fr)` }}
        aria-label="bottom"
      >
        {bottom.map((it) => (
          <NavLink key={it.to} to={it.to} className={({ isActive }) => (isActive ? "active" : "")}>
            <span className="bottom-nav-icon" aria-hidden>
              <Icon name={it.icon} size={22} />
            </span>
            <span className="bottom-nav-label">{tt(it.key)}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
