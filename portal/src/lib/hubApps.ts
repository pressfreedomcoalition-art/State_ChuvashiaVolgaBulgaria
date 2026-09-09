import type { DaoParam } from "./civic";
import { BULCOIN_DEPOSIT_URL, OFFICIAL_UI, TG_BOT_URL, DAO_ADDRESS } from "./config";

export type HubApp = {
  id: string;
  type: string;
  url: string;
  name: string;
  description?: string;
  icon?: string;
};

/** Built-in companion apps always listed in cabinet. */
export function builtinApps(): HubApp[] {
  return [
    {
      id: "official-dao",
      type: "miniapp",
      url: `${OFFICIAL_UI}/#dao=${DAO_ADDRESS}`,
      name: "Официальный DAO",
      description: "dao.blc.cab / dao.won.onl — полный миниапп платформы",
    },
    {
      id: "bulcoin",
      type: "miniapp",
      url: BULCOIN_DEPOSIT_URL,
      name: "BulCoin",
      description: "Покупка / депозит BLC",
    },
    {
      id: "cabinet-bot",
      type: "miniapp",
      url: TG_BOT_URL,
      name: "Кабинет в Telegram",
      description: "@bulgaria_state_bot",
    },
  ];
}

/** DaoParam keys `app.<id>` → JSON `{ t, r, n, d, i }` (CUSTOM_UI_API §3). */
export function parseHubApps(params: DaoParam[] | null | undefined): HubApp[] {
  const out: HubApp[] = [];
  for (const p of params || []) {
    if (!p.key.startsWith("app.") || !p.str) continue;
    try {
      const j = JSON.parse(p.str) as {
        t?: string;
        r?: string;
        url?: string;
        n?: string;
        d?: string;
        i?: string;
      };
      const url = String(j.r || j.url || "").trim();
      if (!/^https?:\/\//i.test(url) && !url.startsWith("tg:") && !url.startsWith("https://t.me/")) {
        continue;
      }
      out.push({
        id: p.key.slice(4),
        type: String(j.t || "site"),
        url,
        name: String(j.n || p.key.slice(4)),
        description: j.d ? String(j.d) : undefined,
        icon: j.i ? String(j.i) : undefined,
      });
    } catch {
      /* skip bad JSON */
    }
  }
  return out;
}

export function allCabinetApps(params: DaoParam[] | null | undefined): HubApp[] {
  const fromDao = parseHubApps(params);
  const seen = new Set(fromDao.map((a) => a.url));
  const extras = builtinApps().filter((a) => !seen.has(a.url));
  return [...fromDao, ...extras];
}
