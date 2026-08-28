# Passport API for CHV (mirror)

Канон у DAO: [`C:\git\dao\docs\CHV_PORTAL_PASSPORT_API.md`](file:///C:/git/dao/docs/CHV_PORTAL_PASSPORT_API.md)
и на репо DAO после пуша: `docs/CHV_PORTAL_PASSPORT_API.md`.

Кратко для портала:

1. **Face ID через DAO** — `#exportPresent=1&return=https://chv.blc.cab/auth/return` (уже в Login).
2. **Restore / bind кошельком** — `/v1/passport/backup/wallet*` (клиент в `portal/src/lib/passportWalletBackup.ts`).

Unwrap secret: `SHA-256("blc-wallet-backup|" + bounceableWallet + "|" + nfs)` → base64.

Разрешённые `signData.domain`: `dao.blc.cab`, `dao.won.onl`, `chv.blc.cab`, localhost.

Пока verifier не задеплоен с этими роутами — challenge вернёт 404; кнопки в CHV уже готовы.
