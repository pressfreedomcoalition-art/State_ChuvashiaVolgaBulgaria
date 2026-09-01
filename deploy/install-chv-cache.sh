#!/usr/bin/env bash
# Install / update chv-cache on a Linux VPS (run as root or with sudo).
# Usage: sudo ./deploy/install-chv-cache.sh [/opt/chv-cache]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="${1:-/opt/chv-cache}"

install -d -o www-data -g www-data "$DEST" "$DEST/data"
rsync -a --delete \
  --exclude node_modules \
  --exclude data \
  --exclude .env \
  "$ROOT/cache-server/" "$DEST/"

if [[ ! -f "$DEST/.env" ]]; then
  cp "$DEST/.env.example" "$DEST/.env"
  echo "Created $DEST/.env — edit DAO_ADDRESS / CORS_ORIGIN before start"
fi

cd "$DEST"
npm ci --omit=dev
chown -R www-data:www-data "$DEST"

install -m 644 "$ROOT/deploy/chv-cache.service" /etc/systemd/system/chv-cache.service
install -m 644 "$ROOT/deploy/chv-cache-warm.service" /etc/systemd/system/chv-cache-warm.service
install -m 644 "$ROOT/deploy/chv-cache-warm.timer" /etc/systemd/system/chv-cache-warm.timer

systemctl daemon-reload
systemctl enable --now chv-cache.service
systemctl enable --now chv-cache-warm.timer
systemctl start chv-cache-warm.service || true

echo "chv-cache installed at $DEST"
curl -fsS "http://127.0.0.1:8790/health" || true
echo
echo "Next: point nginx (deploy/nginx-cache.chv.example.conf) + set Pages secret VITE_CACHE_API"
