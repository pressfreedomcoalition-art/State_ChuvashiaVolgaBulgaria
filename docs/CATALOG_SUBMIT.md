# Submit @bulgaria_state_bot в каталоги

Бот: https://t.me/bulgaria_state_bot  
App: https://chv.blc.cab  
Privacy: https://chv.blc.cab/privacy.html  
DAO: `EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx`  
Contact: @bulcoin_blc  

Образец: лаунч-план генератора в sibling-репо `dao` → `docs/CATALOG_SUBMIT.md` / `DAO_GEN_LAUNCH_12SEP.md` для `@Dao_gen_bot`.  
Здесь то же + улучшения: безопасный питч (без politics-слов), автоматический submit где API есть, локальный пакет скринов.

---

## Позиционирование (важно)

FindMini и часть каталогов **режут politics**. Не писать в short/full:

`государство`, `citizenship`, `nation`, `Face ID`, `KYC`, «цифровая нация», «Волжская Булгария» как государство.

Публичный угол: **DAO-кабинет на TON** (голоса, казна, членство в Telegram).

---

## Пакет (копипаст)

| Поле | Значение |
|------|----------|
| **Name** | CHV DAO Cabinet |
| **Bot / Start link** | `https://t.me/bulgaria_state_bot` |
| **Short EN** (≤20 words) | On-chain DAO cabinet on TON: votes and treasury in Telegram. |
| **Short RU** | Кабинет ДАО на TON: голосования и казна прямо в Telegram. |
| **Full EN** | CHV DAO Cabinet is a Telegram Mini App on TON. Open on-chain votes, manage a shared treasury, and membership — wallet via TON Connect. Same stack as BulCoin DAO. |
| **Full RU** | Кабинет ДАО CHV — Telegram Mini App на TON. Голосования on-chain, общая казна и членство. Кошелёк через TON Connect. Тот же стек, что у DAO BulCoin. |
| **Tags** | `dao`, `governance`, `ton`, `voting`, `web3`, `miniapp` |
| **TON** | Yes |
| **Languages** | EN, RU |
| **Contact** | @bulcoin_blc |
| **Website** | https://chv.blc.cab |
| **Privacy** | https://chv.blc.cab/privacy.html |

### Скрины / иконка

Локально: `docs/catalog-assets/`

| Файл | Куда |
|------|------|
| `avatar.jpg` / `icon.jpg` | Profile / Icon |
| `shots/01.png` … `05.png` | Screenshots (UI стека BLC, без citizenship-кадра) |

---

## Статус сабмитов (2026-09-23)

| Каталог | Статус | Когда |
|---------|--------|-------|
| **FindMini.app** | Отправлено (`success:1`, HTTP 200) | 2026-09-23 |
| **TelegramHub** | Отправлено (`202`, `success:true`, mode organic) | 2026-09-23 |
| **TON App Center** | API: description ок, multipart → `500` (как у генератора) | 2026-09-23 |
| **TG.app** | Нужен Log In with Telegram (`@bulcoin_blc`) — руки | — |
| **miniapps.me** | Sign in with Telegram — руки | — |
| **miniapps.store** | Пропуск (платное / низкий ROI) | — |
| **AppLink Store** | Письмо отправлено на `hello@miniapplink.online` (SMTPS `144.124.251.27:465`, Exim id `1x9L9l-002CzP-N3`; MX-имя у них NXDOMAIN) | 2026-09-23 |
| **Telegram Apps Center** (`@app_moderation_bot`) | Нужен Analytics SDK на миниаппе — пауза | — |
| **TGFind** | Публичной submit-формы нет | — |
| **coolpac catalog** | PR [#4](https://github.com/coolpac/telegram-mini-apps-catalog/pull/4) | 2026-09-23 |
| Awesome PRs | coolpac выше; erkcet `#81` уже про генератор — отдельный PR на CHV не дублируем | 2026-09-23 |

Внутренние «каталоги» платформы (не marketplace): bound bot vtype 28 / domain 29 / `ui.css` 33 — см. [`BOUND_DOMAIN_CHV.md`](./BOUND_DOMAIN_CHV.md). Флот `daos:` подхватывает CHV как фабричное ДАО автоматически.

---

## Ручные каталоги — пошагово

### A. TG.app

1. https://tg.app/become-creator/ → Log In with Telegram (`@bulcoin_blc`).
2. Submit Mini App: link `https://t.me/bulgaria_state_bot`, Name `CHV DAO Cabinet`.
3. Short + Full EN из пакета; Category Crypto / Tools / DAO.
4. Icon + screenshots из `docs/catalog-assets/`.
5. Submit → модерация ~1 рабочий день.

### B. miniapps.me

1. https://miniapps.me/ → Sign in with Telegram.
2. Вставь `https://t.me/bulgaria_state_bot` + short/full EN.
3. Category: Crypto / Tools / Web3; screenshots `01`…`05`.
4. Contact `@bulcoin_blc` → Submit (ответ часто в понедельник).

### C. AppLink Store

Файл: [`_applink-email-chv.txt`](./_applink-email-chv.txt) → To `hello@miniapplink.online`  
Или боты `@tonidappbot` / `@addapptonid_bot` с тем же пакетом.

### D. TON App Center — позже

https://tonappcenter.com/developer — когда API перестанет отдавать `500` на multipart.

---

## Чем лучше плана генератора

1. Питч сразу без politics-слов (генератор учился на отказах FindMini).
2. FindMini + TelegramHub ушли **автоматом** через API (не только чеклист «руками»).
3. Локальный `docs/catalog-assets/` — повторный submit без охоты за pitch на dao.blc.cab.
4. Чёткое разделение: marketplace ≠ on-chain bound bot/domain.
