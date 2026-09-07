import { Address, beginCell, Cell, toNano } from "@ton/core";
import { toJettonUnits } from "./coins";
import { stringSnakeCell } from "./textSnake";

export const OP_CREATE_VOTING = 0x3d0a0c02;
export const OP_ADD_OPTION = 0xc8b1f5ab;

export type DaoVersion = 3 | 4 | 5 | 6;
export type CreateVotingBodyLayout = "tonAbi" | "jettonNotify";

export interface VoteSettingsInput {
  endTimeSec: number;
  minAmount: number;
  quorum: number;
  supportPct?: number;
  turnoutPct?: number;
  totalSupply?: number;
}

export interface DaoConfigInput {
  voteJettonMaster: string;
  minProposal: number;
  minQuorum: number;
  minSupportPct: number;
  minTurnoutPct: number;
  minDuration: number;
  logo: string;
  voteJettonWallet?: string | null;
}

export interface DaoParamInput {
  key: string;
  isString: boolean;
  num?: number | bigint;
  str?: string;
}

export interface DaoActionInput {
  kind: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  treasuryWallet?: string | null;
  amount?: number;
  decimals?: number;
  destination?: string | null;
  newConfig?: DaoConfigInput | null;
  approveOption?: string | null;
  newCode?: Cell | null;
  param?: DaoParamInput | null;
}

export const APPROVE_OPTION = { title: "За", description: "Исполнить" };
export const REJECT_OPTION = { title: "Против", description: "Отклонить" };
export const CANONICAL_OPTIONS = [APPROVE_OPTION, REJECT_OPTION] as const;

export function voteSettingsCell(s: VoteSettingsInput): Cell {
  return beginCell()
    .storeUint(s.endTimeSec, 64)
    .storeCoins(toNano(s.minAmount.toString()))
    .storeCoins(toNano(s.quorum.toString()))
    .storeUint(s.supportPct ?? 0, 8)
    .storeUint(s.turnoutPct ?? 0, 8)
    .storeCoins(s.totalSupply ? toNano(s.totalSupply.toString()) : 0n)
    .endCell();
}

export function voteSettingsStruct(s: VoteSettingsInput) {
  return {
    $$type: "VoteSettings" as const,
    endTime: BigInt(s.endTimeSec),
    min_amount: toNano(s.minAmount.toString()),
    quorum: toNano(s.quorum.toString()),
    supportPct: BigInt(s.supportPct ?? 0),
    turnoutPct: BigInt(s.turnoutPct ?? 0),
    totalSupply: s.totalSupply ? toNano(s.totalSupply.toString()) : 0n,
  };
}

export function daoConfigCell(c: DaoConfigInput, version: DaoVersion = 6): Cell {
  const b = beginCell()
    .storeAddress(Address.parse(c.voteJettonMaster))
    .storeCoins(toNano((c.minProposal || 0).toString()))
    .storeCoins(toNano((c.minQuorum || 0).toString()))
    .storeUint(c.minSupportPct || 0, 8)
    .storeUint(c.minTurnoutPct || 0, 8)
    .storeUint(c.minDuration || 0, 32)
    .storeRef(beginCell().storeStringTail(c.logo || "").endCell());
  if (version >= 6) b.storeAddress(c.voteJettonWallet ? Address.parse(c.voteJettonWallet) : null);
  return b.endCell();
}

export function daoParamCell(p: DaoParamInput): Cell {
  const num = p.isString
    ? 0n
    : typeof p.num === "bigint"
      ? p.num
      : BigInt(Math.trunc(Number(p.num ?? 0)));
  return beginCell()
    .storeStringRefTail(p.key)
    .storeBit(p.isString)
    .storeInt(num, 257)
    .storeStringRefTail(p.str ?? "")
    .endCell();
}

export function daoActionCell(a: DaoActionInput, version: DaoVersion = 4): Cell {
  const withParam = version >= 4;
  const tailB = beginCell();
  if (a.newConfig) tailB.storeBit(true).storeSlice(daoConfigCell(a.newConfig, version).beginParse());
  else tailB.storeBit(false);
  const deep = version >= 6;
  const optB = deep ? beginCell() : tailB;
  optB.storeAddress(a.approveOption ? Address.parse(a.approveOption) : null);
  if (a.newCode) optB.storeBit(true).storeRef(a.newCode);
  else optB.storeBit(false);
  if (withParam) {
    const b2 = deep ? optB : beginCell();
    if (a.param) b2.storeBit(true).storeSlice(daoParamCell(a.param).beginParse());
    else b2.storeBit(false);
    if (!deep) tailB.storeRef(b2.endCell());
  }
  if (deep) tailB.storeRef(optB.endCell());
  const amountUnits = a.amount
    ? a.decimals != null && a.decimals !== 9
      ? toJettonUnits(a.amount, a.decimals)
      : toNano(a.amount.toString())
    : 0n;
  return beginCell()
    .storeUint(a.kind, withParam ? 8 : 2)
    .storeAddress(a.treasuryWallet ? Address.parse(a.treasuryWallet) : null)
    .storeCoins(amountUnits)
    .storeAddress(a.destination ? Address.parse(a.destination) : null)
    .storeRef(tailB.endCell())
    .endCell();
}

export function votingMetaCell(
  title: string,
  description: string,
  settings: VoteSettingsInput,
  action: DaoActionInput,
): Cell {
  const isDuration = settings.endTimeSec > 0 && settings.endTimeSec < 1_000_000_000;
  return stringSnakeCell(
    JSON.stringify({
      name: title,
      description,
      durationSec: isDuration ? settings.endTimeSec : undefined,
      endsAt: isDuration ? 0 : settings.endTimeSec * 1000,
      kind: action.kind === 1 ? "money" : "decision",
      quorum: settings.quorum,
    }),
  );
}

export function buildCreateVotingReqBody(
  title: string,
  description: string,
  settings: VoteSettingsInput,
  action: DaoActionInput,
  version: DaoVersion = 6,
  layout: CreateVotingBodyLayout = "tonAbi",
): Cell {
  const meta = votingMetaCell(title, description, settings, action);
  const actionCell = daoActionCell(action, version);
  const b = beginCell().storeUint(OP_CREATE_VOTING, 32).storeUint(0, 64).storeRef(meta);
  if (layout === "tonAbi") {
    b.storeSlice(voteSettingsCell(settings).beginParse());
    b.storeRef(actionCell);
  } else {
    b.storeRef(voteSettingsCell(settings));
    b.storeRef(actionCell);
  }
  return b.endCell();
}

export function buildAddOptionBody(title: string, description: string): Cell {
  return beginCell()
    .storeUint(OP_ADD_OPTION, 32)
    .storeUint(0, 64)
    .storeStringRefTail(title)
    .storeStringRefTail(description)
    .endCell();
}

export function buildTextComment(text: string): Cell {
  return beginCell().storeUint(0, 32).storeStringTail(text).endCell();
}

export function buildDirectTx(to: string, body: Cell, tonAmount: string) {
  return {
    validUntil: Math.floor(Date.now() / 1000) + 360,
    messages: [
      {
        address: to,
        amount: toNano(tonAmount).toString(),
        payload: body.toBoc().toString("base64"),
      },
    ],
  };
}
