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

mkdir -p "$WWW/.well-known/acme-challenge"

# Always keep an HTTP vhost that serves ACME + proxies the app (until/after TLS).
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

ln -sfn "/etc/nginx/sites-available/${SITE}.conf" "/etc/nginx/sites-enabled/${SITE}.conf"
rm -f /etc/nginx/sites-enabled/chv.blc.cab.static.conf 2>/dev/null || true

nginx -t
systemctl reload nginx

if [[ ! -f "/etc/letsencrypt/live/${SITE}/fullchain.pem" ]]; then
  echo "Issuing TLS for ${SITE} via webroot…"
  # webroot works with reverse-proxy; --nginx plugin often 404s on ACME
  if certbot certonly --webroot -w "$WWW" -d "$SITE" \
      --non-interactive --agree-tos --register-unsafely-without-email; then
    echo "certificate issued"
  else
    echo "certbot failed — check DNS A ${SITE} → this VPS and port 80" >&2
    echo "mirror install done for ${SITE} (HTTP only)"
    exit 0
  fi
fi

if [[ -f "/etc/letsencrypt/live/${SITE}/fullchain.pem" ]]; then
  cp "$CONF_SRC" "/etc/nginx/sites-available/${SITE}.conf"
  if nginx -t; then
    systemctl reload nginx
    echo "HTTPS mirror enabled for ${SITE}"
  else
    echo "full TLS conf failed nginx -t; keeping HTTP bootstrap" >&2
    # restore HTTP-only so site stays up
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
    nginx -t && systemctl reload nginx
  fi
fi

echo "mirror install done for ${SITE}"
