import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTonAddress, useTonConnectUI } from "@tonconnect/ui-react";
import { useApp } from "../state/AppState";
import {
  CreateVtype,
  CreateForm,
  defaultCreateForm,
  submitCreateVoting,
} from "../lib/createVotingFlow";
import { voteSettingsFloorsFromConfig } from "../ton/voteFloors";
import type { ModExecKind } from "../lib/treasuryOps";
import { resolveWallet } from "../lib/e2eHooks";

type Cat = "decisions" | "citizenship" | "treasury" | "settings" | "hub" | "parties";

const CATS: { id: Cat; title: string; items: { v: CreateVtype; label: string; hint: string }[] }[] = [
  {
    id: "decisions",
    title: "Решения",
    items: [{ v: 0, label: "Референдум / решение", hint: "Без ончейн-исполнения — только мнение граждан" }],
  },
  {
    id: "citizenship",
    title: "Гражданство",
    items: [
      { v: 6, label: "Путь гражданства (DaoParam)", hint: "cit.path.* — вкл/настройка пути" },
      { v: 12, label: "Включить бан по голосу", hint: "cit.ban.enabled=1" },
      { v: 13, label: "Бан гражданина", hint: "cit.ban.* payload" },
      { v: 19, label: "Открыть NFT-паспорт", hint: "nft.passport.open" },
      { v: 16, label: "Пароль / sec", hint: "sec.password" },
      { v: 17, label: "Газ из казны", hint: "gas.treasury=1" },
    ],
  },
  {
    id: "treasury",
    title: "Казна",
    items: [
      { v: 1, label: "Выплата из казны", hint: "kind=1 · За/Против · исполнение" },
      { v: 18, label: "Автоконверт (порог TON)", hint: "fund.convert.ton.min" },
      { v: 20, label: "Буфер конверта", hint: "выплата жетона на hot-wallet" },
      { v: 30, label: "Приклеить / отклеить модуль", hint: "mod.allow / mod.deny" },
      { v: 31, label: "Исполнить на модуле", hint: "mod.exec.* · DexLP / custom" },
      { v: 32, label: "Выплата USDT TRC-20", hint: "mod.exec.forward · ChainEnqueue" },
    ],
  },
  {
    id: "settings",
    title: "Настройки",
    items: [
      { v: 2, label: "Изменить DaoConfig", hint: "кворум / поддержка / длительность / лого" },
      { v: 4, label: "Произвольный DaoParam", hint: "любой ключ kind=4" },
    ],
  },
  {
    id: "hub",
    title: "Хаб",
    items: [{ v: 10, label: "Короткий URL", hint: "short_url" }],
  },
  {
    id: "parties",
    title: "Партии",
    items: [
      { v: 21, label: "Разрешить партии", hint: "party.allow" },
      { v: 22, label: "Разрешить вступление", hint: "party.become" },
    ],
  },
];

const TREASURY_VTYPES = new Set<CreateVtype>([1, 18, 20, 30, 31, 32]);

function parseVtype(raw: string | null): CreateVtype | null {
  if (!raw) return null;
  const n = Number(raw) as CreateVtype;
  const all = CATS.flatMap((c) => c.items.map((i) => i.v));
  return all.includes(n) ? n : null;
}

export function CreateReferendum() {
  const { config, tt, isCitizen } = useApp();
  const wallet = resolveWallet(useTonAddress());
  const [ui] = useTonConnectUI();
  const nav = useNavigate();
  const [q] = useSearchParams();
  const floors = useMemo(() => voteSettingsFloorsFromConfig(config), [config]);
  const presetV = parseVtype(q.get("vtype"));
  const [cat, setCat] = useState<Cat>(() => (presetV && TREASURY_VTYPES.has(presetV) ? "treasury" : "decisions"));
  const [vtype, setVtype] = useState<CreateVtype | null>(() => presetV);
  const [form, setForm] = useState<CreateForm>(() => {
    const base = defaultCreateForm(floors);
    return applyQueryPreset(base, q, presetV);
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");

  useEffect(() => {
    if (!presetV) return;
    setVtype(presetV);
    if (TREASURY_VTYPES.has(presetV)) setCat("treasury");
    setForm((f) => applyQueryPreset({ ...defaultCreateForm(floors), ...f }, q, presetV));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetV]);

  function patch<K extends keyof CreateForm>(key: K, value: CreateForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit() {
    if (!wallet) {
      ui.openModal();
      return;
    }
    if (vtype == null) return;
    setBusy(true);
    setErr("");
    setInfo("Подтвердите создание в кошельке…");
    try {
      const addr = await submitCreateVoting({ ui, wallet, vtype, form, config });
      setInfo("Создано — переходим к запуску опций…");
      nav(`/referendums/${encodeURIComponent(addr)}?launch=1`, { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setInfo("");
    } finally {
      setBusy(false);
    }
  }

  const group = CATS.find((c) => c.id === cat)!;

  return (
    <div className="stack">
      <Link to="/referendums" className="muted">
        ← {tt("referendums")}
      </Link>
      <h1 className="page-title">{tt("createVote")}</h1>
      {isCitizen !== true ? (
        <p className="muted">Создавать голосования могут граждане с разблокированным паспортом и кошельком.</p>
      ) : null}

      {vtype == null ? (
        <>
          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            {CATS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`btn ${cat === c.id ? "btn-primary" : "btn-ghost"}`}
                onClick={() => setCat(c.id)}
              >
                {c.title}
              </button>
            ))}
          </div>
          <div className="stack">
            {group.items.map((it) => (
              <button
                key={it.v}
                type="button"
                className="card"
                data-testid={`create-vtype-${it.v}`}
                style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--line)" }}
                onClick={() => {
                  setVtype(it.v);
                  setForm(defaultCreateForm(floors));
                }}
              >
                <strong>{it.label}</strong>
                <p className="muted" style={{ margin: "6px 0 0" }}>
                  {it.hint}
                </p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="card stack">
          <button type="button" className="btn btn-ghost" onClick={() => setVtype(null)}>
            ← Тип голосования
          </button>
          <label className="muted">
            Заголовок
            <input
              value={form.title}
              onChange={(e) => patch("title", e.target.value)}
              style={inputStyle}
              placeholder="Тема референдума"
            />
          </label>
          <label className="muted">
            Описание
            <textarea
              value={form.description}
              onChange={(e) => patch("description", e.target.value)}
              rows={3}
              style={inputStyle}
            />
          </label>
          <div className="row" style={{ flexWrap: "wrap", gap: 12 }}>
            <label className="muted" style={{ flex: 1, minWidth: 120 }}>
              Часы (≥{floors.durationHours})
              <input
                value={form.durationHours}
                onChange={(e) => patch("durationHours", e.target.value)}
                style={inputStyle}
              />
            </label>
            <label className="muted" style={{ flex: 1, minWidth: 120 }}>
              Кворум (≥{floors.quorum})
              <input value={form.quorum} onChange={(e) => patch("quorum", e.target.value)} style={inputStyle} />
            </label>
            <label className="muted" style={{ flex: 1, minWidth: 120 }}>
              Поддержка % (≥{floors.supportPct})
              <input
                value={form.supportPct}
                onChange={(e) => patch("supportPct", e.target.value)}
                style={inputStyle}
              />
            </label>
            <label className="muted" style={{ flex: 1, minWidth: 120 }}>
              Явка % (≥{floors.turnoutPct})
              <input
                value={form.turnoutPct}
                onChange={(e) => patch("turnoutPct", e.target.value)}
                style={inputStyle}
              />
            </label>
          </div>

          {vtype === 0 ? (
            <div className="stack" style={{ gap: 8 }}>
              <strong>Варианты ответа</strong>
              {form.decisionOpts.map((o, i) => (
                <div key={i} className="row" style={{ gap: 8 }}>
                  <input
                    value={o}
                    onChange={(e) => {
                      const next = [...form.decisionOpts];
                      next[i] = e.target.value;
                      patch("decisionOpts", next);
                    }}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    disabled={form.decisionOpts.length <= 2}
                    onClick={() => patch("decisionOpts", form.decisionOpts.filter((_, j) => j !== i))}
                  >
                    ✕
                  </button>
                </div>
              ))}
              {form.decisionOpts.length < 8 ? (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => patch("decisionOpts", [...form.decisionOpts, ""])}
                >
                  + вариант
                </button>
              ) : null}
            </div>
          ) : null}

          {vtype === 1 || vtype === 20 ? (
            <>
              <label className="muted">
                Сумма
                <input
                  value={form.payoutAmount}
                  onChange={(e) => patch("payoutAmount", e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label className="muted">
                Jetton wallet казны (EQ…)
                <input
                  value={form.payoutWallet}
                  onChange={(e) => patch("payoutWallet", e.target.value)}
                  style={inputStyle}
                  placeholder="пусто = voteJettonWallet контейнера"
                />
              </label>
              <label className="muted">
                Decimals
                <input
                  value={form.payoutDecimals}
                  onChange={(e) => patch("payoutDecimals", e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label className="muted">
                Получатель (EQ…)
                <input value={form.payoutTo} onChange={(e) => patch("payoutTo", e.target.value)} style={inputStyle} />
              </label>
              <p className="muted">
                {vtype === 20
                  ? "Буфер конверта: жетон на hot-wallet ops."
                  : "Опции За/Против добавятся автоматически; «За» исполнит выплату."}
              </p>
            </>
          ) : null}

          {vtype === 18 ? (
            <label className="muted">
              Порог TON (минимум в казне)
              <input
                value={form.convertMinTon}
                onChange={(e) => patch("convertMinTon", e.target.value)}
                style={inputStyle}
              />
            </label>
          ) : null}

          {vtype === 30 ? (
            <>
              <label className="muted">
                Адрес модуля
                <input
                  value={form.moduleAddr}
                  onChange={(e) => patch("moduleAddr", e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label className="muted row" style={{ gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={form.modDeny}
                  onChange={(e) => patch("modDeny", e.target.checked)}
                />
                Отклеить (mod.deny)
              </label>
            </>
          ) : null}

          {vtype === 31 ? (
            <>
              <label className="muted">
                Адрес модуля
                <input
                  value={form.moduleAddr}
                  onChange={(e) => patch("moduleAddr", e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label className="muted">
                Команда
                <select
                  value={form.modExec}
                  onChange={(e) => patch("modExec", e.target.value as ModExecKind)}
                  style={inputStyle}
                >
                  <option value="returnJetton">Вернуть jetton в казну</option>
                  <option value="returnTon">Вернуть TON в казну</option>
                  <option value="sendJetton">Вывести jetton</option>
                  <option value="sendNft">Передать NFT</option>
                  <option value="dedustBurn">DeDust: сжечь LP</option>
                  <option value="forward">Raw forward</option>
                </select>
              </label>
              {(form.modExec === "returnJetton" ||
                form.modExec === "returnTon" ||
                form.modExec === "sendJetton" ||
                form.modExec === "dedustBurn") && (
                <label className="muted">
                  Сумма
                  <input value={form.modAmount} onChange={(e) => patch("modAmount", e.target.value)} style={inputStyle} />
                </label>
              )}
              {(form.modExec === "returnJetton" ||
                form.modExec === "sendJetton" ||
                form.modExec === "dedustBurn" ||
                form.modExec === "sendNft") && (
                <label className="muted">
                  {form.modExec === "sendNft" ? "NFT item" : "Jetton wallet"}
                  <input
                    value={form.modTreasuryWallet}
                    onChange={(e) => patch("modTreasuryWallet", e.target.value)}
                    style={inputStyle}
                  />
                </label>
              )}
              {(form.modExec === "returnJetton" ||
                form.modExec === "sendJetton" ||
                form.modExec === "dedustBurn") && (
                <label className="muted">
                  Decimals
                  <input
                    value={form.modDecimals}
                    onChange={(e) => patch("modDecimals", e.target.value)}
                    style={inputStyle}
                  />
                </label>
              )}
              {(form.modExec === "sendJetton" || form.modExec === "sendNft" || form.modExec === "forward") && (
                <label className="muted">
                  Destination
                  <input value={form.modDest} onChange={(e) => patch("modDest", e.target.value)} style={inputStyle} />
                </label>
              )}
              {(form.modExec === "forward" || form.modExec === "sendJetton") && (
                <label className="muted">
                  Body BOC (base64/hex){form.modExec === "sendJetton" ? " — опционально" : ""}
                  <textarea
                    value={form.modBodyB64}
                    onChange={(e) => patch("modBodyB64", e.target.value)}
                    rows={3}
                    style={inputStyle}
                  />
                </label>
              )}
            </>
          ) : null}

          {vtype === 32 ? (
            <>
              <label className="muted">
                ChainWallet (модуль)
                <input
                  value={form.moduleAddr}
                  onChange={(e) => patch("moduleAddr", e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label className="muted">
                TRON-адрес (T…)
                <input value={form.chainDest} onChange={(e) => patch("chainDest", e.target.value)} style={inputStyle} />
              </label>
              <label className="muted">
                Сумма USDT
                <input
                  value={form.chainAmount}
                  onChange={(e) => patch("chainAmount", e.target.value)}
                  style={inputStyle}
                />
              </label>
              <label className="muted">
                Nonce
                <input value={form.chainNonce} onChange={(e) => patch("chainNonce", e.target.value)} style={inputStyle} />
              </label>
            </>
          ) : null}

          {vtype === 2 ? (
            <>
              <label className="muted">
                Поле
                <select
                  value={form.cfgField}
                  onChange={(e) => patch("cfgField", e.target.value as CreateForm["cfgField"])}
                  style={inputStyle}
                >
                  <option value="minQuorum">minQuorum</option>
                  <option value="minSupportPct">minSupportPct</option>
                  <option value="minTurnoutPct">minTurnoutPct</option>
                  <option value="minProposal">minProposal</option>
                  <option value="minDuration">minDuration (сек)</option>
                  <option value="logo">logo URL</option>
                </select>
              </label>
              <label className="muted">
                Новое значение
                <input value={form.cfgValue} onChange={(e) => patch("cfgValue", e.target.value)} style={inputStyle} />
              </label>
            </>
          ) : null}

          {vtype === 4 || vtype === 6 || vtype === 13 ? (
            <>
              <label className="muted">
                Ключ DaoParam
                <input value={form.paramKey} onChange={(e) => patch("paramKey", e.target.value)} style={inputStyle} />
              </label>
              <label className="muted row" style={{ gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={form.paramIsString}
                  onChange={(e) => patch("paramIsString", e.target.checked)}
                />
                Строковое значение
              </label>
              {form.paramIsString ? (
                <label className="muted">
                  str
                  <input value={form.paramStr} onChange={(e) => patch("paramStr", e.target.value)} style={inputStyle} />
                </label>
              ) : (
                <label className="muted">
                  num
                  <input value={form.paramNum} onChange={(e) => patch("paramNum", e.target.value)} style={inputStyle} />
                </label>
              )}
            </>
          ) : null}

          {vtype === 10 || vtype === 16 ? (
            <label className="muted">
              Значение
              <input value={form.paramStr} onChange={(e) => patch("paramStr", e.target.value)} style={inputStyle} />
            </label>
          ) : null}

          {vtype !== 0 ? (
            <p className="muted">Исполняемое голосование: опции «За» / «Против» фиксированы контрактом.</p>
          ) : null}

          <button
            className="btn btn-primary btn-wide"
            data-testid="create-voting-submit"
            disabled={busy || !form.title.trim()}
            onClick={() => void onSubmit()}
          >
            {wallet ? "Создать в кошельке (~0.1 TON)" : "Подключить кошелёк"}
          </button>
          {info ? <p style={{ color: "var(--ok)" }}>{info}</p> : null}
          {err ? <p style={{ color: "var(--maroon)" }}>{err}</p> : null}
        </div>
      )}
    </div>
  );
}

function applyQueryPreset(
  base: CreateForm,
  q: URLSearchParams,
  vtype: CreateVtype | null,
): CreateForm {
  const next = { ...base };
  const title = q.get("title");
  const amount = q.get("amount");
  const to = q.get("to");
  const wallet = q.get("wallet");
  const master = q.get("master");
  const decimals = q.get("decimals");
  const module = q.get("module") || q.get("mod");
  const minTon = q.get("minTon") || q.get("convertMinTon");
  const dest = q.get("dest") || q.get("chainDest");
  const nonce = q.get("nonce");
  const deny = q.get("deny");
  const exec = q.get("exec") as ModExecKind | null;

  if (title) next.title = title;
  if (amount) {
    next.payoutAmount = amount;
    next.modAmount = amount;
    next.chainAmount = amount;
  }
  if (to) next.payoutTo = to;
  if (wallet) {
    next.payoutWallet = wallet;
    next.modTreasuryWallet = wallet;
  }
  if (decimals) {
    next.payoutDecimals = decimals;
    next.modDecimals = decimals;
  }
  if (module) next.moduleAddr = module;
  if (minTon) next.convertMinTon = minTon;
  if (dest) {
    next.modDest = dest;
    next.chainDest = dest;
  }
  if (nonce) next.chainNonce = nonce;
  if (deny === "1" || deny === "true") next.modDeny = true;
  if (exec) next.modExec = exec;
  if (master && !next.title) next.description = `master ${master}`;

  if (vtype === 18 && !next.title) next.title = "Автоконверт казны";
  if (vtype === 20 && !next.title) next.title = "Буфер конверта";
  if (vtype === 1 && !next.title) next.title = "Выплата из казны";
  if (vtype === 30 && !next.title) next.title = next.modDeny ? "Отклеить модуль казны" : "Приклеить модуль казны";
  if (vtype === 31 && !next.title) next.title = "Исполнить на модуле казны";
  if (vtype === 32 && !next.title) next.title = "Выплата USDT TRC-20";

  return next;
}

const inputStyle: CSSProperties = {
  display: "block",
  width: "100%",
  marginTop: 4,
  padding: 10,
  borderRadius: 10,
  border: "1px solid var(--line)",
  boxSizing: "border-box",
};
