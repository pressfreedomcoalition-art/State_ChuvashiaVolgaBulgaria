# CHV cache server

Отдельный HTTP-слой снимков (`/v1/cache/*`) для портала [chv.blc.cab](https://chv.blc.cab).  
Не форк civic-verifier: паспорт / голос / газ остаются на `dao.*/civic`.

ТЗ: [`docs/OWN_CACHE_SERVER_TZ.md`](../docs/OWN_CACHE_SERVER_TZ.md).

## Deploy (VPS)

Samples in [`deploy/`](../deploy/):

| File | Role |
|------|------|
| `install-chv-cache.sh` | rsync → `/opt/chv-cache`, systemd enable |
| `chv-cache.service` | `node server.mjs` |
| `chv-cache-warm.service` + `.timer` | every ~2 min pull from civic → POST local |
| `nginx-cache.chv.example.conf` | TLS vhost → `:8790` |

```bash
# on the VPS, from a clone of this repo:
sudo bash deploy/install-chv-cache.sh
sudo nano /opt/chv-cache/.env   # DAO_ADDRESS, CORS_ORIGIN=https://chv.blc.cab
sudo systemctl restart chv-cache
# nginx + certbot for cache.chv.blc.cab (or your host)
```

Then set GitHub Actions variable **`VITE_CACHE_API`**=`https://cache…` so Pages builds point the portal at your cache. Until set, portal keeps using platform civic cache.

## Run

```bash
cd cache-server
npm i
# Windows PowerShell:
$env:PORT=8790
$env:DAO_ADDRESS="EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx"
$env:CORS_ORIGIN="https://chv.blc.cab,http://localhost:5173"
npm start
```

## Env

| Var | Required | Meaning |
|-----|----------|---------|
| `DAO_ADDRESS` | yes | Bounceable EQ… State DAO (allowlist) |
| `LANG_DAO_ADDRESS` | no | Second allowlisted container |
| `PORT` | no | Default `8790` |
| `CORS_ORIGIN` | no | Comma list; default `*` |
| `CACHE_SECRET` | no | Bearer for `POST /v1/cache/invalidate` |
| `TONAPI_KEY` | no | Account LT for non–soft-live keys |
| `DATA_DIR` | no | Default `./data` → `list-cache.json` |

## Sync TTL logic from `dao`

If sibling repo `../dao` exists:

```bash
npm run sync-from-dao
```

Copies `listCache.mjs`, `liveCacheKeys.mjs`, `votingsUnion.mjs`. After sync, re-check `listCache` stats if upstream renamed constants.

## Smoke

```bash
curl -s http://127.0.0.1:8790/health
curl -s "http://127.0.0.1:8790/v1/cache/list?key=votings:EQ…"   # 404 miss
curl -s -X POST http://127.0.0.1:8790/v1/cache/list \
  -H "content-type: application/json" \
  -d '{"key":"daoConfig:EQ…","value":{"name":"CHV"},"semi":true}'
```

## Portal

Dev: Vite proxies `/cache` → `127.0.0.1:8790`.  
Prod: set `VITE_CACHE_API=https://cache…` at Pages build; without it portal falls back to civic cache.
