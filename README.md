# State_ChuvashiaVolgaBulgaria

Государство Чувашия / Волжская Булгария на BLC DAO.

**Публичный UI:** **https://chv.blc.cab** — **bound domain** (зеркало официального миниаппа), сразу ДАО CHV, тема `ui.css`.  
Не свой React-кабинет на apex: cutover описан в [docs/BOUND_DOMAIN_CHV.md](docs/BOUND_DOMAIN_CHV.md).

- Канон платформы: https://dao.blc.cab  
- API (РФ): `https://dao.won.onl/civic`  
- Telegram: [@bulgaria_state_bot](https://t.me/bulgaria_state_bot) → WebApp `https://chv.blc.cab/`  
- Кеш (опционально): `https://cache.chv.blc.cab`

DAO: `EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx`

## С чего начать

1. [docs/BOUND_DOMAIN_CHV.md](docs/BOUND_DOMAIN_CHV.md) — зеркало домена, голоса 33/29/28, DNS.
2. [docs/CUSTOM_UI_API.md](docs/CUSTOM_UI_API.md) — публичный API (если нужен свой фронт).
3. [docs/OWN_CACHE_SERVER_TZ.md](docs/OWN_CACHE_SERVER_TZ.md) — свой `/v1/cache/*`.
4. `GET https://dao.blc.cab/civic/v1/public` — discovery.

Архив статики portal (тема `dao-ui.css.json`, бывший кабинет) собирается GitHub Pages на `*.github.io`, **без** custom domain `chv.blc.cab`.

## Остальные доки

| Файл | Зачем |
|------|--------|
| [BOUND_DOMAIN_CHV.md](docs/BOUND_DOMAIN_CHV.md) | Зеркало chv.blc.cab |
| [OWN_CACHE_SERVER_TZ.md](docs/OWN_CACHE_SERVER_TZ.md) | Свой `/v1/cache/*` |
| [PARTNER_ELIG.md](docs/PARTNER_ELIG.md) | «Гражданин?» да/нет |
| [CIVIC_INTEGRATION.md](docs/CIVIC_INTEGRATION.md) | Гражданство и civic-голос |
| [CITIZENSHIP_PATHS.md](docs/CITIZENSHIP_PATHS.md) | Пути гражданства |
| [GAS_DEPOSIT.md](docs/GAS_DEPOSIT.md) | Prepaid-газ |
| [ARCHITECTURE_V5.md](docs/ARCHITECTURE_V5.md) | Слои контрактов |
| [CACHE_POLICY.md](docs/CACHE_POLICY.md) | Кеш чтений |
| [USER_ACTION_FLOWS.md](docs/USER_ACTION_FLOWS.md) | Клики официального UI |

Исходники платформы BLC: отдельный репозиторий (не этот).
