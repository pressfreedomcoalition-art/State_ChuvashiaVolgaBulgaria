# ТЗ для основного DAO (dao.blc.cab / dao.won.onl): Face ID → return presentation в CHV

Нужно кабинету **https://chv.blc.cab** (бот `@bulgaria_state_bot`).

## Зачем

У гражданина уже есть civic-паспорт в официальном миниаппе DAO. На `chv.blc.cab` другое origin — локальный Face ID vault DAO туда не переносится. Нужен сценарий:

1. Пользователь в CHV нажимает «Уже есть гражданство → Face ID (через DAO)».
2. Открывается официальный UI, Face ID разблокирует **тот же** паспорт.
3. DAO **возвращает** готовый `presentation = credential~kb-jwt` на CHV.
4. CHV продолжает авторизацию (кошелёк уже подключён / доподключает) и работает дальше **без** повторных редиректов на каждый клик.

Partner elig (`#elig=1`) даёт только да/нет — **не подходит** (нет presentation → нельзя `/v1/vote`, `/v1/citizenship/status`).

## Контракт deep-link (вход в DAO)

CHV открывает (Telegram `openLink` / браузер):

```
https://dao.won.onl/#exportPresent=1&dao=EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx&return=https%3A%2F%2Fchv.blc.cab%2Fauth%2Freturn&app=CHV%20Cabinet
```

Параметры:

| Параметр | Обязателен | Смысл |
|----------|------------|--------|
| `exportPresent=1` | да | режим «выдать presentation внешнему origin» |
| `return` | да | только `https://` (или localhost в dev) |
| `dao` | желательно | bounceable EQ… государства CHV |
| `app` | нет | подпись в UI («Разрешить CHV Cabinet») |
| `wallet` | нет | подсказка кошелька |

Альтернатива hash/query эквивалентна; в Telegram Mini App DAO также принять `start_param` укороченный вид, если влезет в 64 символа (иначе только полный URL через `openLink`).

## UX в DAO

1. Экран: хост из `return` (например `chv.blc.cab`), текст «Разрешить кабинету получить одноразовый ключ паспорта (presentation)».
2. Face ID / фраза → `createPresentation` как для civic-голоса (`audience=blc-civic-verifier`).
3. Кнопка «Разрешить» → редирект **только после** явного согласия.
4. TTL presentation: как kb-jwt сейчас (короткий); CHV сразу кладёт в свой vault/session и при необходимости делает phrase backup у себя.

## Контракт возврата на CHV

```
https://chv.blc.cab/auth/return?presentation=<url-encoded jwt~kb-jwt>
```

или Telegram:

```
t.me/bulgaria_state_bot?startapp=present_<base64url(JSON)>
```

JSON для `present_`:

```json
{ "presentation": "<credential>~<kb-jwt>", "dao": "EQDD0Z8_…", "nonce": "…" }
```

Формат совместим с уже существующим парсером `presentLink.ts` / `present_=1` в официальном миниаппе — CHV реализует тот же приём.

**Запрещено:** логировать presentation, класть в analytics, оставлять в history дольше необходимого (CHV после чтения чистит query).

## Ошибки

| Ситуация | Поведение DAO |
|----------|----------------|
| Нет паспорта | экран «Создать паспорт» / fail closed, без return с пустым presentation |
| Face ID denied | остаться на DAO, не редиректить |
| `return` не https | 400 / отказ |
| Пользователь «Отмена» | `return?error=denied` без presentation |

## Приёмка

1. С CHV «Face ID через DAO» → Face ID на dao.won.onl → возврат на `/auth/return` с `presentation`.
2. CHV показывает статус гражданина для `EQDD0Z8_…` через `POST /civic/v1/citizenship/status`.
3. Повторный заход в CHV без DAO: локальный vault CHV + Face ID Telegram Mini App CHV-бота.
4. elig-only путь **не** используется для этого сценария.

## Вне скоупа этого ТЗ

Сам UI CHV, TonConnect, оплата PathPay — на стороне кабинета. DAO только: unlock + export presentation + return.
