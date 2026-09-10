import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
import { ActionError } from "../components/TonConnectRecovery";
import { DAO_ADDRESS } from "../lib/config";
import {
  catalogContextFromParams,
  filterVotingCatalog,
  loadVotingCatalog,
  type VoteCatId,
  type VotingCatalog,
  type VotingCatalogItem,
} from "../lib/votingCatalog";
import { fetchPrivatizationStatus } from "../ton/rpc";
import {
  loadTreasuryModules,
  modulesForVtype,
  type TreasuryModuleEntry,
} from "../lib/treasuryModules";

export function CreateReferendum() {
  const { config, tt, isCitizen, params, citizens } = useApp();
  const wallet = resolveWallet(useTonAddress());
  const [ui] = useTonConnectUI();
  const nav = useNavigate();
  const [q] = useSearchParams();
  const floors = useMemo(() => voteSettingsFloorsFromConfig(config), [config]);

  const [catalog, setCatalog] = useState<VotingCatalog | null>(null);
  const [catalogSource, setCatalogSource] = useState<"api" | "bundle">("bundle");
  const [treasuryMods, setTreasuryMods] = useState<TreasuryModuleEntry[]>([]);
  const [privFund, setPrivFund] = useState<{ fund: string | null; live: boolean }>({
    fund: null,
    live: false,
  });
  const [cat, setCat] = useState<VoteCatId>("decisions");
  const [picked, setPicked] = useState<VotingCatalogItem | null>(null);
  const [form, setForm] = useState<CreateForm>(() => defaultCreateForm(floors));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const retryRef = useRef<null | (() => void)>(null);
  const queryApplied = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [{ catalog: catRaw, source }, priv, treas] = await Promise.all([
        loadVotingCatalog(),
        fetchPrivatizationStatus(DAO_ADDRESS).catch(() => ({ fund: null, live: false })),
        loadTreasuryModules(DAO_ADDRESS).catch(() => ({
          catalog: { version: 1, modules: [] as TreasuryModuleEntry[] },
          source: "bundle" as const,
        })),
      ]);
      if (cancelled) return;
      setCatalog(catRaw);
      setCatalogSource(source);
      setPrivFund(priv);
      setTreasuryMods(treas.catalog.modules);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const ctx = useMemo(
    () =>
      catalogContextFromParams(params, {
        hasPrivFund: !!privFund.fund,
        privFundLive: privFund.live,
      }),
    [params, privFund.fund, privFund.live],
  );

  const filtered = useMemo(() => {
    if (!catalog) return { categories: [], items: [] as VotingCatalogItem[] };
    return filterVotingCatalog(catalog, ctx);
  }, [catalog, ctx]);

  const groupItems = useMemo(
    () => filtered.items.filter((i) => i.category === cat),
    [filtered.items, cat],
  );

  const vtype = (picked?.vtype ?? null) as CreateVtype | null;

  const moduleChoices = useMemo(
    () => (vtype != null ? modulesForVtype(treasuryMods, vtype) : treasuryMods),
    [treasuryMods, vtype],
  );

  function applyModulePick(id: string) {
    const m = treasuryMods.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      modCatalogId: id,
      moduleAddr: m?.address || (id === "custom" ? f.moduleAddr : ""),
    }));
  }

  useEffect(() => {
    if (!treasuryMods.length) return;
    if (!(vtype === 30 || vtype === 31 || vtype === 32)) return;
    setForm((f) => {
      if (f.moduleAddr.trim()) return f;
      const id = f.modCatalogId || (vtype === 32 ? "chainwallet" : "dexlp");
      const m = treasuryMods.find((x) => x.id === id) || treasuryMods.find((x) => x.address);
      if (!m?.address) return f.modCatalogId === id ? f : { ...f, modCatalogId: id };
      return { ...f, modCatalogId: m.id, moduleAddr: m.address };
    });
  }, [treasuryMods, vtype]);

  useEffect(() => {
    if (!catalog || queryApplied.current) return;
    const rawV = q.get("vtype");
    if (!rawV) return;
    const n = Number(rawV);
    if (!Number.isFinite(n)) return;
    const hubMode = q.get("hubAppMode") || q.get("appMode");
    const hubId = q.get("hubAppId") || "";
    const itemId = q.get("item");
    const all = catalog.items;
    let match =
      (itemId ? all.find((i) => i.id === itemId) : undefined) ||
      all.find((i) => {
        if (i.vtype !== n) return false;
        if (hubMode && i.preset?.hubAppMode && i.preset.hubAppMode !== hubMode) return false;
        if (hubId && i.preset?.hubAppId && i.preset.hubAppId !== hubId) return false;
        return true;
      }) ||
      all.find((i) => i.vtype === n);
    if (!match) return;
    queryApplied.current = true;
    setCat(match.category);
    applyPick(match, citizens);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, q, citizens]);

  function applyPick(item: VotingCatalogItem, citizenCountHint?: number | null) {
    setPicked(item);
    const next = applyQueryPreset(
      {
        ...defaultCreateForm(floors),
        citizenCount:
          citizenCountHint && citizenCountHint > 0 ? String(citizenCountHint) : "",
      },
      q,
      item.vtype as CreateVtype,
    );
    if (item.preset?.hubAppMode) next.hubAppMode = item.preset.hubAppMode;
    if (item.preset?.hubAppId) next.hubAppId = item.preset.hubAppId;
    if (item.preset?.paramKey) next.paramKey = item.preset.paramKey;
    if (item.preset?.title && !next.title) next.title = item.preset.title;
    if (item.vtype === 7 && !next.title) next.title = "Разблокировать приватизацию";
    if (item.vtype === 14 && !next.title) next.title = "Автопополнение казны";
    if (item.id === "priv-enable" && !next.title) next.title = "Включить приватизацию";
    if (item.id === "priv-disable" && !next.title) next.title = "Выключить приватизацию";
    setForm(next);
  }

  function patch<K extends keyof CreateForm>(key: K, value: CreateForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit() {
    if (!wallet) {
      ui.openModal();
      return;
    }
    if (vtype == null) return;
    retryRef.current = () => void onSubmit();
    setBusy(true);
    setErr("");
    setInfo("Подтвердите создание в кошельке…");
    try {
      const addr = await submitCreateVoting({ ui, wallet, vtype, form, config });
      setInfo("Создано — переходим к запуску опций…");
      retryRef.current = null;
      nav(`/referendums/${encodeURIComponent(addr)}?launch=1`, { replace: true });
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
      setInfo("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack">
      <Link to="/referendums" className="muted">
        ← {tt("referendums")}
      </Link>
      <h1 className="page-title">{tt("createVote")}</h1>
      {isCitizen !== true ? (
        <p className="muted">Создавать голосования могут граждане с разблокированным паспортом и кошельком.</p>
      ) : null}
      {catalog && catalogSource === "bundle" ? (
        <p className="muted" style={{ fontSize: 12 }}>
          Каталог модулей: локальный снимок (API недоступен). После обновления civic API кабинет подтянет новые типы сам.
        </p>
      ) : null}

      {picked == null ? (
        <>
          <div className="row" style={{ flexWrap: "wrap", gap: 8 }}>
            {filtered.categories.map((c) => (
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
            {groupItems.map((it) => (
              <button
                key={it.id}
                type="button"
                className="card"
                data-testid={`create-vtype-${it.vtype}`}
                data-catalog-id={it.id}
                style={{ textAlign: "left", cursor: "pointer", border: "1px solid var(--line)" }}
                onClick={() => applyPick(it, citizens)}
              >
                <strong>{it.label}</strong>
                <p className="muted" style={{ margin: "6px 0 0" }}>
                  {it.hint}
                </p>
              </button>
            ))}
            {!catalog ? <p className="muted">{tt("loading")}</p> : null}
            {catalog && !groupItems.length ? (
              <p className="muted">В этой категории сейчас нет доступных модулей.</p>
            ) : null}
          </div>
        </>
      ) : (
        <div className="card stack">
          <button type="button" className="btn btn-ghost" onClick={() => setPicked(null)}>
            ← Тип голосования
          </button>
          <p className="muted" style={{ margin: 0 }}>
            {picked.label}
          </p>
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

          {vtype === 7 ? (
            <>
              <label className="muted">
                Число граждан (снимок)
                <input
                  value={form.citizenCount}
                  onChange={(e) => patch("citizenCount", e.target.value)}
                  style={inputStyle}
                  inputMode="numeric"
                />
              </label>
              <p className="muted">
                Kind=6 unlock: фиксирует totalCitizens на момент исполнения голоса.
                {citizens != null ? ` Сейчас в реестре: ${citizens}.` : ""}
              </p>
            </>
          ) : null}

          {vtype === 14 ? (
            <>
              <label className="muted">
                Режим
                <select
                  value={form.topupMode}
                  onChange={(e) => patch("topupMode", e.target.value as "pct" | "fixed")}
                  style={inputStyle}
                >
                  <option value="pct">Процент от казны</option>
                  <option value="fixed">Фиксированная сумма жетона</option>
                </select>
              </label>
              <label className="muted">
                {form.topupMode === "pct" ? "Процент (напр. 1 = 1%)" : "Сумма жетона"}
                <input
                  value={form.topupAmount}
                  onChange={(e) => patch("topupAmount", e.target.value)}
                  style={inputStyle}
                />
              </label>
              {form.topupMode === "fixed" ? (
                <label className="muted">
                  Decimals жетона
                  <input
                    value={form.payoutDecimals}
                    onChange={(e) => patch("payoutDecimals", e.target.value)}
                    style={inputStyle}
                  />
                </label>
              ) : null}
              <p className="muted">Период по умолчанию — 30 дней (fund.topup.period можно сменить отдельно).</p>
            </>
          ) : null}

          {vtype === 11 && (form.hubAppMode === "enable" || form.hubAppMode === "disable") ? (
            <p className="muted">
              {form.hubAppMode === "enable" ? "Включить" : "Выключить"} модуль{" "}
              <code>hub.on.{form.hubAppId || "priv_fund"}</code>
            </p>
          ) : null}

          {vtype === 11 && !form.hubAppMode ? (
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

          {vtype === 30 || vtype === 31 || vtype === 32 ? (
            <>
              <label className="muted">
                Модуль казны
                <select
                  data-testid="treasury-module-pick"
                  value={form.modCatalogId || "custom"}
                  onChange={(e) => applyModulePick(e.target.value)}
                  style={inputStyle}
                >
                  {moduleChoices.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                  {!moduleChoices.some((m) => m.id === "custom") ? (
                    <option value="custom">Свой модуль</option>
                  ) : null}
                </select>
              </label>
              {moduleChoices.find((m) => m.id === form.modCatalogId)?.hint ? (
                <p className="muted" style={{ margin: 0, fontSize: 13 }}>
                  {moduleChoices.find((m) => m.id === form.modCatalogId)?.hint}
                </p>
              ) : null}
              <label className="muted">
                Адрес модуля{form.modCatalogId === "custom" ? "" : " (подставлен из каталога)"}
                <input
                  value={form.moduleAddr}
                  onChange={(e) => {
                    patch("moduleAddr", e.target.value);
                    if (form.modCatalogId !== "custom") patch("modCatalogId", "custom");
                  }}
                  style={inputStyle}
                  placeholder="EQ…"
                />
              </label>
            </>
          ) : null}

          {vtype === 30 ? (
            <label className="muted row" style={{ gap: 8, alignItems: "center" }}>
              <input
                type="checkbox"
                checked={form.modDeny}
                onChange={(e) => patch("modDeny", e.target.checked)}
              />
              Отклеить (mod.deny)
            </label>
          ) : null}

          {vtype === 31 ? (
            <>
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
          {err ? (
            <ActionError
              error={err}
              busy={busy}
              onRetry={retryRef.current ? () => retryRef.current?.() : undefined}
              onDismiss={() => {
                setErr("");
                retryRef.current = null;
              }}
            />
          ) : null}
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
  const citizens = q.get("citizens") || q.get("citizenCount");
  const topupMode = q.get("topupMode");
  const topupAmount = q.get("topupAmount") || q.get("topup");

  if (title) next.title = title;
  const description = q.get("description") || q.get("desc");
  if (description) next.description = description;
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
  const modCat = q.get("modCatalogId") || q.get("modCatalog") || q.get("item");
  if (modCat === "dexlp" || modCat === "chainwallet" || modCat === "custom") next.modCatalogId = modCat;
  if (minTon) next.convertMinTon = minTon;
  if (dest) {
    next.modDest = dest;
    next.chainDest = dest;
  }
  if (nonce) next.chainNonce = nonce;
  if (deny === "1" || deny === "true") next.modDeny = true;
  if (exec) next.modExec = exec;
  if (citizens) next.citizenCount = citizens;
  if (topupMode === "pct" || topupMode === "fixed") next.topupMode = topupMode;
  if (topupAmount) next.topupAmount = topupAmount;
  if (master && !next.title) next.description = `master ${master}`;

  if (vtype === 18 && !next.title) next.title = "Автоконверт казны";
  if (vtype === 20 && !next.title) next.title = "Буфер конверта";
  if (vtype === 1 && !next.title) next.title = "Выплата из казны";
  if (vtype === 30 && !next.title) next.title = next.modDeny ? "Отклеить модуль казны" : "Приклеить модуль казны";
  if (vtype === 31 && !next.title) next.title = "Исполнить на модуле казны";
  if (vtype === 32 && !next.title) next.title = "Выплата USDT TRC-20";
  if (vtype === 7 && !next.title) next.title = "Разблокировать приватизацию";
  if (vtype === 14 && !next.title) next.title = "Автопополнение казны";

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
