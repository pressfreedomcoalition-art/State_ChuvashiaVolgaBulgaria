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

# Public IPv4 — other vhosts (e.g. miniapp/bulcoin) may bind listen IP:443 specifically;
# then a catch-all listen 443 never receives traffic for this hostname.
PUBLIC_IP="$(curl -4 -fsS --max-time 5 ifconfig.me 2>/dev/null || true)"
if [[ -z "$PUBLIC_IP" ]]; then
  PUBLIC_IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
fi
echo "PUBLIC_IP=${PUBLIC_IP:-unknown}"
if [[ -z "${PUBLIC_IP}" ]]; then
  echo "cannot detect PUBLIC_IP" >&2
  exit 1
fi

mkdir -p "$WWW/.well-known/acme-challenge"
echo ok >"$WWW/.well-known/acme-challenge/ping"
rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true

# Optional LE includes — missing ssl-dhparams used to fail nginx -t and leave only miniapp on :443.
SSL_EXTRA=""
if [[ -f /etc/letsencrypt/options-ssl-nginx.conf ]]; then
  SSL_EXTRA+="    include /etc/letsencrypt/options-ssl-nginx.conf;"$'\n'
fi
if [[ -f /etc/letsencrypt/ssl-dhparams.pem ]]; then
  SSL_EXTRA+="    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;"$'\n'
fi

write_http_conf() {
  cat >"/etc/nginx/sites-available/${SITE}.conf" <<EOF
server {
    listen 80;
    listen [::]:80;
    listen ${PUBLIC_IP}:80;
    server_name chv.blc.cab;
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/chv.blc.cab;
        default_type text/plain;
        allow all;
    }
    location / {
        proxy_pass https://dao.blc.cab;
        proxy_http_version 1.1;
        proxy_ssl_server_name on;
        proxy_ssl_name dao.blc.cab;
        proxy_set_header Host dao.blc.cab;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Original-Host \$host;
    }
}
EOF
}

write_https_conf() {
  cat >"/etc/nginx/sites-available/${SITE}.conf" <<EOF
server {
    listen 80;
    listen [::]:80;
    listen ${PUBLIC_IP}:80;
    server_name chv.blc.cab;
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/chv.blc.cab;
        default_type text/plain;
        allow all;
    }
    location / {
        return 301 https://\$host\$request_uri;
    }
}
server {
    # Match bulcoin/miniapp listen style (ssl without http2 param) so we share the same
    # address:port group and SNI can select this server_name.
    listen 443 ssl;
    listen [::]:443 ssl;
    listen ${PUBLIC_IP}:443 ssl default_server;
    server_name chv.blc.cab;
    ssl_certificate     /etc/letsencrypt/live/chv.blc.cab/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/chv.blc.cab/privkey.pem;
${SSL_EXTRA}    location / {
        proxy_pass https://dao.blc.cab;
        proxy_http_version 1.1;
        proxy_ssl_server_name on;
        proxy_ssl_name dao.blc.cab;
        proxy_set_header Host dao.blc.cab;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$host;
        proxy_set_header X-Original-Host \$host;
        proxy_redirect https://dao.blc.cab/ /;
        proxy_redirect http://dao.blc.cab/ /;
    }
}
EOF
}

write_http_conf

ln -sfn "/etc/nginx/sites-available/${SITE}.conf" "/etc/nginx/sites-enabled/${SITE}.conf"
rm -f /etc/nginx/sites-enabled/chv.blc.cab.static.conf 2>/dev/null || true

nginx -t
systemctl reload nginx

echo "ACME probe local: $(curl -fsS -H 'Host: chv.blc.cab' http://127.0.0.1/.well-known/acme-challenge/ping || echo FAIL)"
echo "ACME probe on PUBLIC_IP: $(curl -fsS --connect-to chv.blc.cab:80:${PUBLIC_IP}:80 http://chv.blc.cab/.well-known/acme-challenge/ping || echo FAIL)"
echo "ACME probe public DNS: $(curl -fsS http://chv.blc.cab/.well-known/acme-challenge/ping || echo FAIL)"

if [[ ! -f "/etc/letsencrypt/live/${SITE}/fullchain.pem" ]]; then
  echo "Issuing TLS for ${SITE} via webroot…"
  if certbot certonly --webroot -w "$WWW" -d "$SITE" \
      --non-interactive --agree-tos --register-unsafely-without-email; then
    echo "certificate issued"
  else
    echo "certbot failed or rate-limited — HTTP mirror stays up" >&2
    echo "mirror install done for ${SITE} (HTTP only)"
    exit 0
  fi
fi

if [[ -f "/etc/letsencrypt/live/${SITE}/fullchain.pem" ]]; then
  echo "On-disk LE cert for ${SITE}:"
  openssl x509 -in "/etc/letsencrypt/live/${SITE}/fullchain.pem" -noout -subject -ext subjectAltName || true
  if ! openssl x509 -in "/etc/letsencrypt/live/${SITE}/fullchain.pem" -noout -text 2>/dev/null | grep -q "DNS:chv.blc.cab"; then
    echo "ERROR: /etc/letsencrypt/live/${SITE} is not a cert for chv.blc.cab — re-issue" >&2
    certbot certonly --webroot -w "$WWW" -d "$SITE" --force-renewal \
      --non-interactive --agree-tos --register-unsafely-without-email || true
  fi

  # miniapp (bulcoin.conf) often owns listen IP:443 as the only/default vhost; steal default_server
  # and ensure we share the same listen socket so SNI can select chv.blc.cab.
  if [[ -f /etc/nginx/sites-available/bulcoin.conf ]]; then
    cp -a /etc/nginx/sites-available/bulcoin.conf "/etc/nginx/sites-available/bulcoin.conf.bak-chv-$(date +%s)"
    # Drop default_server on 443 if present; keep miniapp reachable by its own server_name.
    sed -i -E 's/(listen[[:space:]]+[^;]*443[^;]*)[[:space:]]+default_server/\1/g' \
      /etc/nginx/sites-available/bulcoin.conf || true
  fi

  write_https_conf
  # Ensure default_server on the public IP (write_https_conf already sets it; keep idempotent).
  if ! grep -q "listen ${PUBLIC_IP}:443 ssl default_server" "/etc/nginx/sites-available/${SITE}.conf"; then
    sed -i -E "s#listen ${PUBLIC_IP}:443 ssl;#listen ${PUBLIC_IP}:443 ssl default_server;#" \
      "/etc/nginx/sites-available/${SITE}.conf"
  fi

  if nginx -t; then
    systemctl reload nginx
    echo "HTTPS mirror enabled for ${SITE}"
  else
    echo "TLS conf failed nginx -t; dumping conf:" >&2
    cat "/etc/nginx/sites-available/${SITE}.conf" >&2 || true
    write_http_conf
    nginx -t && systemctl reload nginx
    echo "reverted to HTTP" >&2
    exit 1
  fi
fi

probe_sni() {
  local dest="$1"
  echo | openssl s_client -connect "${dest}" -servername chv.blc.cab 2>/dev/null \
    | openssl x509 -noout -subject -ext subjectAltName 2>/dev/null || true
}

echo "TLS peer SNI chv → 127.0.0.1:443:"
probe_sni "127.0.0.1:443"
echo "TLS peer SNI chv → ${PUBLIC_IP}:443:"
PEER="$(probe_sni "${PUBLIC_IP}:443")"
echo "$PEER"
if ! echo "$PEER" | grep -q "DNS:chv.blc.cab\|CN *= *chv.blc.cab\|CN=chv.blc.cab"; then
  echo "ERROR: SNI chv.blc.cab is not presenting chv.blc.cab cert" >&2
  echo "==== nginx -T ssl excerpt" >&2
  nginx -T 2>/dev/null | grep -nE "server_name|listen .*443|ssl_certificate " | head -120 >&2 || true
  echo "==== listen 443" >&2
  ss -lntp | grep ':443' >&2 || true
  exit 1
fi

CODE="$(curl -fsS -o /dev/null -w '%{http_code}' --resolve "chv.blc.cab:443:${PUBLIC_IP}" https://chv.blc.cab/ || echo 000)"
echo "HTTPS probe via PUBLIC_IP: HTTP ${CODE}"
if [[ "$CODE" != "200" && "$CODE" != "301" && "$CODE" != "302" ]]; then
  echo "ERROR: unexpected HTTPS status ${CODE}" >&2
  exit 1
fi

echo "mirror install done for ${SITE}"
