import { Address, Cell, Dictionary, beginCell, contractAddress, storeStateInit, toNano } from "@ton/core";
import { tcRun } from "./rpc";
import { PRIV_FUND_MODULE_CODE_B64, PRIV_FUND_MODULE_CODE_HASH } from "./privFundModuleCode.generated";

export { PRIV_FUND_MODULE_CODE_B64, PRIV_FUND_MODULE_CODE_HASH };

export const OP_UNLOCK_PRIV = 0x5adc0301;
export const OP_CLAIM_SHARE = 0x5adc0302;
export const OP_PAUSE_PRIV = 0x5adc0307;
export const OP_DEXLP_FORWARD = 0x5adc1005;
export const OP_BIND_JETTON_WALLET = 0x3d0a0c20;

export function privFundModuleCodeCell(): Cell {
  return Cell.fromBase64(PRIV_FUND_MODULE_CODE_B64);
}

/** Matches Tact ContractPrivFundModule init data layout. */
export function privFundModuleStateInit(dao: string, guardian: string): { code: Cell; data: Cell } {
  const claimed = Dictionary.empty(Dictionary.Keys.Address(), Dictionary.Values.Bool());
  const data = beginCell()
    .storeAddress(Address.parse(dao))
    .storeAddress(Address.parse(guardian))
    .storeBit(false)
    .storeUint(0, 32)
    .storeCoins(0n)
    .storeCoins(0n)
    .storeRef(beginCell().storeAddress(null).storeDict(claimed).endCell())
    .endCell();
  return { code: privFundModuleCodeCell(), data };
}

export function privFundModuleAddress(dao: string, guardian: string): string {
  return contractAddress(0, privFundModuleStateInit(dao, guardian)).toString({ bounceable: true });
}

export function buildPrivFundModuleDeployTx(dao: string, guardian: string) {
  const init = privFundModuleStateInit(dao, guardian);
  const addr = contractAddress(0, init);
  const stateInitCell = beginCell().store(storeStateInit(init)).endCell();
  return {
    address: addr.toString({ bounceable: true }),
    messages: [
      {
        address: addr.toString({ bounceable: true }),
        amount: toNano("0.08").toString(),
        payload: beginCell().storeUint(0, 32).storeStringTail("init").endCell().toBoc().toString("base64"),
        stateInit: stateInitCell.toBoc().toString("base64"),
      },
    ],
  };
}

export function buildUnlockPrivBody(totalCitizens: number): Cell {
  return beginCell()
    .storeUint(OP_UNLOCK_PRIV, 32)
    .storeUint(0, 64)
    .storeUint(Math.trunc(totalCitizens), 32)
    .endCell();
}

export function buildPausePrivBody(): Cell {
  return beginCell().storeUint(OP_PAUSE_PRIV, 32).storeUint(0, 64).endCell();
}

export function buildClaimShareBody(): Cell {
  return beginCell().storeUint(OP_CLAIM_SHARE, 32).storeUint(0, 64).endCell();
}

export function buildBindJettonWalletBody(wallet: string): Cell {
  return beginCell()
    .storeUint(OP_BIND_JETTON_WALLET, 32)
    .storeUint(0, 64)
    .storeAddress(Address.parse(wallet))
    .endCell();
}

export type PrivFundDeploySend = (tx: {
  validUntil: number;
  messages: Array<Record<string, string>>;
}) => Promise<unknown>;

/**
 * Ensure PrivFundModule exists at init(dao, guardian). Anyone may pay deploy.
 */
export async function ensurePrivFundDeployed(opts: {
  dao: string;
  guardian: string;
  sendTransaction: PrivFundDeploySend;
  bindWallet?: string | null;
  forceDeploy?: boolean;
}): Promise<{ address: string; deployedNow: boolean }> {
  const address = privFundModuleAddress(opts.dao, opts.guardian);
  if (!opts.forceDeploy) {
    const live = await fetchPrivFundModuleLive(address);
    if (live.deployed) {
      if (opts.bindWallet && !live.wallet) {
        await opts.sendTransaction({
          validUntil: Math.floor(Date.now() / 1000) + 600,
          messages: [
            {
              address,
              amount: toNano("0.05").toString(),
              payload: buildBindJettonWalletBody(opts.bindWallet).toBoc().toString("base64"),
            },
          ],
        });
      }
      return { address, deployedNow: false };
    }
  }
  const tx = buildPrivFundModuleDeployTx(opts.dao, opts.guardian);
  const messages: Array<Record<string, string>> = [...tx.messages];
  if (opts.bindWallet) {
    messages.push({
      address: tx.address,
      amount: toNano("0.05").toString(),
      payload: buildBindJettonWalletBody(opts.bindWallet).toBoc().toString("base64"),
    });
  }
  await opts.sendTransaction({
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages,
  });
  return { address, deployedNow: true };
}

export function buildPrivFundForwardBody(inner: Cell, moduleAddr: string): Cell {
  return beginCell()
    .storeUint(OP_DEXLP_FORWARD, 32)
    .storeUint(0, 64)
    .storeAddress(Address.parse(moduleAddr))
    .storeRef(inner)
    .endCell();
}

function stackNum(data: Awaited<ReturnType<typeof tcRun>>): number {
  if (!data.ok || data.result?.exit_code !== 0) return 0;
  const stack = data.result.stack as Array<[string, string | number]>;
  const v = stack[0]?.[1];
  return typeof v === "string" ? Number(BigInt(v)) : Number(v ?? 0);
}

function stackAddr(data: Awaited<ReturnType<typeof tcRun>>): string | undefined {
  if (!data.ok || data.result?.exit_code !== 0) return undefined;
  const raw = (data.result.stack as Array<[string, { bytes?: string } | string]>)?.[0]?.[1];
  const boc =
    typeof raw === "object" && raw && "bytes" in raw ? raw.bytes : typeof raw === "string" ? raw : undefined;
  if (!boc) return undefined;
  try {
    return Cell.fromBase64(boc).beginParse().loadAddress().toString({ bounceable: true });
  } catch {
    return undefined;
  }
}

export type PrivFundLive = {
  deployed: boolean;
  dao?: string;
  guardian?: string;
  unlocked: boolean;
  balance: number;
  share: number;
  version: number;
  wallet?: string | null;
};

export async function fetchPrivFundModuleLive(addr: string): Promise<PrivFundLive> {
  const empty: PrivFundLive = { deployed: false, unlocked: false, balance: 0, share: 0, version: 0 };
  try {
    const dao = await tcRun(addr, "get_dao");
    if (!dao.ok || dao.result?.exit_code !== 0) return empty;
    const guardian = await tcRun(addr, "get_guardian");
    const unlocked = await tcRun(addr, "get_unlocked");
    const balance = await tcRun(addr, "get_balance");
    const share = await tcRun(addr, "get_share_per_citizen");
    const version = await tcRun(addr, "get_version");
    const wallet = await tcRun(addr, "get_wallet");
    return {
      deployed: true,
      dao: stackAddr(dao),
      guardian: stackAddr(guardian),
      unlocked: stackNum(unlocked) !== 0,
      balance: stackNum(balance),
      share: stackNum(share),
      version: stackNum(version),
      wallet: stackAddr(wallet) ?? null,
    };
  } catch {
    return empty;
  }
}

export async function fetchPrivFundClaimed(fund: string, voter: string): Promise<boolean | null> {
  try {
    const arg = beginCell().storeAddress(Address.parse(voter)).endCell().toBoc().toString("base64");
    const r = await tcRun(fund, "get_claimed", [["tvm.Slice", arg]]);
    if (!r.ok || r.result?.exit_code !== 0) return null;
    return stackNum(r) !== 0;
  } catch {
    return null;
  }
}

function sameAddr(a: string, b: string) {
  try {
    return Address.parse(a).equals(Address.parse(b));
  } catch {
    return false;
  }
}

/** UI open if hub flag OR PrivFundModule already mod.allow'd. */
export function isPrivFundUiOpen(opts: {
  dao: string;
  guardian: string | null;
  isModuleAllowed: (addr: string) => boolean;
  hubOn: boolean;
}): boolean {
  if (opts.hubOn) return true;
  if (!opts.guardian) return false;
  try {
    const addr = privFundModuleAddress(opts.dao, opts.guardian);
    return opts.isModuleAllowed(addr);
  } catch {
    return false;
  }
}

export function privFundDeployedForDao(live: PrivFundLive | null | undefined, dao: string): boolean {
  return !!(live?.deployed && live.dao && sameAddr(live.dao, dao));
}
