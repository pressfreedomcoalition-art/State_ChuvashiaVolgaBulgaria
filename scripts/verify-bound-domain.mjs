#!/usr/bin/env node
/**
 * Verify CHV bound-domain cutover (ui.css + miniapp.domain + miniapp.bot).
 * Usage: node scripts/verify-bound-domain.mjs
 */
const DAO = "EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx";
const HOST = "chv.blc.cab";
const BOT = "bulgaria_state_bot";
const CIVIC = "https://dao.blc.cab/civic";
const UI_CSS = {
  v: 1,
  bg: "#f7f4ee",
  card: "#ffffff",
  text: "#1b1b1b",
  hint: "#6b7280",
  accent: "#8b1d1d",
  accentText: "#ffffff",
  secondaryBg: "#efe9df",
};

async function getJson(url) {
  const r = await fetch(url);
  const text = await r.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { ok: r.ok, status: r.status, body };
}

function findParam(params, key) {
  if (!Array.isArray(params)) return null;
  return params.find((p) => p && p.key === key) || null;
}

function normBot(s) {
  return String(s || "")
    .trim()
    .replace(/^@/, "")
    .toLowerCase();
}

const checks = [];
function check(name, pass, detail) {
  checks.push({ name, pass: !!pass, detail: detail || "" });
  console.log(`${pass ? "OK  " : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}

const paramsRes = await getJson(`${CIVIC}/v1/cache/list?key=params:${DAO}`);
const params = paramsRes.ok && paramsRes.body?.value ? paramsRes.body.value : [];
check("params cache", paramsRes.ok, `HTTP ${paramsRes.status}`);

const ui = findParam(params, "ui.css");
let uiOk = false;
if (ui?.str) {
  try {
    const parsed = JSON.parse(ui.str);
    uiOk =
      parsed.accent?.toLowerCase() === UI_CSS.accent.toLowerCase() &&
      parsed.bg?.toLowerCase() === UI_CSS.bg.toLowerCase();
    check("ui.css param", uiOk, ui.str.slice(0, 120));
  } catch (e) {
    check("ui.css param", false, String(e.message || e));
  }
} else {
  check("ui.css param", false, "missing — vote vtype 33");
}

const domainKey = `miniapp.domain.${HOST}`;
const domainParam =
  findParam(params, domainKey) ||
  params.find((p) => String(p.key || "").startsWith("miniapp.domain.") && String(p.key).includes(HOST));
check(
  "miniapp.domain param",
  !!(domainParam && domainParam.str !== "-"),
  domainParam ? `${domainParam.key}=${domainParam.str}` : `missing ${domainKey} — vote vtype 29`,
);

const boundDom = await getJson(`${CIVIC}/v1/cache/list?key=boundDomain:${HOST}`);
check(
  "boundDomain index",
  boundDom.ok,
  boundDom.ok ? JSON.stringify(boundDom.body?.value).slice(0, 160) : `HTTP ${boundDom.status} (may lag after vote)`,
);

const botParam = findParam(params, "miniapp.bot");
const botOk = botParam && normBot(botParam.str) === BOT;
check(
  "miniapp.bot param",
  botOk,
  botParam ? String(botParam.str) : "missing — vote vtype 28 @bulgaria_state_bot",
);

const site = await getJson(`https://${HOST}/`);
const looksLikeCabinet =
  typeof site.body === "string" &&
  (site.body.includes("CHV · Личный кабинет") || site.body.includes('id="root"'));
const looksLikeDao =
  typeof site.body === "string" &&
  (site.body.includes("telegram-web-app") || site.body.includes("/assets/index-"));
check(
  "https://chv.blc.cab serves miniapp",
  site.ok && looksLikeDao && !looksLikeCabinet,
  `HTTP ${site.status}; cabinet=${looksLikeCabinet}; daoAssets=${looksLikeDao}`,
);

const failed = checks.filter((c) => !c.pass);
console.log("");
console.log(failed.length ? `FAILED ${failed.length}/${checks.length}` : `ALL ${checks.length} checks passed`);
process.exit(failed.length ? 1 : 0);
