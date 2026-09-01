# ТЗ: свой сервер кеша (независимость от DAO-платформы)

Для Cursor / разраба **State_ChuvashiaVolgaBulgaria**.  
Цель: чтения портала `chv.blc.cab` **не зависят** от shared-кеша `dao.blc.cab/civic` (лимиты, 429, чужой трафик флота).

Паспорт, civic-голос, prepaid-газ пока остаются на платформенном civic-verifier.  
Этот документ — **только** про слой кеша снимков (`McKeys` / `/v1/cache/*`).

Канон политики ключей (что кешировать): [`CACHE_POLICY.md`](CACHE_POLICY.md).  
Общее API UI: [`CUSTOM_UI_API.md`](CUSTOM_UI_API.md).

---

## 1. Зачем свой кеш

| Сейчас | Проблема |
|--------|----------|
| Портал: `GET https://dao.won.onl/civic/v1/cache/list?key=votings:EQ…` | Один пул с официальным миниаппом и всем флотом |
| Shared rate-limit / TonAPI ключи платформы | Чужой шторм → наш UI мисс / stale |
| Нет контроля TTL / warmer только под наш ДАО | Нельзя «греть» только State без нагрузки на всех |

**После:**

```
chv.blc.cab (статика)
    │  чтение votings / params / treasury / …
    ▼
cache.state.example  (наш VPS)   ← этот сервис
    │  miss → свои ключи TonAPI/Toncenter
    ▼
TON mainnet getters

chv.blc.cab
    │  passport / vote / gas / elig
    ▼
dao.won.onl/civic  (платформа, как сейчас)
```

Контракты и гражданство **не** переезжают. Меняется только **где лежат снимки** для UI State.

---

## 2. Скоуп (что делаем / чего не делаем)

### Делаем

1. Отдельный HTTP-сервис с контрактом совместимым с платформой:
   - `GET /v1/cache/list?key=`
   - `GET /v1/cache/peek?key=`
   - `POST /v1/cache/list`
   - `POST /v1/cache/invalidate` (опционально, Bearer)
   - `GET /v1/cache/stats`
   - `GET /health`
2. Persist на диск (`data/list-cache.json`).
3. CORS под `https://chv.blc.cab` (+ localhost).
4. Портал: отдельный base URL для кеша (`VITE_CACHE_API`), civic-base без изменений.
5. Ограничение ключей **только** нашим ДАО (`DAO_ADDRESS` из портала), чтобы чужие не свалили мусор.

### Не делаем в этой фазе

- Полный fork `civic-verifier` (grant / passport / Sumsub / gas / migrate).
- Свой MasterDAO / свой verifier wallet.
- Обязательный `POST /v1/cache/refresh` с серверным чтением chain (можно фазой 2; фаза 1 = клиент/warmer POST’ит снимки).

---

## 3. Откуда брать код (тот же GitHub)

Организация: `pressfreedomcoalition-art`.  
Платформа: репозиторий **`dao`**.  
State: этот репозиторий **`State_ChuvashiaVolgaBulgaria`**.

### Минимальный копипаст из `dao` (не весь civic-verifier)

| Файл в `dao` | Куда в State | Зачем |
|--------------|--------------|--------|
| `civic-verifier/listCache.mjs` | `cache-server/listCache.mjs` | In-memory + disk TTL / static / semi / live |
| `civic-verifier/liveCacheKeys.mjs` | `cache-server/liveCacheKeys.mjs` | Soft TTL live-ключей (90s) |
| (опционально) кусок CORS из `civic-verifier/publicApi.mjs` | `cache-server/cors.mjs` | Preflight для браузера |

**Не копировать** целиком: `civic-verifier/server.mjs`, `coalition/`, passport, gas, Sumsub.

### Свой тонкий сервер

Новый каталог в этом репо: `cache-server/`

```
cache-server/
  package.json          # express, @ton/core (если нужен Address), node ≥20
  server.mjs            # ~150–250 строк: health + cache routes + CORS + DAO allowlist
  listCache.mjs         # копия из dao
  liveCacheKeys.mjs     # копия из dao
  data/                 # gitignore; list-cache.json
  README.md             # run / env
```

Зависимости: `express`. `@ton/ton` / `@ton/core` — только если в `server.mjs` нормализуете адреса в bounceable или читаете LT с chain.

Команда синхронизации (ручная / скрипт Cursor):

```bash
# из корня State_ChuvashiaVolgaBulgaria, рядом лежит ../dao
cp ../dao/civic-verifier/listCache.mjs cache-server/
cp ../dao/civic-verifier/liveCacheKeys.mjs cache-server/
```

При апстрим-правках TTL в `dao` — **перекопировать** эти два файла и прогнать smoke (§8). Не править логику TTL в State «на глаз» без причины.

---

## 4. HTTP-контракт (совместимость с порталом)

База (пример): `https://cache.chv.example`  
Портал сегодня ждёт тот же JSON, что платформа.

### `GET /health`

```json
{ "ok": true, "service": "chv-cache", "dao": "EQ…", "entries": 12 }
```

### `GET /v1/cache/list?key=votings:EQ…`

- `200` `{ "ok": true, "at": 1710000000000, "lts": {}, "value": … }`
- `404` `{ "ok": false, "error": "miss" }`
- `429` `{ "ok": false, "error": "rate" }`

### `GET /v1/cache/peek?key=`

Last-good без TTL/LT-гейта (как на платформе) — fallback UI.

### `POST /v1/cache/list`

```json
{
  "key": "votings:EQ…",
  "value": [ ],
  "static": false,
  "semi": false,
  "scopeAddrs": ["EQ…"],
  "lts": { "EQ…": "12345" },
  "replace": false
}
```

Правила (как платформа):

- `static: true` — meta / action / sides.
- `semi: true` — params / daoConfig / daoEntry.
- Live — `scopeAddrs` опционально; для soft-live ключей LT можно не слать.
- `votings:`: **не** постить пустой `[]`, если это не доказанная пустота после chain.
- Адреса в ключе — **bounceable** `EQ…`.

### Allowlist ДАО

Env `DAO_ADDRESS=EQ…` (тот же, что `VITE_DAO_ADDRESS` портала).

Отклонять `400` / `403`, если в `key` есть адрес контейнера **и** он не совпадает с `DAO_ADDRESS` (и опционально `LANG_DAO_ADDRESS`).  
Ключи без адреса ДАО (`jetton:…`) — либо запретить, либо allowlist мастеров токенов State.

---

## 5. Портал: развести cache и civic

Сейчас `portal/src/lib/civic.ts` → `cacheGet` ходит в `CIVIC_API` (`dao.won.onl/civic`).

Нужно:

1. `VITE_CACHE_API` (или `cacheBase()` в `config.ts`) — URL своего кеша.
2. `cacheGet` / будущий `cacheSet` → только `VITE_CACHE_API`.
3. Passport / vote / gas / elig → по-прежнему `CIVIC_API` (платформа).

Пример:

```ts
// config.ts
export function cacheBase() {
  if (isLocalHost()) return "/cache"; // vite proxy → localhost:8790
  return import.meta.env.VITE_CACHE_API || "https://cache.chv.example";
}
```

Пока своего сервера нет — fallback на `civicBase()` (текущее поведение), чтобы не сломать Pages.

Vite proxy (dev):

```ts
proxy: {
  "/civic": "https://dao.won.onl",
  "/cache": "http://127.0.0.1:8790",
}
```

---

## 6. Как наполнять кеш

### Вариант A (фаза 1, минимальный) — write-through с клиента / скрипта

1. Miss на `GET` → портал (или CI warmer) читает chain своими ключами.
2. `POST /v1/cache/list` свежий snap.
3. Следующие гости бьют в наш кеш.

Warmer (cron на VPS или GitHub Action с секретом TonAPI):

- раз в N секунд для `DAO_ADDRESS`: `daoConfig`, `params`, `votings`, `treasury`, `deputyProfiles`;
- после miss на detail — `votingState` / `votingMeta`.

### Вариант B (фаза 2) — серверный refresh

Скопировать/упростить `POST /v1/cache/refresh` из `dao/civic-verifier` **только** для ключей State (votings rediscover children и т.п.).  
Нужны `TONAPI_KEY` / `TONCENTER_KEY` на VPS. Не тащить grant/passport.

Фазу 2 делать только если A упирается в 429 на клиентах без ключей.

---

## 7. Деплой

| Параметр | Рекомендация |
|----------|--------------|
| Хост | Отдельный дешёвый VPS / тот же, что ops State (не обязан быть dao.blc.cab) |
| Процесс | systemd `chv-cache.service` → `node server.mjs` |
| Порт | `8790` (или за nginx `https://cache.…` → 127.0.0.1:8790) |
| TLS | Let’s Encrypt / Cloudflare по вкусу; для РФ лучше без CF на API, как `dao.won.onl` |
| Диск | `./data` persist; бэкап не критичен (перегреется) |
| Env | `PORT`, `DAO_ADDRESS`, `CORS_ORIGIN=https://chv.blc.cab`, опционально `TONAPI_KEY` |
| Секреты | В `.env` на сервере; **не** в GitHub Pages / не в этот публичный фронт-репо без нужды |

Публичный URL кеша прописать в `VITE_CACHE_API` при билде портала (или runtime config, если появится).

---

## 8. Приёмка

1. `GET https://cache…/health` → `ok: true`, в ответе наш `dao`.
2. С origin `https://chv.blc.cab`: preflight `OPTIONS` + `GET /v1/cache/list` — CORS ок.
3. Холодный miss → `404 miss`; после `POST` валидного `votings:EQ…` — `GET` отдаёт value.
4. Портал с `VITE_CACHE_API` открывает кабинет: имя ДАО / список референдумов **без** запросов к `dao.*/civic/v1/cache/*` (DevTools).
5. Civic Face ID / голос / газ по-прежнему идут на платформенный `/civic` (не на cache-host).
6. `POST` с ключом чужого ДАО → отказ.
7. Рестарт процесса → снимки с диска поднимаются (`list-cache.json`).

---

## 9. Порядок работ для Cursor (чеклист)

1. Создать `cache-server/` в этом репо; скопировать `listCache.mjs` + `liveCacheKeys.mjs` из `dao`.
2. Написать тонкий `server.mjs` (§4) + `.gitignore` на `data/`.
3. Локально: `npm i && PORT=8790 DAO_ADDRESS=EQ… node server.mjs`.
4. Подключить `VITE_CACHE_API` / `cacheGet` в портале (§5); fallback на civic пока нет продакшен-URL.
5. Smoke curl §8.1–8.3.
6. Выкат VPS + TLS; прописать URL в билде Pages.
7. Warmer cron (§6A) под наш `DAO_ADDRESS`.
8. (Опционально) фаза 2 refresh.

---

## 10. Риски и границы

- Свой кеш **не** делает State независимым по гражданству: directory / grant / nullifier остаются на платформе, пока не будет отдельного ТЗ на fork verifier.
- Грязный POST от клиента теоретически может отравить snap — поэтому allowlist ДАО + не принимать пустые `votings:[]` / `params:[]` без `replace`/доказательства; warmer с серверным ключом предпочтительнее анонимного клиента.
- Не слать platform `NOTIFY_SECRET` / `VERIFIER_MNEMONIC` на cache-host — они тут не нужны.
- Не менять on-chain контракты ради кеша.

---

## 11. Связь с текущим порталом

| Файл | Что поменять после подъёма сервера |
|------|-------------------------------------|
| `portal/src/lib/config.ts` | `cacheBase()` / `VITE_CACHE_API` |
| `portal/src/lib/civic.ts` | `cacheGet` (и POST write-through, если добавите) → cache base |
| `portal/vite.config.*` | proxy `/cache` |
| билд Pages | env `VITE_CACHE_API=https://…` |

Пока URL нет — поведение как сейчас (кеш через civic), документ не ломает прод.
