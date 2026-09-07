/**
 * Minimal Telegram bot for @bulgaria_state_bot:
 * /start → Web App button that opens the CHV cabinet miniapp.
 */
const TOKEN = String(process.env.TELEGRAM_BOT_TOKEN || "").trim();
const WEBAPP_URL = String(process.env.WEBAPP_URL || "https://chv.blc.cab/").trim();
const BUTTON_TEXT = String(process.env.BUTTON_TEXT || "Открыть гражданство").trim();
const MENU_BUTTON_TEXT = String(process.env.MENU_BUTTON_TEXT || "Кабинет").trim();
const START_TEXT = String(
  process.env.START_TEXT ||
    "Кабинет гражданина Чувашии / Волжской Булгарии.\nНажмите кнопку, чтобы открыть миниапп.",
).replace(/\\n/g, "\n");

if (!TOKEN) {
  console.error("TELEGRAM_BOT_TOKEN is required");
  process.exit(1);
}

const API = `https://api.telegram.org/bot${TOKEN}`;

async function tg(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) {
    const desc = data?.description || res.statusText || "telegram error";
    throw new Error(`${method}: ${desc}`);
  }
  return data.result;
}

function webAppKeyboard() {
  return {
    inline_keyboard: [[{ text: BUTTON_TEXT, web_app: { url: WEBAPP_URL } }]],
  };
}

async function handleStart(chatId) {
  await tg("sendMessage", {
    chat_id: chatId,
    text: START_TEXT,
    reply_markup: webAppKeyboard(),
  });
}

async function setupMenu() {
  await tg("setChatMenuButton", {
    menu_button: {
      type: "web_app",
      text: MENU_BUTTON_TEXT,
      web_app: { url: WEBAPP_URL },
    },
  });
  await tg("setMyCommands", {
    commands: [{ command: "start", description: "Открыть кабинет / гражданство" }],
  });
}

async function processUpdate(u) {
  const msg = u.message || u.edited_message;
  if (!msg?.chat?.id) return;
  const text = String(msg.text || "").trim();
  if (!text) return;
  if (text === "/start" || text.startsWith("/start@") || text.startsWith("/start ")) {
    await handleStart(msg.chat.id);
  }
}

let offset = 0;
let stopping = false;

async function poll() {
  while (!stopping) {
    try {
      const updates = await tg("getUpdates", {
        offset,
        timeout: 50,
        allowed_updates: ["message"],
      });
      for (const u of updates) {
        offset = u.update_id + 1;
        try {
          await processUpdate(u);
        } catch (e) {
          console.error("handle update", u.update_id, e instanceof Error ? e.message : e);
        }
      }
    } catch (e) {
      console.error("poll", e instanceof Error ? e.message : e);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

process.on("SIGINT", () => {
  stopping = true;
});
process.on("SIGTERM", () => {
  stopping = true;
});

console.log(`chv-bot → ${WEBAPP_URL} (${BUTTON_TEXT})`);
await tg("deleteWebhook", { drop_pending_updates: false });
await setupMenu();
await poll();
