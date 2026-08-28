# Паспорт DAO ↔ кабинет CHV

Официальный контракт deep-link `exportPresent` + API привязки кошелька к паспорту:

**https://github.com/** (локально в репо DAO):

→ `C:\git\dao\docs\CHV_PORTAL_PASSPORT_API.md`

После выката на dao.blc.cab тот же файл в дереве репозитория `dao` / docs.

Кратко:

1. `#exportPresent=1&return=https://chv.blc.cab/auth/return&dao=EQ…&app=CHV%20Cabinet` — Face ID на официальном UI → return с `presentation`.
2. Wallet bind/restore: `POST /civic/v1/passport/backup/wallet*` (см. документ).
3. Partner elig (`#elig=1`) для этого сценария **не** использовать.
