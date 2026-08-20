# Архитектура контрактов V5 (мин. цена голосований)

Утверждено 2026-07-22: **основной DAO** + **типы веса (отдельные контракты)** + **общее голосование** (отдельно от типов, связано с исполнением в DAO).

## Слои

```text
┌─────────────────────┐
│  DaoContainerV5     │  казна · конфиг · params · daoType
│  (основной DAO)     │  создаёт голосования · исполняет VotingFinished
└─────────┬───────────┘
          │ deploy per poll
          ▼
┌─────────────────────┐         AddWeight / jetton vote
│ ContractLightVoting │◄──────────────────────────────┐
│ (само голосование)  │  опции · tally · пороги ·     │
│                     │  VotingFinished → контейнер   │
└─────────────────────┘                               │
                                                      │
┌─────────────────────┐                               │
│ Weight-source       │  тип = ТОЛЬКО источник веса   │
│  StakeSource        │───────────────────────────────┘
│  (wallet/civic…)    │  апгрейд типа ≠ апгрейд всех DAO
└─────────────────────┘
```

| Контракт | Роль | Когда обновлять |
|----------|------|-----------------|
| `DaoContainerV5` | Казна, настройки, spawn voting, исполнение kind 1–5 | Только если меняется казна/исполнение/storage |
| `ContractLightVotingV1` | Одно голосование (дешёвый голос) | Новые голосования берут код из актуального контейнера; старые не трогаем |
| `ContractStakeSource` (и др. типы) | Вес для стейкинга / … | Только DAO этого типа; монетные DAO не задеты |

## Почему так дешевле

1. **Голос (самый частый):** один перевод (монетное) или одно сообщение `StakeVote`→`AddWeight` (стейкинг) — **без** per-vote receipt/vault/minter.
2. **Создание голосования:** light init, без governance-минтера и per-option vault.
3. **Смена типа:** kind=5 меняет `daoType` + при необходимости деплоит weight-source; казна на месте.
4. **Апгрейд типа веса:** правим `StakeSource` (или будущий wallet-source); не надо миграции всех монетных DAO.

## Типы (`daoType`)

| daoType | Weight-source | Как голосуют |
|---------|---------------|--------------|
| 0 | нет (`weightSource=null`) | jetton transfer → LightVoting |
| 1 | `ContractStakeSource` | stake заранее → `StakeVote` → `AddWeight` |
| 2 | `ContractCivicSource` | verifier `GrantCivicVote` → `CivicCast` → `AddWeight(1)` |
| 3+ | wallet / collateral | позже, тот же разъём `AddWeight` |

Civic details: [`CIVIC_INTEGRATION.md`](./CIVIC_INTEGRATION.md).

## Baseline

1. Фабрика деплоит **V5** (монетное `daoType=0`).
2. Стейкинг = V5 + `daoType=1` + отдельный `StakeSource` (не legacy `StakeDao` silo).
3. Старые v3/v4 → миграторы `MigrateV3V5` / `MigrateV4V5` по голосованию «Обновить DAO».

## Клиент: шаблон UI ↔ версия контейнера

Разные code hash / minor-релизы V5 могут требовать **разный** wire layout одних и тех же опкодов (пример: `CreateVotingReq` — `tonAbi` vs `jettonNotify`). Универсальный клиентский сборщик без привязки к профилю контейнера даёт exit 9 / bounce.

Правило продукта (ТЗ §ФТ-5.1): на каждую **поддерживаемую** версию — свой UI/wire-шаблон; снятие старых версий и чистка веток — только по явному поручению админа.

```text
экран CreateVoting
  → fetch code hash + get_version
  → resolveContainerUiTemplate({ hash, weightKind, major })
  → miniapp/src/ton/uiTemplates/<id>/createVoting.ts
       money | pre-v5 | v5-latest | v5-mid | v5-pre-ton | unknown
  → path / bodyLayout / attachTon только из шаблона
```

Реестр hash→семья: `containerCreatePath.ts`. Профиль CTA: `containerProfile.ts` (`uiTemplateId`).
