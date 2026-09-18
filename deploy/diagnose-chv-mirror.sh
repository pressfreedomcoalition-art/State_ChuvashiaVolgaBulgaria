#!/usr/bin/env bash
set -euo pipefail
echo "==== sites-enabled"
ls -la /etc/nginx/sites-enabled/
echo "==== conf"
sed -n '1,100p' /etc/nginx/sites-available/chv.blc.cab.conf || true
echo "==== challenge dir"
ls -la /var/www/chv.blc.cab/.well-known/acme-challenge/ || true
echo "==== listeners"
ss -lntp | grep -E ':80|:443' || true
echo "==== local curl headers"
curl -sS -D- -o /tmp/acme.out -H 'Host: chv.blc.cab' http://127.0.0.1/.well-known/acme-challenge/ping | head -25 || true
echo "BODY:"; cat /tmp/acme.out 2>/dev/null || true; echo
echo "==== root curl"
curl -sS -D- -o /dev/null -H 'Host: chv.blc.cab' http://127.0.0.1/ | head -20 || true
