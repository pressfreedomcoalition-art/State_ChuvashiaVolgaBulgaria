# Prepaid gas — civic hot-wallet

Юзер пополняет **общий** civic hot-wallet. Кредит привязан к паспорту (`nfs`), не к DAO.

## Что покрывает / не покрывает

**Покрывает** (списание с личного депозита **или** пула `gas.treasury`, см. правила ниже):
- relay `GrantCivicVote` — `POST /v1/grant` (~0.08 TON, `GAS_GRANT_DEBIT_NANO`);
- relay `RelayCivicCast` (через MasterDAO) — `POST /v1/cast` (~0.1 TON, `GAS_CAST_DEBIT_NANO`);
- relay `DoMigrate` — `POST /v1/migrate` (~0.8 TON, `GAS_MIGRATE_DEBIT_NANO`);
- relay `finalize` — `POST /v1/finalize` (~0.08 TON, `GAS_FINALIZE_DEBIT_NANO`) — **всегда пул ДАО**.
  Hot/wallet attach к LightVoting — `0.15` TON (`FINALIZE_GAS_TON`); на release≥1 лишнее возвращается сдачей.
- relay create / AddOption / start / stake|wallet|collateral cast — `POST /v1/voting/relay` (6.1; MasterDAO `Relay*Req`).

**Не покрывает** (TonConnect с кошелька):
- money jetton-cast / jetton CreateVoting;
- citizenship / party / fund topup-claim / create DAO;
- `old-migrate` (legacy) — только кошелёк создателя/фабрики.

**Отдельно (ops, не prepaid):**
- Factory `UpgradeCode` — `POST /v1/factory/upgrade`, газ с баланса civic hot, **без** debit личного/DAO prepaid.

Депозит — **не** баланс `DaoContainer` и не «вся казна» ДАО.

## Кто платит: личный vs пул ДАО

| Операция | `gas.treasury` выкл | `gas.treasury=1` |
|----------|---------------------|------------------|
| grant, cast, DoMigrate | личный prepaid | пул ДАО |
| finalize | **всегда пул ДАО** | **всегда пул ДАО** |

Итог голосования — общее действие ДАО: не списывается с личного депозита (`finalize-always-treasury`).

## Зачем

- Hot-wallet платит on-chain relay — меньше подписей в кошельке.
- Депозит **не называет DAO**: один танк на все государства (личный prepaid).
- Create и часть admin lifecycle остаются с кошелька (антиспам / admin=sender).

## Флоу

1. Miniapp → `POST /v1/gas/ticket` → memo `blcgas:<ticket>`.
2. Перевод TON на `fundAddress` (UQ) **с этим memo** (кнопка «Пополнить»).
3. `POST /v1/gas/claim` `{ presentation, ticket, fromWallet }` — зачисляет tx с memo.
4. Если кошелёк (Telegram) сорвал comment: после **одного** успешного memo-перевода с того же кошелька сервер **дозачисляет** недавние «голые» входящие (до 48 ч).
5. `/v1/grant`, `/v1/cast`, `/v1/migrate`, `/v1/finalize` списывают тариф **до** on-chain; при ошибке — refund.

Ручной перевод без memo сам по себе **не** зачисляется. Нужен хотя бы один перевод через кнопку с того же кошелька.

## API

| Метод | Назначение |
|-------|------------|
| `POST /v1/gas/status` | баланс |
| `POST /v1/gas/ticket` | выдать memo `blcgas:…` |
| `POST /v1/gas/claim` | зачислить депозит (+ backfill naked) |
| `POST /v1/grant` | grant + debit |
| `POST /v1/cast` | RelayCivicCastReq + debit |
| `POST /v1/finalize` | finalize + **всегда debit пула ДАО** |
| `POST /v1/migrate` | DoMigrate + debit (личный или пул) |
| `POST /v1/factory/upgrade` | UpgradeCode с hot (ops, без prepaid debit) |
| `GET /health` → `gas` | адрес + тарифы |

## Env

```bash
# GAS_GRANT_DEBIT_NANO=80000000
# GAS_CAST_DEBIT_NANO=100000000
# GAS_FINALIZE_DEBIT_NANO=80000000
# GAS_MIGRATE_DEBIT_NANO=800000000
# PLATFORM_OWNER=UQ…
# PLATFORM_OWNER_TG_IDS=123,456
# MASTER_V5_CODE_PATH=../build/main_MasterDAO.code.boc
# CIVIC_ADMIN_SECRET=…   # Bearer for agent автовыкат
```

## Privacy

Публично: «кошелёк W отправил TON на civic hot» (без имени DAO).  
Не публично: в каком DAO потом голосует passport, связанный с этим кредитом.

## Опция: gas с казны (`gas.treasury`)

По умолчанию выкл. Голосованием (kind=4, ключ `gas.treasury=1`) ДАО включает prepaid-пул для **grant / cast / DoMigrate**:

1. `POST /v1/gas/dao/ticket` → memo `blcgasdao:<ticket>`
2. Перевод TON на civic hot (обычно с ops/казны)
3. `POST /v1/gas/dao/claim` — кредит пула ДАО
4. При включённом параметре grant/cast/migrate списывают пул ДАО; **finalize** списывает пул всегда (даже если флаг выкл — пул должен быть пополнен).
