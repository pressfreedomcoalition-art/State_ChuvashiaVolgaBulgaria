# State_ChuvashiaVolgaBulgaria

Приватный пакет ТЗ для **кастомного UI** государства (Чувашия / Волжская Булгария).

Свой фронт на своём сервере подключается к боевому API **https://dao.blc.cab/civic** и к любому ДАО (в т.ч. своему). Смартконтракты не дадут сломать казну или нарисовать чужой голос.

## С чего начать

1. [docs/CUSTOM_UI_API.md](docs/CUSTOM_UI_API.md) — основное ТЗ по API (отдать разрабу UI).
2. Живая проверка: `GET https://dao.blc.cab/civic/v1/public`

## Остальные доки

| Файл | Зачем |
|------|--------|
| [PARTNER_ELIG.md](docs/PARTNER_ELIG.md) | «Гражданин?» для своего сайта (да/нет, без права голоса) |
| [CIVIC_INTEGRATION.md](docs/CIVIC_INTEGRATION.md) | Гражданство и civic-голос |
| [CITIZENSHIP_PATHS.md](docs/CITIZENSHIP_PATHS.md) | Пути гражданства |
| [GAS_DEPOSIT.md](docs/GAS_DEPOSIT.md) | Prepaid-газ |
| [ARCHITECTURE_V5.md](docs/ARCHITECTURE_V5.md) | Слои контрактов / типы ДАО |
| [CACHE_POLICY.md](docs/CACHE_POLICY.md) | Кеш чтений (`/v1/cache/list`) |
| [USER_ACTION_FLOWS.md](docs/USER_ACTION_FLOWS.md) | Как те же действия делает официальный UI |

Официальный миниапп: https://dao.blc.cab  
Исходники платформы: отдельный репозиторий (не этот).
