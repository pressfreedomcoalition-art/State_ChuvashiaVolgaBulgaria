# Civic / blockchain citizenship — ADR (фаза 2)

Дата: 2026-07-22 · Статус: **local identity core** (`@blc/coalition`)

## Архив / upstream

`https://github.com/refederation/coalitionCore` — **недоступен** (404 всем аккаунтам).
Аккаунт `refederation`: 0 public repos. Wayback CDX / availability — **0 снимков**.
Реализовано с нуля по разбору Mira + этот ADR → пакет [`coalition/`](../coalition/).

## Решение

Голосование и казна остаются в BLC DAO на TON. Ядро даёт **eligibility + nullifier**, не вторую урну.

| Слой | Контракт / сервис | Роль |
|------|-------------------|------|
| DAO | `DaoContainerV5` daoType=2 | казна, spawn LightVoting, исполнение |
| Voting | `ContractLightVotingV1` weightSource=CivicSource | tally, VotingFinished |
| Weight | `ContractCivicSource` v3 | Grant(+nullifier+weight) → Cast → AddWeight(weight) |
| Off-chain | `coalition/` + `civic-verifier/` | presentation → nullifier → GrantCivicVote |

## Протокол (v0.1)

См. [`coalition/PROTOCOL.md`](../coalition/PROTOCOL.md), [`coalition/INTEGRATION.md`](../coalition/INTEGRATION.md).

1. Issuer выдаёт membership JWT (`nfs`, `mroot`, `cnf.jwk`).
2. Holder → `presentation = jwt~kb-jwt`.
3. Verifier: подписи, Issuer/Revocation/MembershipRoot, `nullifier = SHA256(blc-vote-v1||nfs||votingId)`.
4. On-chain: `GrantCivicVote{nullifier,weight}` (один раз) → `CivicCast` → вес = weight (delegation off-chain).

Делегирование: `/v1/delegation/*`. Фонды нации: getters `get_privatization_fund` / `get_liberation_fund`, claim `/v1/funds/claim-privatization`.

## Цена

Создание civic DAO = **5×** обычный `dao_fee`. Owner/admin — free.

## Деплой (часть dao.blc.cab)

Push в `main` → Actions деплоит:
1. miniapp dist → `/var/www/dao.won.onl`
2. `civic-verifier` + `coalition` → `/var/www/dao-civic`
3. nginx `/civic/` → `127.0.0.1:8787`
4. systemd `dao-civic-verifier`

Mini-app по умолчанию: `VITE_CIVIC_VERIFIER_URL=/civic/v1/grant` (same-origin).

Ончейн: `CivicSource.verifier = MasterDAO`; сервис шлёт `RelayCivicGrant` (owner/admin фабрики).

## Env / secrets

| Где | Ключ | Смысл |
|-----|------|--------|
| GitHub Actions | `CIVIC_VERIFIER_MNEMONIC` | опционально: фиксирует адрес hot-wallet (иначе сервер генерирует свою и хранит в `data/verifier-wallet.json`). Должен совпадать с `CIVIC_RELAYER` в `main.tact` **или** быть mnemonic владельца MasterDAO |
| Server `/var/www/dao-civic/.env` | пишется CI | `VERIFIER_MNEMONIC`, `MASTER_DAO`, … |
| Miniapp build | default `/civic/v1/grant` | override через `VITE_CIVIC_VERIFIER_URL` |

Локально: `npm run install:all` → `npm run dev:civic` + `cd miniapp && npm run dev` (vite proxy `/civic`).

## Пути гражданства

См. [`CITIZENSHIP_PATHS.md`](./CITIZENSHIP_PATHS.md): отдельные path-контракты/модули, активация `cit.path.*` голосованием, **без публичного реестра граждан**.

## Следующие шаги

1. ✅ Verifier сам генерирует hot-wallet (`data/verifier-wallet.json`), адрес отдаёт `/civic/health`. Адрес зашивается в код как `CIVIC_RELAYER` (константа в `main.tact`) — **не через AddAdmin**: `receive(RelayCivicGrant)` пускает только `CIVIC_RELAYER` или `self.owner`. Owner один раз делает UpgradeCode фабрики с этим адресом внутри.
2. ✅ Deploy (CI уже поднимает verifier на `/civic/`).
3. ✅ Deep-link `present_`/`present=1` из внешнего passport wallet — `miniapp/src/ton/presentLink.ts` (hash/query/Telegram `start_param`), нет demo-режима (`/v1/issue-demo` отдаёт 403 `demo_disabled`; паспорт только через реальную биометрию устройства).
4. ZK docs-attestor / BBS+ — усиление privacy.
