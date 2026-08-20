# Раскрытие civic-гражданства внешнему сайту

Сайт **не** читает directory граждан и **не** спрашивает «гражданин ли кошелёк EQ…».  
Секрет партнёра **не нужен**. «Секрет» — Face ID / фраза паспорта на устройстве, как в civic.

Юзер сам решает: его перекидывают на **https://dao.blc.cab**, он видит **хост сайта** и отдельной кнопкой разрешает раскрыть этому сайту да/нет.

Тихий `wallet → citizen` **нет и не будет**. NFT-бейдж на кошельке — отдельный публичный путь.

## Контракт (prod)

База: `https://dao.blc.cab/civic`

| Кто | Метод | Auth |
|-----|--------|------|
| любой сайт / миниапп | `POST /v1/partner/elig/begin` | нет |
| миниапп | `GET /v1/partner/elig/session/:id` | нет (без PII) |
| миниапп | `POST /v1/partner/elig/attest` | presentation с устройства |
| сайт | `GET /v1/partner/elig/consume?code=` | одноразовый code с возврата |
| сайт | `GET /v1/partner/elig/jwks` | нет (проверка JWT) |

Открыть экран (предпочтительно — полный URL, без startapp-лимита 64):

```
https://dao.blc.cab/#elig=1&return=https%3A%2F%2Fgame.example%2Felig&app=BulCoin%20Game
```

Опционально в том же hash: `wallet=EQ…`, `tg=123`, `scope=civic-grid`.

`return` только `https://` (или `http://localhost` для dev).  
Хост для UI и `aud` JWT берётся из `return`, не из `app` (`app` — ненадёжная подпись).

Сессия Face ID: **15 мин**.  
Attestation / JWT: **30 суток**.

## Флоу

1. Сайт: `openLink` на URL выше (кошелёк/tg из своего кабинета можно дописать в query).
2. На dao.blc.cab: виден хост → Face ID → **«Разрешить сайту game.example»**.
3. Редирект на `return` с одноразовым `?elig=<code>`  
   (для `t.me`: `startapp=eligok_<code>`).
4. Сайт: `GET /civic/v1/partner/elig/consume?code=` — один раз.

Миниапп сам вызывает `begin`, если в ссылке только `return` (без заранее созданной сессии).

## Consume

```json
{
  "ok": true,
  "eligible": true,
  "via": "civic",
  "scope": "civic-grid",
  "dao": "EQ…",
  "wallet": "EQ…",
  "telegramId": 123456789,
  "host": "game.example",
  "exp": 1776,
  "token": "eyJ…"
}
```

Повтор того же `code` → `409 used`.  
Нет `nfs`, `presentation`, `commit`.

`scope: "civic-grid"` — любое живое гражданство в verifier.  
`daos: ["EQ…"]` в `begin` — сузить.

Сайт сверяет `wallet` / `telegramId` со своим кабинетом, если передавал их в ссылке.

JWT (`token`): `iss=https://dao.blc.cab/civic`, `aud` = origin из `return`, `exp` = 30 суток. Ключи: `GET /v1/partner/elig/jwks`.

## Begin (если сайт создаёт сессию сам)

```http
POST /civic/v1/partner/elig/begin
```

```json
{
  "returnUrl": "https://game.example/elig",
  "app": "bulcoin-game",
  "wallet": "EQ…",
  "telegramId": 123456789,
  "scope": "civic-grid"
}
```

Ответ: `{ "ok": true, "sessionId", "nonce", "host", "expiresAt" }`.  
Тогда можно открыть `https://dao.blc.cab/#elig=<sessionId>` — хост всё равно с `returnUrl`.

## Приёмка

- Гражданин, Face ID + «Разрешить» этому хосту → `eligible: true`.
- Только паспорт, без grant → `eligible: false`.
- Кошелёк сам по себе, без Face ID и без кнопки → civic не подтверждается.
- Чужой / повторный code → 404/409, не да/нет.
