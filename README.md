# State_ChuvashiaVolgaBulgaria

Кастомный UI государства (Чувашия / Волжская Булгария): только статика, без серверных секретов.

Публичный фронт (GitHub Pages, без IP VPS): **https://chv.blc.cab**  
API для РФ: `https://dao.won.onl/civic` (без Cloudflare).

Свой фронт на своём сервере подключается к боевому API **https://dao.blc.cab/civic** и к любому ДАО (в т.ч. своему). Смартконтракты не дадут сломать казну или нарисовать чужой голос.

## С чего начать

1. [docs/CUSTOM_UI_API.md](docs/CUSTOM_UI_API.md) — основное ТЗ по API (отдать разрабу UI).
2. [docs/OWN_CACHE_SERVER_TZ.md](docs/OWN_CACHE_SERVER_TZ.md) — **свой сервер кеша**, независимо от shared `dao.*/civic`.
3. Живая проверка платформы: `GET https://dao.blc.cab/civic/v1/public`

## Остальные доки

| Файл | Зачем |
|------|--------|
| [OWN_CACHE_SERVER_TZ.md](docs/OWN_CACHE_SERVER_TZ.md) | Поднять свой `/v1/cache/*` (копия listCache из `dao`) |
| [PARTNER_ELIG.md](docs/PARTNER_ELIG.md) | «Гражданин?» для своего сайта (да/нет, без права голоса) |
| [CIVIC_INTEGRATION.md](docs/CIVIC_INTEGRATION.md) | Гражданство и civic-голос |
| [CITIZENSHIP_PATHS.md](docs/CITIZENSHIP_PATHS.md) | Пути гражданства |
| [GAS_DEPOSIT.md](docs/GAS_DEPOSIT.md) | Prepaid-газ |
| [ARCHITECTURE_V5.md](docs/ARCHITECTURE_V5.md) | Слои контрактов / типы ДАО |
| [CACHE_POLICY.md](docs/CACHE_POLICY.md) | Кеш чтений (`/v1/cache/list`) |
| [USER_ACTION_FLOWS.md](docs/USER_ACTION_FLOWS.md) | Как те же действия делает официальный UI |

Официальный миниапп: https://dao.blc.cab  
Исходники платформы: отдельный репозиторий (не этот).
