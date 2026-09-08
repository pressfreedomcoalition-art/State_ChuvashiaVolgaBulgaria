#!/usr/bin/env bash
# Install/run CHV cache as a normal user (no sudo/root).
# HTTPS via outbound SSH reverse tunnel (Pinggy) — Pages needs HTTPS (no mixed content).
# Avoids Cloudflare (RF). Frontend stays on GitHub Pages.
set -euo pipefail

ROOT="${HOME}/chv-cache"
NODE_VER="v22.14.0"
NODE_DIR="${HOME}/.local/node-${NODE_VER}-linux-x64"
LOGS="${ROOT}/logs"
BUNDLE="${1:-/tmp/chv-cache-bundle.tar}"
PUBLIC_URL_FILE="${ROOT}/public-url.txt"

mkdir -p "$ROOT" "$LOGS" "${HOME}/.local/bin"

if [[ ! -x "${NODE_DIR}/bin/node" ]]; then
  echo "Installing Node ${NODE_VER} into ${NODE_DIR}…"
  TMP=$(mktemp -d)
  curl -fsSL "https://nodejs.org/dist/${NODE_VER}/node-${NODE_VER}-linux-x64.tar.xz" -o "$TMP/node.tar.xz"
  tar -xJf "$TMP/node.tar.xz" -C "${HOME}/.local"
  rm -rf "$TMP"
fi
export PATH="${NODE_DIR}/bin:${HOME}/.local/bin:${PATH}"
node -v
npm -v

if [[ -f "${ROOT}/.env" ]]; then
  cp -a "${ROOT}/.env" /tmp/chv-cache.env.bak
fi
# keep data/
mkdir -p "${ROOT}/data"
tar -xf "$BUNDLE" -C "$ROOT"
if [[ -f /tmp/chv-cache.env.bak ]]; then
  mv /tmp/chv-cache.env.bak "${ROOT}/.env"
elif [[ ! -f "${ROOT}/.env" ]]; then
  cat >"${ROOT}/.env" <<'ENV'
PORT=8790
DAO_ADDRESS=EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx
CORS_ORIGIN=https://chv.blc.cab,http://localhost:5173
DATA_DIR=./data
ENV
fi

cd "$ROOT"
npm ci --omit=dev

# stop previous
pkill -f "${ROOT}/server.mjs" 2>/dev/null || true
pkill -f "pinggy.io" 2>/dev/null || true
pkill -f "nokey@localhost.run" 2>/dev/null || true
sleep 1

nohup bash -c "set -a; . '${ROOT}/.env'; set +a; exec node '${ROOT}/server.mjs'" >>"${LOGS}/cache.log" 2>&1 &
echo $! >"${ROOT}/cache.pid"

for i in 1 2 3 4 5 6 7 8 9 10 12 14 16 18 20; do
  if curl -fsS http://127.0.0.1:8790/health >/dev/null; then
    break
  fi
  sleep 1
done
curl -fsS http://127.0.0.1:8790/health
echo

rm -f "${LOGS}/tunnel.log" "$PUBLIC_URL_FILE"
: >"${LOGS}/tunnel.log"

# Prefer Pinggy (HTTPS, not Cloudflare). Fallback: localhost.run
start_pinggy() {
  nohup ssh -p 443 \
    -o StrictHostKeyChecking=accept-new \
    -o ServerAliveInterval=30 \
    -o ServerAliveCountMax=3 \
    -o ExitOnForwardFailure=yes \
    -R0:127.0.0.1:8790 \
    a.pinggy.io \
    >>"${LOGS}/tunnel.log" 2>&1 &
  echo $! >"${ROOT}/tunnel.pid"
}

start_localhost_run() {
  nohup ssh \
    -o StrictHostKeyChecking=accept-new \
    -o ServerAliveInterval=30 \
    -o ServerAliveCountMax=3 \
    -o ExitOnForwardFailure=yes \
    -R 80:127.0.0.1:8790 \
    nokey@localhost.run \
    >>"${LOGS}/tunnel.log" 2>&1 &
  echo $! >"${ROOT}/tunnel.pid"
}

start_pinggy

URL=""
for i in $(seq 1 45); do
  URL=$(grep -Eo 'https://[a-zA-Z0-9._-]+' "${LOGS}/tunnel.log" 2>/dev/null \
    | grep -E 'pinggy-free\.link|free\.pinggy\.net|a\.pinggy\.link|pinggy\.link|localhost\.run' \
    | grep -v 'dashboard\.pinggy' \
    | head -1 || true)
  if [[ -n "$URL" ]]; then
    break
  fi
  # if pinggy died quickly, try localhost.run once
  if [[ "$i" -eq 15 ]] && ! kill -0 "$(cat "${ROOT}/tunnel.pid" 2>/dev/null || echo 0)" 2>/dev/null; then
    echo "Pinggy tunnel died — trying localhost.run"
    start_localhost_run
  fi
  sleep 1
done

if [[ -z "$URL" ]]; then
  echo "Tunnel URL not found. Last tunnel log:" >&2
  tail -50 "${LOGS}/tunnel.log" >&2 || true
  exit 1
fi

# strip trailing slash
URL="${URL%/}"
printf '%s\n' "$URL" >"$PUBLIC_URL_FILE"
echo "PUBLIC_URL=${URL}"

# user crontab @reboot (no sudo)
CRON_LINE="@reboot ${ROOT}/start-user-cache.sh"
touch "${ROOT}/start-user-cache.sh"
# start-user-cache.sh is overwritten by deploy; ensure executable wrapper exists below
( crontab -l 2>/dev/null | grep -v 'start-user-cache.sh' || true; echo "$CRON_LINE" ) | crontab -

curl -fsS "${URL}/health" || curl -fsS -H "Host: $(echo "$URL" | sed 's|https://||')" "${URL}/health" || true
echo
echo "OK user-space cache + tunnel"
