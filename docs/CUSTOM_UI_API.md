# ТЗ: кастомный UI ↔ публичный API BLC DAO

Документ для разработчика внешнего интерфейса.  
Официальный миниапп: **https://dao.blc.cab**  
Публичный API: **https://dao.blc.cab/civic**  
Сеть: **TON mainnet**.

Любой может поднять **свой** фронт на **своём** сервере / домене, подключить его к этому API и к **любому** ДАО (своему или чужому). Дизайн — полностью ваш. Ломать казну, фабрику или чужие голоса через API нельзя: запись, которая меняет состояние, проверяется смартконтрактами.

---

## 1. Зачем это есть

| Слой | Кто хостит | Что делает |
|------|------------|------------|
| Контракты (фабрика, контейнер ДАО, голосование, вес) | TON | Единственный источник правды. Отклонят невалидный апгрейд, чужой grant, повторный голос, выплату без решения. |
| civic-verifier | мы (`dao.blc.cab/civic`) | Кеш чтений, паспорт / гражданство, prepaid-газ, relay civic-голоса. |
| UI | кто угодно | Каталог, карточка ДАО, голосования, свой бренд. Может быть наш миниапп **или** ваш сайт. |

Секрет партнёра **не нужен**. Регистрация приложения у нас **не нужна**.

Проверка, что API жив:

```http
GET https://dao.blc.cab/civic/v1/public
```

```http
GET https://dao.blc.cab/civic/health
```

CORS открыт: браузер с `https://ваш-домен` может звать API напрямую (preflight `OPTIONS` → `204`).

---

## 2. Три способа собрать UI

Выберите один. Можно начать с A и дорастить до C.

### A. Только ончейн (без нашего сервера)

Читаете геттеры контейнера / LightVoting через TonAPI или Toncenter.  
Пишете через **TonConnect** с кошелька пользователя.

Хватает для: монетного и стейкинг-ДАО (каталог, список опросов, голос жетоном / стейком, казна).  
Не хватает для: civic Face ID, prepaid-газа, паспорта, «гражданин / не гражданин» без ончейн-бейджа.

### B. Наш API + свой дизайн (рекомендуется)

Браузер или ваш бэкенд → `https://dao.blc.cab/civic`.  
Чтение — `GET /v1/cache/list` (общий кеш, меньше 429).  
Civic / газ / паспорт — наши `POST /v1/…`.  
Ончейн-запись — TonConnect **или** civic relay (если есть presentation).

### C. Свой бэкенд-прокси

Ваш сервер ходит в наш API (CORS не нужен). Фронт говорит только с вами. Удобно, если хотите свой rate-limit / логин.

---

## 3. Привязка к одному ДАО

Кастомный UI почти всегда показывает **один** адрес контейнера (свой ДАО).

1. Зафиксируйте адрес bounceable `EQ…` в конфиге фронта.
2. Все ключи кеша и civic-вызовы — с этим `dao`.
3. Опционально в официальном хабе повесьте ссылку на ваш сайт голосованием kind=4, ключ `app.<id>`, JSON:

```json
{ "t": "site", "r": "https://ui.example", "n": "Наш кабинет", "d": "Кастомный UI", "i": "https://ui.example/icon.png" }
```

`t` = `site` | `miniapp` | `dao`. Это только пункт меню в нашем миниаппе, не допуск к API.

Не путать с **bound domain** (зеркало нашего миниаппа на вашем домене). Bound domain = наш UI. Этот документ — про **ваш** UI.

Deep-link в официальный UI, если надо добрать сложный шаг:

```
https://dao.blc.cab/#dao=EQ…
https://dao.blc.cab/#dao=EQ…&create=1
```

---

## 4. Константы mainnet

| Имя | Значение |
|-----|----------|
| API | `https://dao.blc.cab/civic` |
| UI | `https://dao.blc.cab` |
| Фабрика MasterDAO | `EQDsED76PN976L0jkjTUbvQTIY6lywyAZwe9Lo6zW5b3u97f` |
| Audience паспорта | `blc-civic-verifier` (поле `audience` в `/health`) |

Адреса в ключах кеша — **bounceable** (`EQ…`), как `Address.parse(x).toString({ bounceable: true })`.  
`UQ…` и `EQ…` одного контракта должны сходиться в один ключ.

---

## 5. Чтение состояния

### 5.1. Общий кеш

```http
GET /v1/cache/list?key=votings:EQ…
```

Ответ:

```json
{ "ok": true, "at": 1710000000000, "lts": { "EQ…": "123" }, "value": [ ] }
```

`404` `{ "ok": false, "error": "miss" }` — сходите в сеть сами (TonAPI), затем можете прогреть:

```http
POST /v1/cache/list
Content-Type: application/json

{
  "key": "votings:EQ…",
  "value": [ ],
  "scopeAddrs": ["EQ…контейнер"]
}
```

`static: true` — неизменяемые вещи (мета опроса).  
`semi: true` — настройки / params.  
Live-ключи — с `scopeAddrs` (last_transaction_lt): если контейнер сдвинулся, GET даст miss.

**Правила, чтобы не испортить общий кеш всем:**

- Пишите только то, что реально прочитали из chain.
- Не постите пустые `votings:[]` / `params:[]`, если это не доказанная пустота.
- Свой UI может **вообще не постить** — только GET + свой локальный кеш.

Лимит: порядка 180 GET и 90 POST в минуту с одного IP. `429` `{ "error": "rate" }` — подождите, не долбите chain.

### 5.2. Важные ключи (`McKeys`)

Подставьте bounceable-адрес ДАО / голосования.

| Ключ | Что внутри |
|------|------------|
| `daos:guest` | Каталог карточек (общий). Свой UI может не использовать. |
| `votings:EQ…` | Список опросов ДАО: адрес, статус, title, kind, endsAt |
| `votingMeta:EQ…` | Title / quorum / kind (write-once) |
| `votingState:EQ…` | Live: status, options, results |
| `votingAction:EQ_dao:EQ_vote` | Исполняемое действие (выплата, param, патч, …) |
| `params:EQ…` | DaoParam ключ→значение |
| `daoConfig:EQ…` | Имя, описание, лого, токен |
| `daoState:EQ…` | Версия контейнера / migrating |
| `codeHash:EQ…` | On-chain code hash |
| `daoEntry:v3:EQ…` | Пароль / бан / shortUrl / bound bot |
| `stake:EQ_dao:EQ_wallet` | Стейк (или `:guest` — только totals) |
| `treasury:EQ…` | Казна TON + governance coin |
| `containerSides:EQ…` | Hub / funds / civic source |
| `citPaths:EQ_hub` | Включённые пути гражданства |

Типичный старт своего UI:

1. `GET …/v1/cache/list?key=daoConfig:<dao>`
2. `GET …/key=votings:<dao>`
3. По клику на опрос: `votingState:` + `votingMeta:` + `votingAction:`

Miss → читаете геттеры контракта (как наш миниапп), рисуете UI.

### 5.3. Типы ДАО (`daoType`) — как голосуют

| daoType | Вес | Как отдать голос из кастомного UI |
|---------|-----|-----------------------------------|
| 0 монетное | переведённые жетоны | TonConnect: jetton transfer на адрес опроса |
| 1 стейкинг | застейканные жетоны | сначала stake, потом `StakeVote` / relay `weightCast` |
| 2 civic | 1 человек = 1 (+ делегирование) | `POST /v1/vote` с **presentation** (Face ID / паспорт) |
| 3 / 4 | кошелёк / залог | TonConnect по шаблону контейнера |

Казна и исполнение решений **не зависят** от типа. Тип = только откуда вес.

---

## 6. Запись: кто подписывает

API **не** подписывает транзакции пользователя (кроме civic hot-relay, который сам ограничен контрактом `CIVIC_RELAYER`).

### 6.1. TonConnect (любой тип, кроме silent civic)

На **вашем** origin нужен свой `tonconnect-manifest.json` (имя, иконка, url).  
Пользователь подтверждает tx в кошельке. Контракт принимает или bounce.

Газ attach — как в нашем миниаппе (create voting ~0.12–0.3 TON, finalize ~0.15 TON). Остаток обычно возвращается.

Сборку body (CreateVoting / AddOption / Start / DoMigrate) берите из шаблона версии контейнера. Разные code hash ≠ один и тот же layout (иначе exit 9). Ориентир в репозитории: `miniapp/src/ton/uiTemplates/`.

Если не хотите паковать ячейки — ведите сложные шаги на `https://dao.blc.cab/#dao=EQ…`, а свой UI оставьте витриной и голосом.

### 6.2. Civic silent vote (daoType=2)

Нужен `presentation` = `jwt~kb-jwt` паспорта (Face ID / фраза на устройстве).  
Без presentation civic-голос через API не проходит. Тихого «кошелёк EQ… → гражданин» **нет и не будет**.

```http
POST /v1/vote
Content-Type: application/json

{
  "presentation": "<jwt>~<kb-jwt>",
  "voter": "EQ…кошелёк",
  "voting": "EQ…опрос",
  "dao": "EQ…контейнер",
  "civicSource": "EQ…get_civic_source",
  "optionAddress": "EQ…опция"
}
```

`civicSource` обязан совпасть с ончейн `get_civic_source()` этого ДАО.

Ответы:

| HTTP | code | Смысл |
|------|------|--------|
| 200 | — | relay ушёл |
| 403 | `not_citizen` | нет гражданства в этом ДАО |
| 403 | `nullifier_used` | этим паспортом уже голосовали в этом опросе |
| 402 | `insufficient_gas` / `insufficient_dao_gas` | нет prepaid-газа |
| 400 | `civic_source_mismatch` | не тот source |

Тот же `presentation` — на `/v1/grant` (только право голоса) и `/v1/cast` (после живого grant). Обычно достаточно `/v1/vote` (grant+cast одним relay).

### 6.3. Откуда взять presentation

1. **Свой паспорт в вашем UI** — `POST /v1/passport/issue` + device key + локальный Face ID / фраза (протокол `@blc/coalition`). Тяжело, но полностью автономно.
2. **Редирект на наш миниапп** — пользователь разблокирует паспорт у нас; civic-действия делает там; ваш UI читает итог из chain / кеша.
3. **Partner elig** — только да/нет «гражданин» для **вашего** сайта, без права голосовать за него. См. §8 и [`PARTNER_ELIG.md`](PARTNER_ELIG.md).
4. Deep-link `present_` / `?present=1&presentation=…` — внешний passport-wallet может вернуть готовый presentation на наш миниапп. Свой UI может принять тот же контракт, если сами парсите payload.

Не логируйте `presentation`, `nfs`, seed-фразу.

---

## 7. Справочник публичного API

База: `https://dao.blc.cab/civic`  
Все ответы JSON. Ошибки: `{ "ok": false, "error": "…", "code": "…" }`.

### 7.1. Без авторизации

| Метод | Путь | Зачем |
|-------|------|--------|
| GET | `/health` | liveness, `masterDao`, тариф газа, `audience` |
| GET | `/v1/public` | это ТЗ в машине: capabilities + список путей |
| GET | `/v1/cache/list?key=` | чтение снимка |
| POST | `/v1/cache/list` | прогрев снимка (см. §5.1) |
| GET | `/v1/citizenship/count?dao=` | **число** граждан, без списка и личностей |
| GET | `/v1/platform/kyc-tariff` | тариф docs-KYC |
| POST | `/v1/partner/elig/begin` | сессия «разрешить сайту узнать да/нет» |
| GET | `/v1/partner/elig/session/:id` | мета сессии (без PII) |
| GET | `/v1/partner/elig/consume?code=` | один раз забрать результат |
| GET | `/v1/partner/elig/jwks` | ключи JWT |

### 7.2. Нужен presentation (паспорт пользователя)

| Метод | Путь | Зачем |
|-------|------|--------|
| POST | `/v1/citizenship/status` | свой статус в этом ДАО |
| POST | `/v1/passport/backup` | зашифрованный сейф + фраза |
| POST | `/v1/passport/restore` | восстановить сейф |
| POST | `/v1/gas/status` | личный prepaid |
| POST | `/v1/gas/ticket` | memo `blcgas:…` |
| POST | `/v1/gas/claim` | зачислить депозит |
| POST | `/v1/gas/dao/status` | пул газа ДАО |
| POST | `/v1/gas/dao/ticket` | memo `blcgasdao:…` |
| POST | `/v1/gas/dao/claim` | зачислить в пул ДАО |
| POST | `/v1/grant` | civic grant |
| POST | `/v1/vote` | civic grant+cast |
| POST | `/v1/cast` | civic cast после grant |
| POST | `/v1/finalize` | подвести итог (газ **всегда** с пула ДАО) |
| POST | `/v1/voting/relay` | prepaid create / AddOption / start / weightCast |
| POST | `/v1/migrate` | DoMigrate (патч контейнера), если on-chain пускает |
| POST | `/v1/delegation/set` | делегировать голос |
| POST | `/v1/delegation/revoke` | снять делегирование |
| POST | `/v1/citizenship/claim-docs` | старт Sumsub KYC |
| POST | `/v1/citizenship/claim-wallet` | путь NFT / гражданства-источника |
| POST | `/v1/citizenship/apply` | заявка |
| POST | `/v1/citizenship/bootstrap-founder` | первый гражданин = creator |

`/v1/voting/relay` body:

```json
{
  "presentation": "…",
  "dao": "EQ…",
  "kind": "create",
  "bodyBase64": "<BOC RelayCreateVotingReq>"
}
```

`kind`: `create` | `addOption` | `start` | `weightCast`.  
`bodyBase64` — уже упакованный Relay* с верным opcode; сервер не собирает CreateVoting за вас.

### 7.3. Паспорт без presentation

```http
POST /v1/passport/issue
{ "holderPublicJwk": { … }, "deviceBind": { … } }
```

Выдаёт credential. Presentation пользователь собирает у себя (device key).  
`POST /v1/issue-demo` в бою **выключен** (`403 demo_disabled`).

### 7.4. Закрыто (не для кастомного UI)

Нужен Bearer админа / владельца фабрики. Звать с чужого сайта бесполезно.

- `POST /v1/factory/upgrade`
- `POST /v1/catalog/register`
- `POST /v1/nation`
- `POST /v1/partner/register`
- `GET /v1/partner/apps`
- `GET /v1/notify/subscribers`
- `POST/DELETE /v1/kyc/creds`
- `POST /v1/convert/tick`

---

## 8. «Гражданин?» для своего сайта (без права голоса)

Если кастомный UI — игра / магазин и нужно только да/нет:

1. Открыть  
   `https://dao.blc.cab/#elig=1&return=https%3A%2F%2Fваш.сайт%2Felig&app=My%20App`
2. Юзер видит **ваш хост**, Face ID, кнопку «Разрешить».
3. Редирект на `return?elig=<code>`.
4. Один раз: `GET /civic/v1/partner/elig/consume?code=`

Повтор code → `409 used`. Секрет партнёра не нужен.  
Полный контракт: [`PARTNER_ELIG.md`](PARTNER_ELIG.md).

Это **не** замена `/v1/vote`. JWT с consume не даёт отдать голос.

---

## 9. Prepaid-газ

Civic relay списывает TON с личного депозита паспорта или с пула ДАО (`gas.treasury=1`).

| Действие | Порядок величины |
|----------|------------------|
| grant | ~0.08 TON |
| cast | ~0.1 TON |
| finalize | ~0.08 TON, **всегда пул ДАО** |
| DoMigrate | ~0.8 TON |

1. `POST /v1/gas/ticket` → memo `blcgas:<ticket>`
2. Юзер шлёт TON на `fundAddress` из `/health` (UQ, non-bounce)
3. `POST /v1/gas/claim` `{ presentation, ticket, fromWallet }`

Пул ДАО: `/v1/gas/dao/*`, memo `blcgasdao:`.  
Подробно: [`GAS_DEPOSIT.md`](GAS_DEPOSIT.md).

402 на vote/grant — покажите «пополнить газ», не молчаливый fallback в кошелёк, если газа нет.

---

## 10. Что контракты всё равно не дадут сломать

Даже если кастомный UI шлёт что угодно на API или в TonConnect:

- Чужой civic-голос без валидного presentation / nullifier — нет.
- Повторный голос тем же паспортом в том же опросе — нет (`nullifier_used`).
- Grant на чужой `civicSource` — `civic_source_mismatch`.
- Выплата из казны без прошедшего голосования нужного kind — bounce.
- Апгрейд контейнера на тот же / старый код — клиенты прячут, контракт не «улучшит» ДАО в минус без валидного migrator + голоса.
- `UpgradeCode` фабрики — только owner / наш ops, не публичный API.
- Directory граждан — не отдаём. Только свой статус по presentation или число `count`.

Пишите UI **fail-closed** на опасных кнопках (патч, dissolve, Finish): если версия/hash не прочитались — не показывайте разрушительное действие.

---

## 11. Минимальный кастомный UI (приёмка)

Сделать на своём домене, без форка нашего миниаппа.

1. Страница одного ДАО: имя / лого из `daoConfig:` или геттера.
2. Список опросов из `votings:` (или miss → chain).
3. Карточка опроса: вопрос, опции, статус (`pending` / `active` / `finished`).
4. Голос:
   - daoType 0/1 — TonConnect с вашего origin;
   - daoType 2 — либо `/v1/vote` + presentation, либо кнопка «голосовать на dao.blc.cab».
5. После tx — перечитать `votingState:` / chain. Не обязательно постить в наш кеш.
6. Свой CSS. Наш бренд не обязателен.
7. С чужого origin: `fetch('https://dao.blc.cab/civic/v1/public')` без прокси — `ok: true`, заголовок CORS есть.

Не требуется: каталог всех ДАО, патч флота, KYC-админка, уведомления Telegram.

---

## 12. Ошибки и устойчивость

- `429` — пауза, потом retry. Не открывать N вкладок с poll 1 с.
- Кеш miss — не ошибка продукта, обычный cold path.
- Relay `502` / `relay_vote_failed` — газ обычно возвращается (`gasRefunded: true`); можно повторить или дать подписать `grantTx` кошельком, если API так ответил.
- Свои ключи TonAPI/Toncenter на клиенте — законный обход общих лимитов RPC. На verifier их не присылать.

---

## 13. Связанные документы (если углубляться)

| Тема | Файл |
|------|------|
| Кеш, TTL, ключи | [`CACHE_POLICY.md`](CACHE_POLICY.md) |
| Civic ADR | [`CIVIC_INTEGRATION.md`](CIVIC_INTEGRATION.md) |
| Пути гражданства | [`CITIZENSHIP_PATHS.md`](CITIZENSHIP_PATHS.md) |
| Partner да/нет | [`PARTNER_ELIG.md`](PARTNER_ELIG.md) |
| Газ | [`GAS_DEPOSIT.md`](GAS_DEPOSIT.md) |
| Типы / слои V5 | [`ARCHITECTURE_V5.md`](ARCHITECTURE_V5.md) |
| Клики официального UI | [`USER_ACTION_FLOWS.md`](USER_ACTION_FLOWS.md) |
| Протокол паспорта | `coalition/PROTOCOL.md`, `coalition/INTEGRATION.md` |

Код API: `civic-verifier/server.mjs`.  
Discovery: `GET /v1/public`.

---

## 14. Контакты интеграции

- Боевой API и UI меняются вместе с выкатом на **dao.blc.cab**.
- Ломающие изменения публичных путей не делаем молча: старые URL из §7 живут или получают alias.
- Вопросы по opcode / шаблону create — смотреть hash контейнера и `miniapp/src/ton/uiTemplates/`, не копировать «как в соседнем ДАО другой версии».
