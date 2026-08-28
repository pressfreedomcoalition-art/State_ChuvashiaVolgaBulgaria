# API для кабинета Чувашии (chv.blc.cab) — паспорт DAO

Канон официального UI: **https://dao.blc.cab** (зеркало `dao.won.onl`).  
Civic verifier: тот же origin, префикс `/v1/…` (у CHV часто прокси `/civic/v1/…`).

Документ для портала: deep-link **exportPresent** (Face ID → return presentation) + **привязка кошелька** для восстановления того же паспорта.

Связанное ТЗ заказчика: `State_ChuvashiaVolgaBulgaria/docs/DAO_PRESENT_RETURN_TZ.md`.

---

## 1. Face ID → return presentation (`exportPresent`)

Partner elig (`#elig=1`) даёт только да/нет — **не** подходит для `/v1/citizenship/status` и `/v1/vote`. Нужен полный `presentation = credential~kb-jwt`.

### 1.1. Deep-link в DAO

CHV открывает (Telegram `openLink` / браузер):

```
https://dao.blc.cab/#exportPresent=1&dao=EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx&return=https%3A%2F%2Fchv.blc.cab%2Fauth%2Freturn&app=CHV%20Cabinet
```

| Параметр | Обязателен | Смысл |
|----------|------------|--------|
| `exportPresent=1` | да | режим выдачи presentation |
| `return` | да | только `https://` (или `http://localhost` в dev) |
| `dao` | желательно | bounceable EQ… государства CHV |
| `app` | нет | подпись в UI |
| `wallet` | нет | подсказка (не обязательна для export) |

Эквивалентны hash и query. Короткий `startapp` — только если JSON влезает в 64 символа (`exportPresent_<base64url>`).

### 1.2. UX в DAO

1. Экран с хостом из `return` (например `chv.blc.cab`).
2. Face ID / фраза / **восстановление кошельком** — тот же паспорт; **новый выпуск в этом режиме запрещён** (fail-closed).
3. Явная кнопка «Разрешить» → редирект только после согласия.
4. Отмена → `return?error=denied` без presentation.

### 1.3. Возврат на CHV

```
https://chv.blc.cab/auth/return?presentation=<url-encoded credential~kb-jwt>&dao=EQ…&nonce=…
```

или Telegram:

```
t.me/bulgaria_state_bot?startapp=present_<base64url(JSON)>
```

```json
{ "presentation": "<credential>~<kb-jwt>", "dao": "EQDD0Z8_…", "nonce": "…" }
```

Формат совместим с `presentLink.ts` / `present_=1` официального миниаппа.

**Запрещено:** логировать presentation, analytics, оставлять в history — после чтения чистить query.

### 1.4. Приёмка

1. CHV «Face ID через DAO» → Face ID на dao.blc.cab → `/auth/return` с `presentation`.
2. CHV: `POST …/v1/citizenship/status` с этим presentation для DAO `EQDD0Z8_…`.
3. Повторный заход в CHV без DAO: локальный vault CHV.
4. elig-only **не** используется для этого сценария.

---

## 2. Привязка кошелька к паспорту (restore как seed)

Кошелёк **не** заменяет Face ID на том же устройстве. Это **якорь восстановления** того же `nfs` на другом устройстве/в кабинете: challenge → TonConnect `signData` → скачать ciphertext → unwrap локально.

Анонимность: лучше отдельный «гражданский» кошелёк. Официальный UI один раз предлагает bind после обновы (можно отказаться).

### 2.1. Статус бэкапов

`POST /v1/passport/backup/status`

```json
{ "presentation": "<credential>~<kb-jwt>" }
```

Ответ:

```json
{
  "ok": true,
  "hasPhraseBackup": true,
  "hasWalletBackup": false,
  "walletBound": null
}
```

### 2.2. Challenge (bind или restore)

`POST /v1/passport/backup/wallet/challenge`

**Bind** (нужен presentation):

```json
{
  "purpose": "bind",
  "wallet": "EQ…",
  "presentation": "<credential>~<kb-jwt>"
}
```

**Restore** (кошелёк уже привязан):

```json
{
  "purpose": "restore",
  "wallet": "EQ…"
}
```

Ответ:

```json
{
  "ok": true,
  "challengeId": "…",
  "text": "BLC passport wallet backup\npurpose: bind\nchallenge: …\nwallet: EQ…",
  "wallet": "EQ…"
}
```

Клиент: `tonConnectUI.signData({ type: 'text', text, network: '-239', from })`.

### 2.3. Bind

`POST /v1/passport/backup/wallet`

```json
{
  "presentation": "<…>",
  "ciphertext": "<base64 AES-GCM>",
  "salt": "<base64>",
  "wrapAlg": "pbkdf2-aes-gcm-v1",
  "challengeId": "…",
  "walletStateInit": "<base64 BoC from TonConnect account>",
  "signData": {
    "signature": "<base64>",
    "address": "0:…",
    "timestamp": 1710000000,
    "domain": "dao.blc.cab",
    "payload": { "type": "text", "text": "<exact challenge text>" }
  }
}
```

Unwrap-секрет на клиенте: `SHA-256("blc-wallet-backup|" + bounceableWallet + "|" + nfs)` → base64 (как PBKDF2 password в существующих backup helpers).

Один кошелёк → один `nfs`. Чужой паспорт на тот же addr → `409 wallet_bound`.

Разрешённые `signData.domain`: `dao.blc.cab`, `dao.won.onl`, `chv.blc.cab`, localhost (+ `SIGN_DATA_ALLOWED_DOMAINS`).

### 2.4. Restore

`POST /v1/passport/restore/wallet`

```json
{
  "challengeId": "…",
  "walletStateInit": "<base64>",
  "signData": { "…": "как выше, purpose restore" }
}
```

Ответ: `{ ok, ciphertext, salt, wrapAlg, nfs, wallet }` — клиент decrypt + `savePassportVault`.

### 2.5. Unbind

`POST /v1/passport/backup/wallet/unbind`

```json
{ "presentation": "<…>", "wallet": "EQ…" }
```

### 2.6. Ошибки proof

| code | смысл |
|------|--------|
| `bad_domain` | domain не в allowlist |
| `stale_timestamp` | подпись старше ~15 мин |
| `text_mismatch` | подписан не challenge text |
| `bad_signature` / `no_public_key` | не прошла проверка Ed25519 / stateInit |
| `wallet_mismatch` | адрес подписи ≠ challenge wallet |
| `not_found` | нет слота на этом кошельке |

Кошелёк должен поддерживать TonConnect **Sign Data (text)**.

---

## 3. Что остаётся на стороне CHV

| Задача | Где |
|--------|-----|
| Кнопка «Face ID через DAO» → openLink exportPresent | Login CHV |
| `/auth/return` принять presentation, sessionStorage, чистить URL | уже в portal |
| Опционально: свой bind/restore через `/v1/passport/backup/wallet*` с domain `chv.blc.cab` | кабинет |
| TonConnect, PathPay, UI кабинета | CHV |

DAO обязан: unlock + export presentation + return; wallet-bind API + UI nudge в официальном миниаппе.

---

## 4. Быстрые ссылки кода

| Что | Путь |
|-----|------|
| Parse / return URL | `miniapp/src/ton/exportPresent.ts` |
| Экран export | `miniapp/src/components/ExportPresentView.tsx` |
| Client bind/restore | `miniapp/src/ton/passportBackup.ts` |
| Server endpoints | `civic-verifier/server.mjs` (`/v1/passport/backup/wallet*`) |
| signData verify | `civic-verifier/tonConnectSignData.mjs` |
| Store | `coalition/src/passportBackup.mjs` |
