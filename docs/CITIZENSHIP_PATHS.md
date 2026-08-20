# Пути гражданства (per DAO-государство)

## Модель

| Слой | Публично? | Где |
|------|-----------|-----|
| Политика path’ов (вкл/параметры) | да | `DaoParam` `cit.path.*` + `CitizenshipHub` |
| Оплата / поручительства / доки (факты path) | частично* | `PathPay` / guarantors / docs-attestor |
| **Кто гражданин** | **нет** | только civic-verifier (по passport commit) |
| Голос | nullifier + эфемерный grant | `CivicSource` |
| Публичный «бейдж» на кошельке (опционально) | да | NFT/SBT коллекции языка / государства |

\* Path pay в ledger видно, что кошелёк платил; commit = `sha256(nfs‖dao)` без DID.  
Список граждан не публикуется; NFT на кошельке — это **доказательство пути**, не directory граждан.

## Path ID

| id | смысл | ключи DaoParam (kind=4) | Что проверяется |
|----|--------|-------------------------|-----------------|
| 1 | **pay** — инвестиция / взнос | `cit.path.pay`, `cit.path.pay.amount` | jetton на `PathPay` ≥ minAmount + passportCommit |
| 2 | **подтверждение сообществом** (ключ `lang`) | `cit.path.lang`, `cit.path.lang.quorum` | ≥ N граждан этого же DAO подтвердили passport commit просителя |

Платные услуги подтверждения: UI «Верификаторы» (hub app типа 4) поверх `ContractDeputy` — см. `CONTRACT_HUB_APPS.md` §C. On-chain ключ path не менялся.
| 3 | **docs** — документы / территория | `cit.path.docs.policy` (JSON) | **Sumsub auto KYC only** (doc+selfie+liveness); OCR birth/reg ∈ whitelist. Hash/JPEG upload **не** даёт гражданство |
| 4 | **wallet/NFT** — гражданство другого DAO | `cit.path.wallet.policy` (JSON) | гражданин `sourceDao` и/или NFT `collection` на кошельке |

### Docs policy JSON (`cit.path.docs.policy`)

```json
{
  "enabled": true,
  "mode": "birth_or_reg",
  "birthRegions": ["Чувашия", "Чебоксары"],
  "regRegions": ["Чувашия"],
  "kycFee": {
    "token": "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs",
    "amount": "1620000",
    "recipient": "EQ…казна"
  }
}
```

`mode`: `birth` | `reg` | `birth_or_reg` | `birth_and_reg`.  
`kycFee` (опц.): цена Sumsub — `token` (`TON` или jetton master), `amount` в минимальных единицах, `recipient`.  

**Дефолт UI при добавлении docs:** Sumsub Basic **$1.35**/verification ([pricing](https://sumsub.com/pricing/)) + **20%** = **1.62 USDT** на TON (`EQCxE6mUt…_sDs`, 6 decimals → `1620000`). Recipient = адрес DAO.  

Без fee / amount=0 — проверка бесплатна. Иначе `claim-docs` → `402 need_kyc_fee` → оплата **в казну этого DAO** (memo `blc-kyc:{commit}`) → Sumsub.  
Себестоимость Sumsub с казны государства → `platform.growth.sumsubWallet` (USDT, иначе swap) — см. [PLATFORM_GROWTH.md](PLATFORM_GROWTH.md).  
Регионы сверяются по **OCR** на webhook (см. [SUMSUB_SETUP.md](SUMSUB_SETUP.md)).

### Wallet policy JSON (`cit.path.wallet.policy`)

```json
{
  "enabled": true,
  "sourceDao": "EQ…языковой civic DAO",
  "collection": "EQ…NFT коллекции (опционально)"
}
```

Verifier: `POST /v1/citizenship/claim-wallet` — достаточно гражданства sourceDao **или** NFT коллекции (если оба заданы — достаточно одного).

Новые path’ы = новый id + модуль; DAO включает опросом kind=4 (UI: «Добавить путь» + настройки в том же голосе).

---

## Целевая схема (Чувашия / язык) — канон продукта

Два (или больше) civic DAO, связанные через кошелёк:

```
┌─────────────────────────────┐         NFT/SBT на кошелёк        ┌──────────────────────────────┐
│ DAO «Носители чувашского»   │ ───────────────────────────────► │ DAO «Граждане Чувашии»       │
│ path: lang (кворум поручит.)│                                   │ path: wallet/NFT ← коллекция │
│ граждане получают NFT языка │                                   │   языка  (= путь «по языку») │
└─────────────────────────────┘                                   │ + path: docs (рождение/регистр.)│
                                                                  │ + path: pay (инвестиция)     │
                                                                  └──────────────────────────────┘
```

**Логика «получение по языку» в DAO Чувашии:**

1. Есть отдельное **DAO носителей языка** (своё сообщество/государство).
2. В нём путь **lang**: кворум = число **уже граждан этого языкового DAO**, которые поручились за паспорт просителя.
3. После получения гражданства языкового DAO гражданин получает **NFT (или SBT) этого DAO на кошелёк** — публичный факт «на кошельке есть гражданство языка».
4. В **DAO граждан Чувашии** путь «по языку» — это не повторный кворум поручителей Чувашии, а проверка: **на кошельке есть NFT коллекции языкового DAO**.  
   То есть: *кошелёк = гражданство (языка)* → *NFT = билет в гражданство Чувашии*.

Так «wallet = гражданство» стыкуется с civic: wallet/NFT — источник **пути** в другое государство; civic Чувашии — приватный реестр граждан + голос 1п1г.

**Сейчас в коде:** docs policy + wallet path реализованы (CreateVoting → DaoParam → Hub path 3/4 → verifier claim). Lang-кворум внутри одного DAO; мост в Чувашию = path wallet с `sourceDao` (± NFT). Авто-минт NFT при grant lang — пока вручную/внешняя коллекция.

---

## Path docs — логика и настройки

### Зачем
Подтвердить право по **территории / документам** (рождение или регистрация в регионах конфедерации), без публикации личности on-chain.

### Что делает заявитель
1. Паспорт на устройстве (Face ID → presentation); ФИО/номер пишет **у себя** (local).
2. `claim-docs` → сервер хеширует claims (plaintext не хранит) → Sumsub WebSDK (`pending`, **не** citizen).
3. Webhook `GREEN` (HMAC) → hash(OCR) == hash(device) + регион ∈ whitelist + document/applicant dedupe → grant; в store только `fieldHashes`.
4. `RED` / failed liveness / forgery → `kyc.status=red`, без grant. Retry — снова SDK; **ручной очереди нет**.

**Удалено:** immediate grant по MIME/hash файла (`attestDocumentSubmission` deprecated, не trust root). Без `SUMSUB_*` → `503 kyc_not_configured`.

Share-ссылка: device шлёт disclosure → `verifyDisclosure` по хешам → one-time reveal.

Настройка: [SUMSUB_SETUP.md](SUMSUB_SETUP.md).

### Настройки DAO

| Настройка | Пример | Зачем |
|-----------|--------|--------|
| `cit.path.docs` = 1 | вкл | путь активен на hub |
| `cit.path.docs.policy` JSON | regions + mode | OCR должен попасть в whitelist |

**Правило приёма:** path вкл **и** Sumsub GREEN **и** OCR birth/reg ∈ policy **и** документ не переиспользован другим commit.

---

## Path lang — кворум поручителей

| Настройка | Смысл |
|-----------|--------|
| `cit.path.lang.quorum` = N | нужно **N различных граждан этого же DAO**, каждый со своим паспортом, каждый шлёт endorse за `applicantCommit` просителя |

Ок как задумано: кворум = число владельцев **этого** гражданства, поручившихся за паспорт просителя.  
После кворума → grant `path: lang` в verifier store.

Для сценария Чувашии этот lang обычно живёт в **DAO языка**; в DAO Чувашии «язык» приходит уже как **NFT на кошельке** (path wallet).

---

## Path pay

| Настройка | Смысл |
|-----------|--------|
| `cit.path.pay.amount` | мин. сумма jetton (в base units) на `PathPay` с forward `ClaimCitizenshipPay(passportCommit)`. `num` = amount; `str` = jetton master sidecar (BulCoin / USDT / DAO / other). PathPay on-chain still checks amount only; client pays the chosen master. |

---

## Создание civic DAO (bootstrap)

1. При `init` (daoType=2) Hub и PathPay деплоятся, **все path’ы выключены**.
2. Создатель → паспорт → `POST /v1/citizenship/bootstrap-founder` (кошелёк = `get_creator`) → первый гражданин (`path: founder`).
3. Голосование «Добавить путь» (UI type 6 → kind=4): путь **+ его настройки** в одном голосе.
4. Позже те же ключи — смена настроек / выключение.

## Privacy

- Нет `get_citizens` / публичной map кошелёк→гражданин.
- Гражданство = credential на **passport nfs**, не на TON-адресе.
- TON-адрес — в эфемерном `GrantCivicVote` и (опционально) как holder NFT пути.
- API: `POST /v1/citizenship/status` только с presentation.

## Liquid democracy / Nation funds / Hot-wallet

- Делегирование по passport commit; grant weight = effectiveWeight.
- Privatization / Liberation при civic init.
- Relayer = константа `CIVIC_RELAYER` в `main.tact`.
