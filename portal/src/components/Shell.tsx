import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTonConnectUI } from "@tonconnect/ui-react";
import { useApp } from "../state/AppState";
import { Icon } from "./Icons";
import { openBulCoinDeposit } from "../lib/telegram";
import { DAO_ADDRESS, TG_BOT_URL } from "../lib/config";
import { shortAddr } from "../lib/civic";

const items = [
  { to: "/citizenship", key: "citizenship", icon: "home" as const },
  { to: "/passport", key: "passport", icon: "id" as const },
  { to: "/referendums", key: "referendums", icon: "vote" as const },
  { to: "/council", key: "council", icon: "people" as const },
  { to: "/treasury", key: "treasury", icon: "chest" as const },
];

export function Shell() {
  const { tt, name, logo, shortUrl, wallet, lang, setLang } = useApp();
  const [ui] = useTonConnectUI();
  const nav = useNavigate();

  return (
    <div className="shell">
      <aside className="sidebar">
        <NavLink to="/citizenship" className="brand">
          {logo ? <img src={logo} alt="" /> : <span className="brand-mark">{shortUrl.slice(0, 2)}</span>}
          <span>
            <strong>{name}</strong>
            <span>{shortUrl} · {shortAddr(DAO_ADDRESS)}</span>
          </span>
        </NavLink>
        <nav className="nav">
          {items.map((it) => (
            <NavLink key={it.to} to={it.to} className={({ isActive }) => (isActive ? "active" : "")}>
              <Icon name={it.icon} /> {tt(it.key)}
            </NavLink>
          ))}
          <button type="button" onClick={openBulCoinDeposit}>
            <Icon name="coin" /> {tt("buyBlc")}
          </button>
          <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "")}>
            <Icon name="gear" /> {tt("settings")}
          </NavLink>
          <button
            type="button"
            onClick={async () => {
              await ui.disconnect();
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
          <a href="https://dao.won.onl" target="_blank" rel="noreferrer">
            dao.won.onl
          </a>
          <span>{tt("terms")}</span>
          <span>{tt("privacy")}</span>
        </div>
      </aside>
      <div className="main">
        <header className="topbar">
          <div className="lang">
            {(["ru", "cv", "en"] as const).map((l) => (
              <button key={l} className={lang === l ? "on" : ""} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="muted">{wallet ? shortAddr(wallet, 4, 4) : "—"}</span>
        </header>
        <div className="content">
          <Outlet />
        </div>
      </div>
      <nav className="bottom-nav">
        <NavLink to="/citizenship">{tt("citizenship")}</NavLink>
        <NavLink to="/referendums">{tt("referendums")}</NavLink>
        <NavLink to="/council">{tt("council")}</NavLink>
        <NavLink to="/treasury">{tt("treasury")}</NavLink>
        <NavLink to="/settings">{tt("more")}</NavLink>
      </nav>
    </div>
  );
}
