import { Address, toNano } from "@ton/core";
import type { useTonConnectUI } from "@tonconnect/ui-react";
import { DAO_ADDRESS } from "../lib/config";
import { resolveDaoModules } from "../lib/civicActions";
import {
  buildChainEnqueueBody,
  buildJettonBurnBody,
  CHAIN_TRC20,
  humanAmountToUnits,
  modAllowParamKey,
  modExecParamKey,
  moduleAddrRaw,
  parseBodyBoc,
  tonToNano,
  tronDestBytes,
  type ModExecKind,
} from "../lib/treasuryOps";
import { toJettonUnits } from "../ton/coins";
import {
  APPROVE_OPTION,
  REJECT_OPTION,
  buildAddOptionBody,
  buildDirectTx,
  buildTextComment,
  type DaoActionInput,
  type DaoConfigInput,
  type DaoVersion,
  type VoteSettingsInput,
} from "../ton/createVoting";
import { prepareVoting } from "../ton/prepareVoting";
import {
  fetchCivicSource,
  fetchDaoVersion,
  fetchDaoVotingSeqno,
  fetchVoteJettonWallet,
} from "../ton/rpc";
import { createDurationSec, voteSettingsFloorsFromConfig, type VoteSettingsFloors } from "../ton/voteFloors";
import type { DaoConfig } from "../lib/civic";

type TonUi = ReturnType<typeof useTonConnectUI>[0];

export type CreateVtype =
  | 0
  | 1
  | 2
  | 4
  | 6
  | 10
  | 12
  | 13
  | 16
  | 17
  | 18
  | 19
  | 20
  | 21
  | 22
  | 30
  | 31
  | 32;

const ATTACH_TON = "0.1";
const ADD_OPT_TON = "0.05";
const START_TON = "0.08";
const FINALIZE_TON = "0.15";

export type CreateForm = {
  title: string;
  description: string;
  durationHours: string;
  quorum: string;
  supportPct: string;
  turnoutPct: string;
  decisionOpts: string[];
  /** payout / convert buffer */
  payoutAmount: string;
  payoutTo: string;
  payoutWallet: string;
  payoutDecimals: string;
  /** config */
  cfgField: keyof Pick<
    DaoConfigInput,
    "minQuorum" | "minSupportPct" | "minTurnoutPct" | "minProposal" | "minDuration" | "logo"
  >;
  cfgValue: string;
  /** param */
  paramKey: string;
  paramIsString: boolean;
  paramNum: string;
  paramStr: string;
  /** convert (vtype 18) */
  convertMinTon: string;
  /** module (30/31/32) */
  moduleAddr: string;
  modDeny: boolean;
  modExec: ModExecKind;
  modAmount: string;
  modDecimals: string;
  modTreasuryWallet: string;
  modDest: string;
  modBodyB64: string;
  /** chain TRC-20 (32) */
  chainDest: string;
  chainAmount: string;
  chainNonce: string;
};

export function defaultCreateForm(floors: VoteSettingsFloors): CreateForm {
  return {
    title: "",
    description: "",
    durationHours: String(floors.durationHours),
    quorum: String(floors.quorum),
    supportPct: String(floors.supportPct),
    turnoutPct: String(floors.turnoutPct),
    decisionOpts: ["За", "Против"],
    payoutAmount: "",
    payoutTo: "",
    payoutWallet: "",
    payoutDecimals: "9",
    cfgField: "minSupportPct",
    cfgValue: "",
    paramKey: "cit.path.pay",
    paramIsString: false,
    paramNum: "1",
    paramStr: "",
    convertMinTon: "1",
    moduleAddr: "",
    modDeny: false,
    modExec: "returnJetton",
    modAmount: "1",
    modDecimals: "9",
    modTreasuryWallet: "",
    modDest: "",
    modBodyB64: "",
    chainDest: "",
    chainAmount: "1",
    chainNonce: String(Date.now()),
  };
}

function clampPct(raw: string, floor: number, max = 100) {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n)) return floor;
  return Math.min(max, Math.max(floor, n));
}

async function buildAction(
  vtype: CreateVtype,
  form: CreateForm,
  cfg: DaoConfig | null,
  fallbackTreasuryWallet: string | null,
): Promise<Omit<DaoActionInput, "approveOption"> & { approveIndex?: number }> {
  if (vtype === 0) return { kind: 0 };

  if (vtype === 1 || vtype === 20) {
    const wallet = form.payoutWallet.trim() || fallbackTreasuryWallet;
    if (!wallet) throw new Error("Нет jetton-кошелька казны");
    const amount = Number(String(form.payoutAmount).replace(",", "."));
    if (!Number.isFinite(amount) || amount <= 0) throw new Error("Укажите сумму выплаты");
    if (!form.payoutTo.trim()) throw new Error("Укажите адрес получателя");
    const decimals = Math.floor(Number(form.payoutDecimals) || 9);
    return {
      kind: 1,
      treasuryWallet: Address.parse(wallet).toString({ bounceable: true }),
      amount,
      decimals,
      destination: Address.parse(form.payoutTo.trim()).toString({ bounceable: true }),
      approveIndex: 0,
    };
  }

  if (vtype === 2) {
    if (!cfg?.voteJettonMaster) throw new Error("Нет daoConfig в кеше");
    const next: DaoConfigInput = {
      voteJettonMaster: cfg.voteJettonMaster,
      minProposal: Number(cfg.minProposal) || 0,
      minQuorum: Number(cfg.minQuorum) || 0,
      minSupportPct: Number(cfg.minSupportPct) || 0,
      minTurnoutPct: Number(cfg.minTurnoutPct) || 0,
      minDuration: Number(cfg.minDuration) || 0,
      logo: cfg.logo || cfg.i || "",
      voteJettonWallet: null,
    };
    const field = form.cfgField;
    if (field === "logo") next.logo = form.cfgValue.trim();
    else {
      const n = Number(form.cfgValue);
      if (!Number.isFinite(n) || n < 0) throw new Error("Неверное значение конфига");
      next[field] = n;
    }
    return { kind: 2, newConfig: next, approveIndex: 0 };
  }

  if (vtype === 18) {
    const nano = tonToNano(Number(String(form.convertMinTon).replace(",", ".")));
    if (!(nano > 0)) throw new Error("Укажите порог TON (> 0)");
    return {
      kind: 4,
      param: { key: "fund.convert.ton.min", isString: false, num: nano },
      approveIndex: 0,
    };
  }

  if (vtype === 30) {
    const mod = Address.parse(form.moduleAddr.trim()).toString({ bounceable: true });
    return {
      kind: 4,
      param: {
        key: modAllowParamKey(form.modDeny),
        isString: false,
        num: moduleAddrRaw(mod),
        str: mod,
      },
      approveIndex: 0,
    };
  }

  if (vtype === 31) {
    const mod = Address.parse(form.moduleAddr.trim()).toString({ bounceable: true });
    const raw = moduleAddrRaw(mod);
    const key = modExecParamKey(form.modExec);
    const amtNum = Number(String(form.modAmount).replace(",", ".")) || 0;
    const decimals = Math.floor(Number(form.modDecimals) || 9);

    if (form.modExec === "returnJetton") {
      if (!form.modTreasuryWallet.trim()) throw new Error("Укажите jetton wallet модуля");
      return {
        kind: 4,
        treasuryWallet: Address.parse(form.modTreasuryWallet.trim()).toString({ bounceable: true }),
        amount: amtNum,
        decimals,
        param: { key, isString: false, num: raw, str: mod },
        approveIndex: 0,
      };
    }
    if (form.modExec === "returnTon") {
      return {
        kind: 4,
        amount: amtNum,
        decimals: 9,
        param: { key, isString: false, num: raw, str: mod },
        approveIndex: 0,
      };
    }
    if (form.modExec === "sendJetton") {
      if (!form.modTreasuryWallet.trim() || !form.modDest.trim()) {
        throw new Error("Нужны jetton wallet и получатель");
      }
      const fwd = form.modBodyB64.trim() ? parseBodyBoc(form.modBodyB64) : null;
      return {
        kind: 4,
        treasuryWallet: Address.parse(form.modTreasuryWallet.trim()).toString({ bounceable: true }),
        amount: amtNum,
        decimals,
        destination: Address.parse(form.modDest.trim()).toString({ bounceable: true }),
        newCode: fwd,
        param: { key, isString: false, num: raw, str: mod },
        approveIndex: 0,
      };
    }
    if (form.modExec === "sendNft") {
      if (!form.modTreasuryWallet.trim() || !form.modDest.trim()) {
        throw new Error("Нужны NFT item и получатель");
      }
      return {
        kind: 4,
        treasuryWallet: Address.parse(form.modTreasuryWallet.trim()).toString({ bounceable: true }),
        destination: Address.parse(form.modDest.trim()).toString({ bounceable: true }),
        param: { key, isString: false, num: raw, str: mod },
        approveIndex: 0,
      };
    }
    if (form.modExec === "dedustBurn") {
      if (!form.modTreasuryWallet.trim()) throw new Error("Укажите LP jetton wallet");
      const jw = Address.parse(form.modTreasuryWallet.trim()).toString({ bounceable: true });
      const nano = toJettonUnits(amtNum, decimals);
      return {
        kind: 4,
        destination: jw,
        newCode: buildJettonBurnBody(nano, mod),
        param: { key, isString: false, num: raw, str: mod },
        approveIndex: 0,
      };
    }
    // forward
    const body = parseBodyBoc(form.modBodyB64);
    if (!body) throw new Error("Нужен body (BOC base64/hex)");
    if (!form.modDest.trim()) throw new Error("Укажите destination");
    return {
      kind: 4,
      destination: Address.parse(form.modDest.trim()).toString({ bounceable: true }),
      newCode: body,
      param: { key, isString: false, num: raw, str: mod },
      approveIndex: 0,
    };
  }

  if (vtype === 32) {
    const dest = await tronDestBytes(form.chainDest);
    const amt = humanAmountToUnits(form.chainAmount, 6);
    if (!dest || !amt || amt <= 0n) throw new Error("Проверьте TRON-адрес и сумму USDT");
    if (!/^[1-9]\d{0,19}$/.test(form.chainNonce.trim())) throw new Error("Nonce — целое число");
    const mod = Address.parse(form.moduleAddr.trim()).toString({ bounceable: true });
    const raw = moduleAddrRaw(mod);
    const body = buildChainEnqueueBody({
      chainId: CHAIN_TRC20,
      nonce: BigInt(form.chainNonce.trim()),
      decimals: 6,
      amount: amt,
      dest,
    });
    return {
      kind: 4,
      destination: mod,
      newCode: body,
      param: { key: "mod.exec.forward", isString: false, num: raw, str: mod },
      approveIndex: 0,
    };
  }

  const keyMap: Partial<Record<CreateVtype, { key: string; isString: boolean; num?: number; str?: string }>> = {
    6: {
      key: form.paramKey.trim() || "cit.path.pay",
      isString: form.paramIsString,
      num: form.paramIsString ? 0 : Number(form.paramNum) || 0,
      str: form.paramStr,
    },
    4: {
      key: form.paramKey.trim(),
      isString: form.paramIsString,
      num: form.paramIsString ? 0 : Number(form.paramNum) || 0,
      str: form.paramStr,
    },
    10: { key: "short_url", isString: true, str: form.paramStr.trim() },
    12: { key: "cit.ban.enabled", isString: true, str: "1" },
    13: { key: form.paramKey.trim() || "cit.ban.manual", isString: true, str: form.paramStr.trim() },
    16: { key: "sec.password", isString: true, str: form.paramStr.trim() || "1" },
    17: { key: "gas.treasury", isString: true, str: "1" },
    19: { key: "nft.passport.open", isString: true, str: "1" },
    21: { key: "party.allow", isString: true, str: "1" },
    22: { key: "party.become", isString: true, str: "1" },
  };
  const p = keyMap[vtype];
  if (!p?.key) throw new Error("Неизвестный тип голосования");
  return {
    kind: 4,
    param: {
      key: p.key,
      isString: p.isString,
      num: p.num,
      str: p.str,
    },
    approveIndex: 0,
  };
}

export async function submitCreateVoting(opts: {
  ui: TonUi;
  wallet: string;
  vtype: CreateVtype;
  form: CreateForm;
  config: DaoConfig | null;
}) {
  const floors = voteSettingsFloorsFromConfig(opts.config);
  const title = opts.form.title.trim();
  if (title.length < 3) throw new Error("Заголовок слишком короткий");

  const [versionRaw, seqno, modules, civicRpc, treasuryWallet] = await Promise.all([
    fetchDaoVersion(DAO_ADDRESS),
    fetchDaoVotingSeqno(DAO_ADDRESS),
    resolveDaoModules().catch(() => ({ civicSource: "", citizenshipHub: "", pathPay: "" })),
    fetchCivicSource(DAO_ADDRESS),
    fetchVoteJettonWallet(DAO_ADDRESS),
  ]);

  const version = (versionRaw >= 6 ? 6 : versionRaw >= 5 ? 5 : 4) as DaoVersion;
  if (version >= 6 && seqno == null) throw new Error("Не удалось прочитать votingSeqno контейнера");

  const weightSource = modules.civicSource || civicRpc;
  if (!weightSource) throw new Error("Нет источника голоса (weight source) у контейнера");

  const settings: VoteSettingsInput = {
    endTimeSec: createDurationSec(opts.form.durationHours, floors),
    minAmount: 0,
    quorum: Math.max(floors.quorum, Math.floor(Number(opts.form.quorum) || 0)),
    supportPct: clampPct(opts.form.supportPct, floors.supportPct, 99),
    turnoutPct: clampPct(opts.form.turnoutPct, floors.turnoutPct, 100),
    totalSupply: 0,
  };

  const baseAction = await buildAction(opts.vtype, opts.form, opts.config, treasuryWallet);
  const options =
    opts.vtype === 0
      ? []
      : [
          { title: APPROVE_OPTION.title, description: APPROVE_OPTION.description },
          { title: REJECT_OPTION.title, description: REJECT_OPTION.description },
        ];

  let description = opts.form.description.trim();
  if (!description && baseAction.kind === 4 && baseAction.param?.key) {
    description = `Параметр ${baseAction.param.key}`;
  }

  const prepared = await prepareVoting({
    container: DAO_ADDRESS,
    creator: opts.wallet,
    title,
    description,
    settings,
    options,
    action: baseAction,
    version,
    weightSource,
    votingSeqno: seqno ?? 0,
    bodyLayout: "tonAbi",
  });

  await opts.ui.sendTransaction(buildDirectTx(DAO_ADDRESS, prepared.body, ATTACH_TON));

  const decisionOpts =
    opts.vtype === 0
      ? opts.form.decisionOpts.map((s) => s.trim()).filter(Boolean).slice(0, 8)
      : [APPROVE_OPTION.title, REJECT_OPTION.title];

  try {
    sessionStorage.setItem(
      `chv_pending_launch:${prepared.votingAddr}`,
      JSON.stringify({
        opts: decisionOpts,
        executable: opts.vtype !== 0,
      }),
    );
  } catch {
    /* ignore */
  }

  return prepared.votingAddr;
}

export async function launchVoting(opts: {
  ui: TonUi;
  voting: string;
  optionTitles: string[];
  executable?: boolean;
}) {
  const messages: Array<{ address: string; amount: string; payload?: string }> = [];
  for (const title of opts.optionTitles) {
    const desc =
      opts.executable && title === APPROVE_OPTION.title
        ? APPROVE_OPTION.description
        : opts.executable && title === REJECT_OPTION.title
          ? REJECT_OPTION.description
          : "";
    const body = buildAddOptionBody(title, desc);
    messages.push({
      address: opts.voting,
      amount: toNano(ADD_OPT_TON).toString(),
      payload: body.toBoc().toString("base64"),
    });
  }
  messages.push({
    address: opts.voting,
    amount: toNano(START_TON).toString(),
    payload: buildTextComment("start").toBoc().toString("base64"),
  });
  await opts.ui.sendTransaction({
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages,
  });
  try {
    sessionStorage.removeItem(`chv_pending_launch:${opts.voting}`);
  } catch {
    /* ignore */
  }
}

export async function finalizeVoting(opts: { ui: TonUi; voting: string }) {
  await opts.ui.sendTransaction(
    buildDirectTx(opts.voting, buildTextComment("finalize"), FINALIZE_TON),
  );
}

export function readPendingLaunch(voting: string): { opts: string[]; executable?: boolean } | null {
  try {
    const raw = sessionStorage.getItem(`chv_pending_launch:${voting}`);
    if (!raw) return null;
    return JSON.parse(raw) as { opts: string[]; executable?: boolean };
  } catch {
    return null;
  }
}
