#!/usr/bin/env bash
# Restart only the HTTPS tunnel (Pinggy). No sudo. Call from user crontab every ~25m.
set -euo pipefail
ROOT="${HOME}/chv-cache"
LOGS="${ROOT}/logs"
PUBLIC_URL_FILE="${ROOT}/public-url.txt"
mkdir -p "$LOGS"

# Keep node cache up
if [[ -f "${ROOT}/cache.pid" ]] && kill -0 "$(cat "${ROOT}/cache.pid")" 2>/dev/null; then
  :
elif curl -fsS http://127.0.0.1:8790/health >/dev/null 2>&1; then
  :
else
  echo "cache node down — run start-user-cache.sh first" >&2
  exit 1
fi

# If current public URL still healthy, keep tunnel
OLD=""
if [[ -f "$PUBLIC_URL_FILE" ]]; then
  OLD=$(tr -d '\r\n' <"$PUBLIC_URL_FILE")
fi
if [[ -n "$OLD" ]] && curl -fsS --max-time 12 "${OLD}/health" >/dev/null 2>&1; then
  echo "PUBLIC_URL=${OLD} (still healthy)"
  exit 0
fi

pkill -f "a.pinggy.io" 2>/dev/null || true
pkill -f "nokey@localhost.run" 2>/dev/null || true
sleep 1

: >"${LOGS}/tunnel.log"
nohup ssh -p 443 \
  -o StrictHostKeyChecking=accept-new \
  -o ServerAliveInterval=30 \
  -o ServerAliveCountMax=3 \
  -o ExitOnForwardFailure=yes \
  -R0:127.0.0.1:8790 \
  a.pinggy.io \
  >>"${LOGS}/tunnel.log" 2>&1 &
echo $! >"${ROOT}/tunnel.pid"

URL=""
for i in $(seq 1 40); do
  URL=$(grep -Eo 'https://[a-zA-Z0-9._-]+' "${LOGS}/tunnel.log" 2>/dev/null \
    | grep -E 'pinggy-free\.link|free\.pinggy\.net|a\.pinggy\.link|pinggy\.link|localhost\.run' \
    | grep -v 'dashboard\.pinggy' \
    | head -1 || true)
  if [[ -n "$URL" ]]; then
    break
  fi
  sleep 1
done

if [[ -z "$URL" ]]; then
  echo "tunnel URL missing" >&2
  tail -30 "${LOGS}/tunnel.log" >&2 || true
  exit 1
fi

URL="${URL%/}"
printf '%s\n' "$URL" >"$PUBLIC_URL_FILE"
echo "PUBLIC_URL=${URL}"
curl -fsS --max-time 20 "${URL}/health" || true
echo
