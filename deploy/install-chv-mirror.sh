#!/usr/bin/env bash
# Install / refresh nginx reverse-proxy for chv.blc.cab → dao.blc.cab
# Re-run after DNS A points here so certbot can issue TLS.
set -euo pipefail

CONF_SRC="${1:-/tmp/nginx-chv-mirror.conf}"
SITE=chv.blc.cab
WWW="/var/www/${SITE}"

if [[ ! -f "$CONF_SRC" ]]; then
  echo "missing nginx conf: $CONF_SRC" >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
command -v nginx >/dev/null 2>&1 || apt-get install -y nginx
command -v certbot >/dev/null 2>&1 || apt-get install -y certbot python3-certbot-nginx

mkdir -p "$WWW"
# HTTP-only bootstrap if certs not yet issued
if [[ ! -f "/etc/letsencrypt/live/${SITE}/fullchain.pem" ]]; then
  cat >"/etc/nginx/sites-available/${SITE}.conf" <<'HTTPONLY'
server {
    listen 80;
    listen [::]:80;
    server_name chv.blc.cab;
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/chv.blc.cab;
        default_type text/plain;
    }
    location / {
        proxy_pass https://dao.blc.cab;
        proxy_http_version 1.1;
        proxy_ssl_server_name on;
        proxy_ssl_name dao.blc.cab;
        proxy_set_header Host dao.blc.cab;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_set_header X-Original-Host $host;
    }
}
HTTPONLY
else
  cp "$CONF_SRC" "/etc/nginx/sites-available/${SITE}.conf"
fi

ln -sfn "/etc/nginx/sites-available/${SITE}.conf" "/etc/nginx/sites-enabled/${SITE}.conf"
# Do not keep an old static cabinet vhost if present
rm -f /etc/nginx/sites-enabled/chv.blc.cab.static.conf 2>/dev/null || true

nginx -t
systemctl reload nginx

if [[ ! -f "/etc/letsencrypt/live/${SITE}/fullchain.pem" ]]; then
  echo "Issuing TLS for ${SITE} (DNS must already point to this host)…"
  if certbot --nginx -d "$SITE" --non-interactive --agree-tos --register-unsafely-without-email --redirect; then
    cp "$CONF_SRC" "/etc/nginx/sites-available/${SITE}.conf"
    # Re-inject certbot-managed listen if needed: prefer keeping certbot-edited file when full conf fails
    nginx -t && systemctl reload nginx || true
  else
    echo "certbot deferred — point DNS A ${SITE} → this VPS, then re-run" >&2
  fi
fi

echo "mirror install done for ${SITE}"
