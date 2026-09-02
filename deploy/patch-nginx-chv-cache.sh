#!/bin/bash
set -euo pipefail

patch_conf() {
  local conf="$1"
  python3 - "$conf" <<'PY'
import sys
from pathlib import Path
p = Path(sys.argv[1])
text = p.read_text()
snippet = """
    location ^~ /chv-cache/ {
        proxy_pass http://127.0.0.1:8790/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        client_max_body_size 2m;
    }
"""
if "location ^~ /chv-cache/" in text:
    print(f"skip {p}: already patched")
    raise SystemExit(0)
needle = "    location ^~ /civic/ {"
if needle not in text:
    print(f"skip {p}: no civic location")
    raise SystemExit(0)
p.write_text(text.replace(needle, snippet + needle))
print(f"patched {p}")
PY
}

patch_conf /etc/nginx/sites-enabled/dao.won.onl.conf
patch_conf /etc/nginx/sites-enabled/dao.blc.cab.conf
nginx -t
systemctl reload nginx
curl -fsS http://127.0.0.1/chv-cache/health -H "Host: dao.won.onl"
echo
curl -fsS https://dao.won.onl/chv-cache/health
echo
systemctl start chv-cache-warm.service || true
sleep 2
curl -fsS http://127.0.0.1:8790/health
echo
systemctl is-active chv-cache-warm.timer
