# Bound domain: chv.blc.cab → официальный DAO (CHV)

Цель: `https://chv.blc.cab` отдаёт **официальный миниапп** BLC, сразу государство CHV, без каталога флота, с темой `ui.css`. Свой React-кабинет с apex снят.

DAO: `EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx`  
Канон UI: https://dao.blc.cab · зеркало РФ: https://dao.won.onl  
Бот: `@bulgaria_state_bot`

## 1. Голосования (ончейн, kind=4)

Открыть ДАО в официальном UI, Hub → создать голосование → Start → **За** → Finalize.

### 1.1 Тема экрана (vtype **33**, ключ `ui.css`)

Вставить **JSON** (не URL):

```json
{"v":1,"bg":"#f7f4ee","card":"#ffffff","text":"#1b1b1b","hint":"#6b7280","accent":"#8b1d1d","accentText":"#ffffff","secondaryBg":"#efe9df"}
```

Копия в репо: [`portal/public/dao-ui.css.json`](../portal/public/dao-ui.css.json).  
Архив после cutover Pages: `https://pressfreedomcoalition-art.github.io/State_ChuvashiaVolgaBulgaria/dao-ui.css.json` (если Pages без custom domain).

Проверка:

```http
GET https://dao.blc.cab/civic/v1/cache/list?key=params:EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx
```

В списке должен быть `{ "key": "ui.css", "isString": true, "str": "{…}" }`.

Deep-link в ДАО:  
https://dao.blc.cab/#dao=EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx

### 1.2 Домен-зеркало (vtype **29**)

Hub → **«Домен-зеркало ДАО»** → хост: `chv.blc.cab` → За → Finalize.

Ончейн: param `miniapp.domain.chv.blc.cab` (префикс `miniapp.domain.*`).  
После Finalize вход с этого hostname открывает только CHV (`catalogLocked`).

Проверка кеша (после индексации платформой):

```http
GET https://dao.blc.cab/civic/v1/cache/list?key=boundDomain:chv.blc.cab
```

или наличие ключа в `params:`.

### 1.3 Миниапп @bot (vtype **28**)

Hub → **«Миниапп ДАО (@bot)»** → `@bulgaria_state_bot` → За → Finalize.

Param: `miniapp.bot` = `@bulgaria_state_bot`.

В BotFather: Web App URL = `https://chv.blc.cab/` (уже так в деплое бота).

Опционально: Settings → notify → Bot API token на civic-verifier (тот же @bot, что в param).

## 2. DNS + хостинг миниаппа

Платформа: DNS домена направить на **тот же хостинг, что и миниапп** (CNAME/прокси на origin `dao.blc.cab`), чтобы `https://chv.blc.cab` отдавал это приложение. Источник привязки DAO — on-chain param, не отдельный NS.

### Вариант A (предпочтительно у BLC)

В Cloudflare зоне `blc.cab`: запись `chv` как у `dao` (proxied), чтобы отдавался тот же миниапп.

### Вариант B (VPS государства)

1. VPS `137.184.65.1` — nginx reverse-proxy `chv.blc.cab` → `https://dao.blc.cab` (см. [`deploy/nginx-chv-mirror.conf`](../deploy/nginx-chv-mirror.conf), workflow **Deploy CHV DAO mirror**).
2. В Cloudflare `blc.cab`: `chv` → **A** `137.184.65.1` (или CNAME на хост VPS), снять CNAME на `*.github.io`.
3. Certbot для `chv.blc.cab` на VPS.

GitHub Pages **не** должен держать custom domain `chv.blc.cab` (конфликт TLS/DNS).

## 3. Приёмка

| Проверка | Ожидание |
|----------|----------|
| `https://chv.blc.cab` | Официальный UI, сразу CHV, без каталога флота |
| Цвета | paper/linen + maroon accent (`ui.css`) |
| `@bulgaria_state_bot` | WebApp открывает то же зеркало |
| Face ID / голос | В этом же UI (кабинетный `/auth/return` не нужен) |

Скрипт проверки:

```bash
node scripts/verify-bound-domain.mjs
```

## 4. Что осталось в этом репо

- Бот, cache (`cache.chv.blc.cab`), доки, архив статики portal на `*.github.io`
- Тема: `portal/public/dao-ui.css` / `.json`
- Кабинетный SPA больше **не** продукт на apex `chv.blc.cab`
