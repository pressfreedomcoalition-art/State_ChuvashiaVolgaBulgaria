# Bound domain: chv.blc.cab → официальный DAO (CHV)

Цель: `https://chv.blc.cab` отдаёт **официальный миниапп** BLC, сразу государство CHV, без каталога флота, с темой `ui.css`. Свой React-кабинет с apex снят.

DAO: `EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx`  
Канон UI: https://dao.blc.cab · зеркало РФ: https://dao.won.onl  
Бот: `@bulgaria_state_bot`

## 0. IP `137.184.65.1`

Это **VPS государства** (DigitalOcean), куда уже смотрит `cache.chv.blc.cab`.  
На нём же поставлен nginx reverse-proxy для зеркала миниаппа на `chv.blc.cab` (workflow **Deploy CHV DAO mirror**).

В Cloudflare для `chv` нужна запись **A → `137.184.65.1`** (сейчас ещё CNAME на GitHub Pages — из‑за этого apex 404).

## 1. Голосования (ончейн, kind=4) — чувашские названия

Создание TX подписывается **кошельком** (агент без ключа создать не может).  
Ниже — готовые формы: открой ссылку → заполни поля как указано → Create → Start.  
Потом ты: **За** → Finalize.

Готовые payload’ы: [`portal/public/bound-votings.json`](../portal/public/bound-votings.json).

### 1.1 Тема экрана (vtype **33**, ключ `ui.css`)

| | |
|--|--|
| **Ят** | Экрана сӑнӗ — CHV тӗсӗсем |
| **Ҫырса кӑтартни** | Официаллӑ миниапп экране чӑваш кабинечӗн тӗсӗсемпе килӗштерет (paper, maroon, linen). Параметр ui.css. |
| **Тӗс JSON** | см. ниже (в форме vtype 33 — палитра / JSON) |

```json
{"v":1,"bg":"#f7f4ee","card":"#ffffff","text":"#1b1b1b","hint":"#6b7280","accent":"#8b1d1d","accentText":"#ffffff","secondaryBg":"#efe9df"}
```

Создать:  
https://dao.blc.cab/#dao=EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx&create=1&vtype=33

### 1.2 Домен-зеркало (vtype **29**)

| | |
|--|--|
| **Ят** | chv.blc.cab — домен-тӗлӗк |
| **Ҫырса кӑтартни** | chv.blc.cab урлӑ кӗрсен тӳрех ку патшалӑх ДАОӗ уҫӑлать, платформа каталогӗ ҫук. Параметр miniapp.domain.chv.blc.cab. |
| **Хост** | `chv.blc.cab` |

Создать:  
https://dao.blc.cab/#dao=EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx&create=1&vtype=29

### 1.3 Миниапп @bot (vtype **28**)

| | |
|--|--|
| **Ят** | @bulgaria_state_bot миниаппӗ |
| **Ҫырса кӑтартни** | Телеграм бот @bulgaria_state_bot ку ДАОна ҫыхӑнтарать. WebApp URL: https://chv.blc.cab/ |
| **Бот** | `@bulgaria_state_bot` |

Создать:  
https://dao.blc.cab/#dao=EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx&create=1&vtype=28

В BotFather Web App URL уже `https://chv.blc.cab/` (деплой бота).

После Finalize — проверка:

```bash
node scripts/verify-bound-domain.mjs
```

## 2. DNS + хостинг миниаппа

Платформа: DNS домена направить на **тот же хостинг, что и миниапп** (CNAME/прокси на origin `dao.blc.cab`), чтобы `https://chv.blc.cab` отдавал это приложение. Источник привязки DAO — on-chain param, не отдельный NS.

### Вариант A (предпочтительно у BLC)

В Cloudflare зоне `blc.cab`: запись `chv` как у `dao` (proxied), чтобы отдавался тот же миниапп.

### Вариант B (VPS государства) — уже подготовлен в этом репо

Nginx reverse-proxy на VPS уже ставится workflow **Deploy CHV DAO mirror**  
([`deploy/nginx-chv-mirror.conf`](../deploy/nginx-chv-mirror.conf)).

**Срочно (иначе apex 404):** в Cloudflare зоне `blc.cab` запись `chv`:

| Было | Нужно |
|------|--------|
| CNAME → `pressfreedomcoalition-art.github.io` | **A** → `137.184.65.1` (прокси CF можно выключить / DNS only) |

Затем на VPS (или снова `workflow_dispatch` Deploy CHV DAO mirror) — certbot выпустит TLS.

GitHub Pages custom domain `chv.blc.cab` уже снят (`cname: null`).

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
