#!/usr/bin/env bash
# Install / update chv Telegram bot on a Linux VPS (run as root or with sudo).
# Usage: sudo TELEGRAM_BOT_TOKEN=... ./deploy/install-chv-bot.sh [/opt/chv-bot]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-/opt/chv-bot}"
WEBAPP_URL="${WEBAPP_URL:-https://chv.blc.cab/}"
BUTTON_TEXT="${BUTTON_TEXT:-Открыть гражданство}"
MENU_BUTTON_TEXT="${MENU_BUTTON_TEXT:-Кабинет}"

install -d -o www-data -g www-data "$DEST"
rsync -a --delete \
  --exclude node_modules \
  --exclude .env \
  "$ROOT/bot/" "$DEST/"

write_env() {
  local token="${TELEGRAM_BOT_TOKEN:-}"
  if [[ -z "$token" && -f "$DEST/.env" ]]; then
    # keep existing token if caller did not pass a new one
    # shellcheck disable=SC1090
    token="$(grep -E '^TELEGRAM_BOT_TOKEN=' "$DEST/.env" | head -1 | cut -d= -f2- || true)"
  fi
  if [[ -z "$token" ]]; then
    echo "TELEGRAM_BOT_TOKEN missing — set env or $DEST/.env" >&2
    exit 1
  fi
  umask 077
  cat >"$DEST/.env" <<EOF
TELEGRAM_BOT_TOKEN=${token}
WEBAPP_URL=${WEBAPP_URL}
BUTTON_TEXT=${BUTTON_TEXT}
MENU_BUTTON_TEXT=${MENU_BUTTON_TEXT}
START_TEXT=Кабинет гражданина Чувашии / Волжской Булгарии.\\nНажмите кнопку, чтобы открыть миниапп.
EOF
  chown www-data:www-data "$DEST/.env"
  chmod 600 "$DEST/.env"
}

write_env

cd "$DEST"
if [[ -f package-lock.json ]]; then
  npm ci --omit=dev
fi
chown -R www-data:www-data "$DEST"

install -m 644 "$ROOT/deploy/chv-bot.service" /etc/systemd/system/chv-bot.service
systemctl daemon-reload
systemctl enable --now chv-bot.service
systemctl restart chv-bot.service

echo "chv-bot installed at $DEST"
systemctl --no-pager -l status chv-bot.service || true
