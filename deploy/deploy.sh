#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/portal"
npm ci
npm run build
npm test
DEST="${DEPLOY_DEST:-/var/www/chv.blc.cab}"
sudo mkdir -p "$DEST"
sudo rsync -a --delete dist/ "$DEST/"
echo "deployed to $DEST"
