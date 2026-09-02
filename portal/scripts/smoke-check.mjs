/**
 * Headless smoke: fail if #root stays empty or JS throws.
 * Usage: node scripts/smoke-check.mjs [url]
 */
import { spawn } from "node:child_process";
import { mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const url = process.argv[2] || process.env.SMOKE_URL || "http://127.0.0.1:4173/";
const chromePaths = [
  process.env.CHROME_PATH,
  process.platform === "win32"
    ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
    : "/usr/bin/google-chrome",
  "/usr/bin/chromium-browser",
  "/usr/bin/chromium",
].filter(Boolean);

async function pickChrome() {
  const { access } = await import("node:fs/promises");
  for (const p of chromePaths) {
    try {
      await access(p);
      return p;
    } catch {
      /* try next */
    }
  }
  throw new Error("Chrome/Chromium not found for smoke check");
}

const chrome = await pickChrome();
const dir = join(tmpdir(), `chv-smoke-${Date.now()}`);
mkdirSync(dir, { recursive: true });
const port = 9400 + Math.floor(Math.random() * 100);

const proc = spawn(
  chrome,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${dir}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

let exitCode = 1;
try {
  await sleep(1500);
  const list = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json());
  const page = list.find((t) => t.type === "page");
  if (!page?.webSocketDebuggerUrl) throw new Error("no CDP page target");

  const { default: WebSocket } = await import("ws");
  const errors = [];

  await new Promise((resolve, reject) => {
    const ws = new WebSocket(page.webSocketDebuggerUrl);
    let id = 1;
    const pending = new Map();
    const send = (method, params = {}) => {
      const i = id++;
      ws.send(JSON.stringify({ id: i, method, params }));
      return new Promise((res) => pending.set(i, res));
    };

    ws.on("error", reject);
    ws.on("message", (buf) => {
      const msg = JSON.parse(buf.toString());
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)(msg);
        pending.delete(msg.id);
      }
      if (msg.method === "Runtime.exceptionThrown") {
        const d = msg.params.exceptionDetails;
        errors.push(d?.exception?.description || d?.text || "runtime error");
      }
    });

    ws.on("open", async () => {
      try {
        await send("Runtime.enable");
        await send("Page.navigate", { url });
        await sleep(8000);
        const ev = await send("Runtime.evaluate", {
          expression: `({
            text: (document.getElementById('root') && document.getElementById('root').innerText) || '',
            htmlLen: (document.getElementById('root') && document.getElementById('root').innerHTML.length) || 0,
            title: document.title
          })`,
          returnByValue: true,
        });
        const val = ev.result?.result?.value || {};
        ws.close();

        if (errors.length) {
          console.error("JS_ERRORS");
          for (const e of errors) console.error(e);
          exitCode = 2;
        } else if (!val.text || val.text.length < 10) {
          console.error("WHITE_SCREEN", JSON.stringify(val));
          exitCode = 3;
        } else {
          console.log("SMOKE_OK", val.text.slice(0, 80).replace(/\s+/g, " "));
          exitCode = 0;
        }
        resolve();
      } catch (e) {
        reject(e);
      }
    });
  });
} finally {
  try {
    proc.kill();
  } catch {
    /* ignore */
  }
  try {
    rmSync(dir, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}

process.exit(exitCode);
