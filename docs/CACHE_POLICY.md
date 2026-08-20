# Политика кеша мини-аппа (обязательная)

**Не ломать.** Любое изменение каскада / TTL / групп — только вместе с правкой этого файла, §ФТ-12.1 в [`miniapp/docs/PROJECT_TZ.md`](../miniapp/docs/PROJECT_TZ.md) и канона кода.

| Слой | Путь |
|------|------|
| Канон групп / TTL / триггеры | [`miniapp/src/ton/cachePolicy.ts`](../miniapp/src/ton/cachePolicy.ts) |
| STATIC prefixes | [`miniapp/src/ton/staticCache.ts`](../miniapp/src/ton/staticCache.ts) |
| Ключи | [`miniapp/src/ton/miniappCache.ts`](../miniapp/src/ton/miniappCache.ts) `McKeys` |
| Каскад browser↔server | [`miniapp/src/ton/listLoad.ts`](../miniapp/src/ton/listLoad.ts) |
| Хуки UI | [`miniapp/src/useAutoLoad.ts`](../miniapp/src/useAutoLoad.ts) — TTL из политики; static/semi **без** `setInterval` |
| Сервер | [`civic-verifier/listCache.mjs`](../civic-verifier/listCache.mjs) |
| Правило агента | [`.cursor/rules/cache-policy.mdc`](../.cursor/rules/cache-policy.mdc) |
| ТЗ | [`miniapp/docs/PROJECT_TZ.md`](../miniapp/docs/PROJECT_TZ.md) §ФТ-12.1 |

---

## Цель

1. **Общие переменные** на всех экранах: один `McKeys.params(dao)`, один `votings:`, один `votingState:` — хаб, detail, create, citizenship читают одно и то же.
2. Кеш **долго лежит** и обновляется **только когда данные могли измениться**.
3. **Без спама RPC** / 429 (TonAPI → failover Toncenter).
4. После мутаций — **актуальные** данные (write-through), без invalidate-first «дыры».
5. После ответа сети на TX, которая меняет UI → **сразу** chain warm + POST серверного кеша (`afterTxNetworkOk` / `afterChainWrite` / sync helpers), не ждать следующего poll.
6. Опционально: личные ключи TonAPI/Toncenter на устройстве — ветка чтения без shared server (см. ниже).
7. **`votings:` `endsAt` после Start** — только абсолютный unix из `get_settings` / свежего `readVoting`, либо `0` (unknown). Запрещено invent `now+72h` в `warmVotingStarted` — иначе sticky «ещё 3 дня» при коротком on-chain дедлайне. Active rows: при бюджете soft-deadline **перезаписывать** `endsAt` из `get_settings`, не оставлять stale prev.
8. **После Start TX** — сразу write-through `warmVotingStarted` + unlock UI; подтверждение `get_status` — фон ≤10s. Не блокировать busy на 45s poll под 429.

---

## Каскад чтения

```
UI paint
  → browser mcGet(McKeys.*)     // мгновенно
  → если age < freshTtl политики → STOP (сеть не трогать)
  → listFetch / valueFetch
       → есть user RPC key?
            да  → chain по ключу юзера → browser only (poll не POST’ит shared)
            нет → GET /v1/cache/list     // shared server
                 → miss → chain RPC (app keys) → persistSnapshot (browser + POST)
```

Оба RPC в cooldown → last-good + жёлтый stale tip (+ ссылка «свои ключи» в паспорте).  
Ручной ↻ / `refresh()` / `force: true` обходит fresh TTL (кроме STATIC write-once hit).

### Post-TX write-through (обязательно)

После `sendTransaction` OK, если отображение должно измениться:

1. Дождаться ответа сети (TonConnect resolved).
2. `afterTxNetworkOk` / `afterDaoSettingsChanged` / `votingListSync` + `persistSnapshot` — свежие из chain → browser **и** POST civic-verifier.
3. Запрещено: только local `setState` / invalidate-first без нового snap.

### Личные RPC-ключи

Хранятся только на клиенте (настройки профиля в паспорте). Не слать на civic-verifier.  
Юзер-ключ перекрывает `VITE_TONAPI_KEY` / `VITE_TONCENTER_KEY` для исходящих запросов этого клиента.  
При ошибке чтения / stale — предложить поставить свои ключи (обход общих лимитов).  
UI: глобальный sheet (`UserRpcKeysSheet` + событие `blc:open-user-rpc-keys`) — доступен до unlock паспорта и на не-civic ДАО; дубль в меню гражданства.
---

## Три группы

### 1. STATIC — write-once

Не обновлять по времени. **Не** вешать account LT (голос не выбивает заголовок).

| Prefix | Содержание | Когда RPC |
|--------|------------|-----------|
| `votingMeta:` | title / description / kind / quorum | только miss → `get_metadata` |
| `votingAction:` | DaoAction kind + payload | miss / open detail |
| `daoCreator:` | создатель контейнера | miss |
| `jetton:` | метаданные мастера | miss |
| `appMeta:` | title/icon приложения | miss |
| `containerSides:` | hub / funds / sources | miss / seed с карточки ДАО |

Сервер: `static: true`, TTL ~30д, первый POST побеждает.

### 2. SEMI_STATIC — триггер настроек / апгрейда

На сервере **без LT** до overwrite. Браузер: fresh TTL **24ч**; **нет** таймерного poll (только `refresh()` / settings-событие / DoMigrate).  
Overwrite: `afterDaoSettingsChanged`, bind, DoMigrate, событие `blc:dao-settings`.

| Prefix | Триггер |
|--------|---------|
| `params:` | kind=4 VotingFinished |
| `daoConfig:` | kind=2 |
| `daoEntry:` | rebuild из params после kind=4 |
| `shortUrlDao:` | slug → адрес ДАО (deep-link без полного каталога) |
| `daoBound:` | InitDaoWallet |
| `daoAvatar:` | смена logo |
| `convert:` / `fundSnap:` / `dexLp:` | settings / payout / vault deploy |
| `communityPath:` / `citPaths:` | settings |
| `platGrowth` | settings |
| `daoWeight:` | settings / upgrade |
| `versionOk:` / `daoSemverGate:` | DoMigrate / create |
| `postMigrate:` | civic recovery after patch (paths / PathPay / missing kids) — DoMigrate / settings / bind |
| `orphanStake:` | legacy StakeSource leftover — DoMigrate / stake_tx (empty `[]` is a valid snap) |

### 3. LIVE — триггер + мягкий TTL

Пока экран открыт — редкий poll; обязательно write-through на событии.

| Prefix | Триггеры | TTL |
|--------|----------|-----|
| `votings:` | create / start / finalize / vote / open tab | 45s. Server SWR only while age < 45s; older → chain (Start does not move container LT) |
| `votingState:` | start / vote / finalize / open detail | 12s |
| `voterStake:` | vote / open | 20s |
| `daos:` | create DAO / upgrade | 45s browser; server LT + hard 6ч (SWR; ↻ / create — chain) |
| `children:` | create DAO/voting | 60s |
| `treasury*` | payout / open | 60s |
| `stake:` | stake_tx / cast_vote / open_screen / manual_refresh. **SWR:** сразу server GET (DAO LT не выбивает). Пока открыт стейкинг / create / vote — poll 45–60 с; chain+POST если snap старше `rewarmOlderMs` (2 мин) — активные юзеры греют shared cache. After stake_tx: wait `get_stake` ↑ then `afterTxNetworkOk`. After bind / unread getters: **не** писать my/total=0 поверх last-good | 45s browser; server 24ч без LT |
| `tokenBal:` | stake / vote | 30s |
| `parties:` / `deputy*` / `delStatus:` | party/deputy tx | 60s |
| `dexLp:` | vault deploy / manual refresh | semi (overwrite after deploy) |
| `citStatus:` / `citCount:` / `nftOwn:` | citizenship | 60s |
| `gas*` | topup / vote | 30–120s |
| `daoCard:` | vote/stake/cit | 45s |
| `daoState:` / `codeHash:` / `needsPatch:` / `migKind:` | upgrade / Finish | 60s |
| `boundBot:` / `boundDomain:` | settings | 300s |

---

## Экраны → ключи (единая система)

| Экран | Читает McKeys (общие) | Не дублировать локально |
|-------|----------------------|-------------------------|
| Каталог | `daos:` | — |
| DaoDetail / hub | `params`, `daoEntry`, `daoState`, `codeHash`, `needsPatch`, `daoConfig`, `daoCreator`, `daoCard`, `postMigrate` | не raw `fetchPostMigrateRecovery` в `useEffect` |
| Stake | `stake`, `orphanStake`, `childWalletBound` | не TonAPI-скан на каждый open; create/vote не блокировать, если wallet `stake:` в кеше > 0 |
| Хаб → голосования | `votings:` (+ static `votingMeta`) | не тянуть treasury/deputies |
| Хаб → казна / депутаты / партии | `treasury*`, `dexLp`, `deputyProfiles`, `deputyIncoming`, `citCount`, `parties` | lazy `enabled` |
| VotingDetail | `votingState`, `votingAction`, `voterStake`, `params` | те же params что хаб |
| CreateVoting | `daoConfig`, `daoBound`, `treasury*`, `platGrowth`, `appMeta`, `stake` (staking gate) | — |
| Citizenship / NFT / Gas / Stake | `citPaths`, `citStatus`, `params`, `gas*`, `stake` | — |

Список опросов: **get_status** (+ редкий `get_settings` если нет endsAt).  
`get_results` / options / action — на карточке опроса (или static miss).

---

## Правила разработки

1. Новый снимок → `McKeys` + строка в `cachePolicy.ts` + (static/semi) prefix в `listCache.mjs`.
2. UI только через `useAutoLoad` / `useCachedValue` + `McKeys.*`.
3. После on-chain мутации / ответа сети на TX → write-through (`afterTxNetworkOk`, `persistSnapshot`, `afterDaoSettingsChanged`, `votingListSync`), **не** invalidate-first.
3a. Есть user RPC key → poll читает chain напрямую (без server GET); post-TX всё равно POST’ит shared cache.
4. Не персистить пустые `votings:[]` / `params:[]`.
4a. Массив `votings:` уникален по **адресу контракта опроса** (raw / EQ=UQ). McKeys уже address-scoped; дубли в value схлопывать через `dedupeVotingsByAddress` / `unionMergeVotingsList`. Optimistic create с другим precompute-адресом — удалять при confirm (`removeVotingFromDaoList`).
5. Не держать sticky `migrating:true` при code hash = latest.
5a. `codeHash:` / `factoryLatest:` / `needsPatch:` — **не** sticky; `fetchCodeHash` обязан чтить TTL. Иначе после UpgradeCode фабрики UI вечно пишет «обнови фабрику» и прячет «Патч ДАО → 6.0».
6. UX: одна строка `CacheStatus`, без дубля «читаю…» / «обновляю…».
7. Нельзя «для удобства» опрашивать `params` каждые N секунд — хуки берут TTL из политики и **отключают** `setInterval` для static/semi.
8. `McKeys.containerSides` → prefix `containerSides:` (legacy `sides:` ещё принимается как static).
9. Патч / 6.x / post-migrate / orphan stake — те же McKeys + TTL. Запрещено: `mcDel(daoState)` на каждый open, `setInterval` hash/state кроме Finish-watch, `fetchDaoParam(..., { force: true })` в цикле, TonAPI child-scan на каждый заход в ДАО.
10. `stake:` — SWR с сервера (без LT контейнера). Poll только на открытом стейкинг-UI / create / vote, не на каталоге. Не писать unread 0 поверх last-good.

---

## Проверка (смоук)

1. Аталщи → хаб → голосования: заголовки на месте, одна строка статуса, без 429-шторма.
2. Повторный заход: params/config из кеша, не полный RPC-марафон.
3. kind=4 finalize → short_url / params на хабе без F5.
4. DoMigrate / latest hash → нет ложного «Завершить обновление».
4a. После UpgradeCode фабрики → нет «обнови фабрику» на 5.1 ДАО; видна «Патч ДАО до 6.0».
5. Вкладки treasury/deputies закрыты → нет их RPC на экране голосований.
6. `npx jest tests/cache_policy_coverage.spec.ts tests/static_cache.spec.ts tests/user_rpc_keys_cache.spec.ts tests/list_fetch_no_rewarm.spec.ts tests/daos_cache_swr.spec.ts tests/votings_dedupe_address.spec.ts tests/stake_cache_swr.spec.ts`
