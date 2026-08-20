# Действия юзера → сервер / контракт (клик-флоу)

Канон: [https://dao.blc.cab](https://dao.blc.cab).  
Кеш: [`CACHE_POLICY.md`](CACHE_POLICY.md). Write-through после TX, не invalidate-first.

Легенда: **R** чтение, **W** on-chain TX, **S** civic-verifier, **C** write-through кеша.

---

## Узкие места загрузки (что было дорого)

| Шаг | Почему тормозило | Что сделано |
|-----|------------------|--------------|
| Каталог ДАО | `daos:` всегда шёл в chain + poll 12 с | SWR с сервера; poll = 45 с |
| GET `/v1/cache/list` | TonAPI LT на каждый GET | мемо LT 10 с + rate-limit |
| Soft TTL 45 с при 429 | все клиенты miss → шторм | soft TTL 120 с |
| Каталог без открытого ДАО | sticky `votings:` poll 45 с | poll только при открытом ДАО |
| Карточка ДАО | interval 8 с state/hash + `mcDel` | poll только если нужен Finish |
| Civic children | interval 20 с всегда | poll только если дети неполные |
| Version gate | лишний `get_version`+hash | skip если catalog/sticky уже ≥5.1 |
| Factory latest | TTL 0 на каждый open | политика 120 с |
| VotingDetail | poll 5–8 с + heal 5 с | 12 с; heal стоп после resolve |
| Convert watch | POST на каждый poll статуса | раз за сессию на ДАО |

---

## 1. Каталог

| # | Действие | Куда нажать | Сеть | Кеш |
|---|----------|-------------|------|-----|
| 1.1 | Открыть каталог | вход / «‹ к списку» | GET `/v1/cache/list` `daos:` (SWR); chain только miss/↻ | `daos:` |
| 1.2 | Обновить каталог | ↻ | force chain `fetchOnchainDaos` + POST | `daos:` C |
| 1.3 | Открыть ДАО | карточка | `votings:` + хуки карточки | `votings`, `daoState`, `params`… |
| 1.4 | Создать ДАО | «Создать» | навигация | — |

**Клики 1.1:** Connect (если нет кошелька) → список карточек. Повторный заход — из browser/server, без factory-scan.

---

## 2. Создать ДАО

| # | Действие | Куда нажать | Сеть | Кеш |
|---|----------|-------------|------|-----|
| 2.1 | Стейкинг | тип → имя/токен → Создать | MasterDAO `CreateStakeDao` **W** | `daos`, `children` C |
| 2.2 | Civic | тип civic → Создать | `CreateCivicDao` / jetton **W** | то же |
| 2.3 | Wallet / collateral | тип → Создать | `CreateWalletDao` / `CreateCollateralDao` **W** | то же |
| 2.4 | Bind stake child | авто после 2.1 | `BindChild` **W** | `childWalletBound` C |

**Клики 2.2:** Каталог → Создать → civic → поля → Создать → TonConnect.

---

## 3. Карточка ДАО / хаб

| # | Действие | Куда нажать | Сеть | Кеш |
|---|----------|-------------|------|-----|
| 3.1 | Открыть хаб | карточка civic | `params`, `daoConfig` (semi, без poll) | static/semi |
| 3.2 | Вкладка голосования | «Голосования» | `votings:` 45 с | `votings` |
| 3.3 | Казна / депутаты / партии | плитка секции | lazy getters | `treasury*`, `deputy*`, `parties` |
| 3.4 | Патч ДАО | «Патч ДАО до 6.2» | навигация create vtype=3 | — |
| 3.5 | Finish / DoMigrate | «Завершить обновление» | POST `/v1/migrate` или wallet `DoMigrate` **W+S** | `daoState`, `codeHash`, `needsPatch` C |
| 3.6 | Настройка поля | Settings → поле | create vtype=2/4… | — |
| 3.7 | Вывод казны | монета → Вывести | create vtype=1 | — |

**Клики 3.2:** Каталог → карточка → Голосования. Заголовки из `votingMeta` (static).

**Клики 3.4–3.5 (патч):** карточка → «Патч…» → тип зафиксирован → Создать → TonConnect → голосование → Запустить → За → Итог → на ДАО «Завершить».

---

## 4. Создать голосование

Форма: ДАО → «Создать» / CTA пресета. Submit всегда wallet `CreateVotingReq` (**W**). После: `votings`, `votingMeta` C.

| vtype | Смысл | Клики |
|-------|--------|-------|
| 0 | Решение | тип Решение → заголовок/опции → Создать |
| 1 | Выплата | Казна → монета → Вывести → адрес/сумма → Создать |
| 2 | Конфиг | Settings → поле → значение → Создать |
| 3 | Патч кода | «Патч ДАО» (тип зафиксирован) → Создать |
| 4–29 | param / party / gas / convert / NFT / bot… | Settings CTA → форма → Создать |

**Activate money DAO:** экран Activate → кнопка → jetton + `BindWallet` **W** → `daoBound` C.

---

## 5. Карточка голосования

| # | Действие | Куда нажать | Сеть | Кеш |
|---|----------|-------------|------|-----|
| 5.1 | Открыть | строка списка | `votingState` (12 с) | `votingState`, `votingAction` |
| 5.2 | Добавить опцию | поле + Добавить | relay `/v1/voting/relay` или `AddOption` **W+S** | `votingState` C |
| 5.3 | Запустить | «Запустить» / Start | AddOption×N + Start **W** | `votingState`, `votings` C |
| 5.4 | Голос civic | опция | POST `/v1/vote` **S+W** | `votingState` C |
| 5.5 | Голос стейк | опция | `AddWeight` / relay **W** | `stake`, `votingState` C |
| 5.6 | Голос wallet/jetton | опция | cast / jetton **W** | `votingState`, `tokenBal` C |
| 5.7 | Итог | «Подвести итог» | POST `/v1/finalize` или finalize **W+S** | state + `params`/`daoEntry` если kind=4 C |
| 5.8 | Забрать депозит | Reclaim | `take_vote` **W** | `votingState` C |

**Клики 5.3+5.4:** список → строка → Запустить → TonConnect → опция За → (civic: silent `/v1/vote` или кошелёк).

---

## 6. Стейк / bind / collateral

| # | Действие | Куда нажать | Сеть | Кеш |
|---|----------|-------------|------|-----|
| 6.1 | Стейк | хаб/панель → сумма → Стейк | jetton → StakeSource **W** | `stake`, `daoCard`, `tokenBal` C |
| 6.2 | Анстейк | Анстейк / всё | unstake **W** | `stake` C |
| 6.3 | Bind wallet | Bind (создатель) | `BindChild` **W** | `childWalletBound` C |
| 6.4 | Lock/unlock collateral | Lock / Unlock | CollateralSource **W** | — |

`stake:` — SWR с сервера; poll + rewarm (2 мин) пока открыт стейкинг-UI.

---

## 7. Гражданство / паспорт / NFT

| # | Действие | Куда нажать | Сеть | Кеш |
|---|----------|-------------|------|-----|
| 7.1 | Открыть гражданство | хаб → Гражданство | POST `/v1/citizenship/status`, `/v1/nation` **S** | `citStatus`, `citPaths` |
| 7.2 | Выдать паспорт | Face ID | POST `/v1/passport/issue` **S** | vault |
| 7.3 | Заявка / endorse / claim | Apply / Endorse / Pay | `/apply` `/endorse` `/claim-*` **S** (+ TX pay) | `citStatus` C |
| 7.4 | NFT passport | NFT → Deploy / Claim | deploy/mint **W** | `nftOwn`, `params` C |

---

## 8. Делегаты / партии

| # | Действие | Куда нажать | Сеть | Кеш |
|---|----------|-------------|------|-----|
| 8.1 | Номинировать | Депутаты → форма | ContractDeputy **W** + `/identity/match-name` **S** | `deputyProfiles` C |
| 8.2 | Назначить / отозвать | выбрать / Revoke | `/delegation/set` `/revoke` **S** | `delStatus` C |
| 8.3 | Партия deploy/resign | Партии → Deploy / Resign | party profile **W** | `parties` C |

Секции lazy — RPC только на открытой вкладке.

---

## 9. Газ / фонды / DEX

| # | Действие | Куда нажать | Сеть | Кеш |
|---|----------|-------------|------|-----|
| 9.1 | Пополнить личный газ | Газ → сумма → Пополнить | `/gas/ticket` + TON **S+W** → `/claim` | `gasPers` C |
| 9.2 | Пул ДАО | тот же путь (DAO) | `/gas/dao/ticket` + claim | `gasDao` C |
| 9.3 | Claim приватизации | Фонды → Claim | `/funds/claim-privatization` + TX **S+W** | `fundSnap` C |
| 9.4 | Push liberation/topup | Push | fund opcode **W** | `fundSnap` C |
| 9.5 | DEX LP deploy / return | DEX → Deploy / Return | vault **W** | `dexLp`, `treasuryJettons` C |

---

## 10. Прочее

| # | Действие | Куда нажать | Сеть |
|---|----------|-------------|------|
| 10.1 | Свои RPC-ключи | паспорт / stale tip | local only (poll минует server GET) |
| 10.2 | Bound bot | Settings → connect | `/v1/notify/bound-bot/*` **S** |
| 10.3 | Factory upgrade | AdminDeploy (owner) | MasterDAO `UpgradeCode` **W** |
| 10.4 | Deep-link slug | URL / startapp | `shortUrlDao` + catalog |
| 10.5 | Identity reveal | `#reveal=` | GET `/v1/identity/reveal/:token` |

---

## Фоновые чтения (без клика)

| Экран | Что грузится | Poll |
|-------|----------------|------|
| Каталог | `daos:`, `factoryLatest` | 45 с / 120 с |
| ДАО открыт | `votings:` | 45 с |
| Хаб home | `params`, `daoConfig` | нет (semi) |
| VotingDetail | `votingState` | 12 с |
| Секции хаба | только открытая | 60 с live |

Не грузить treasury/deputies/parties, пока вкладка закрыта.
