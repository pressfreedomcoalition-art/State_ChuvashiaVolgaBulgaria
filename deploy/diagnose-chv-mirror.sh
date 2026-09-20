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
echo "==== bulcoin conf head"
sed -n '1,60p' /etc/nginx/sites-available/bulcoin.conf || true
echo "==== curl :8080 acme"
curl -sS -D- -o /tmp/acme8080.out -H 'Host: chv.blc.cab' http://127.0.0.1:8080/.well-known/acme-challenge/ping | head -25 || true
echo "BODY8080:"; cat /tmp/acme8080.out 2>/dev/null || true; echo
echo "==== iptables nat"
iptables -t nat -L -n 2>/dev/null | head -40 || true
echo "==== nft"
nft list ruleset 2>/dev/null | head -80 || true
echo "==== openssl SNI chv.blc.cab"
IP="$(curl -4 -fsS --max-time 5 ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"
echo | openssl s_client -connect "${IP}:443" -servername chv.blc.cab 2>/dev/null \
  | openssl x509 -noout -subject -ext subjectAltName 2>/dev/null || true
echo "==== cert files"
ls -la /etc/letsencrypt/live/chv.blc.cab/ 2>/dev/null || true
