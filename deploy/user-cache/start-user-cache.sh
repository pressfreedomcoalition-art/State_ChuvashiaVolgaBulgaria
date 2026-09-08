#!/usr/bin/env bash
# @reboot helper — restart cache + tunnel after VPS reboot (no sudo).
set -euo pipefail
ROOT="${HOME}/chv-cache"
export PATH="${HOME}/.local/node-v22.14.0-linux-x64/bin:${HOME}/.local/bin:${PATH}"
cd "$ROOT"
# Re-run install with existing tree (no tar) — just restart processes + tunnel
LOGS="${ROOT}/logs"
mkdir -p "$LOGS"
pkill -f "${ROOT}/server.mjs" 2>/dev/null || true
pkill -f "pinggy.io" 2>/dev/null || true
pkill -f "nokey@localhost.run" 2>/dev/null || true
sleep 1
nohup bash -c "set -a; . '${ROOT}/.env'; set +a; exec node '${ROOT}/server.mjs'" >>"${LOGS}/cache.log" 2>&1 &
echo $! >"${ROOT}/cache.pid"
sleep 2
: >"${LOGS}/tunnel.log"
nohup ssh -p 443 \
  -o StrictHostKeyChecking=accept-new \
  -o ServerAliveInterval=30 \
  -o ExitOnForwardFailure=yes \
  -R0:127.0.0.1:8790 \
  a.pinggy.io \
  >>"${LOGS}/tunnel.log" 2>&1 &
echo $! >"${ROOT}/tunnel.pid"
# URL may change after reboot — CI monitor job should refresh VITE_CACHE_API
