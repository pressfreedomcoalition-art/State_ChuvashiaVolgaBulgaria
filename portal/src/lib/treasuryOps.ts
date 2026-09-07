import { Address, beginCell, Cell, contractAddress, storeStateInit, toNano } from "@ton/core";
import { Buffer } from "buffer";
import { DAO_ADDRESS, civicBase } from "./config";
import type { DaoParam } from "./civic";
import { CHAINWALLET_CODE_B64 } from "../ton/chainWalletCode.generated";
import { DEXLP_CODE_B64 } from "../ton/dexLpCode.generated";

export type TreasuryTxRow = {
  id: string;
  at: number;
  title: string;
  detail?: string;
  amount?: string;
  failed?: boolean;
};

export type ConvertStatus = {
  enabled?: boolean;
  hotWallet?: string;
  minTon?: number;
  bufferTon?: number;
  auto?: boolean;
  buffer?: string;
};

async function tonapiGet<T>(path: string): Promise<T | null> {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(`https://tonapi.io/v2${path}`, { credentials: "omit" });
      if (res.status === 404) return null;
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 400 * (i + 1)));
        continue;
      }
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
  return null;
}

export async function fetchTreasuryTxHistory(dao = DAO_ADDRESS, limit = 30): Promise<TreasuryTxRow[]> {
  const raw = Address.parse(dao).toRawString();
  const data = await tonapiGet<{
    events?: Array<{
      event_id?: string;
      timestamp?: number;
      actions?: Array<{
        type?: string;
        status?: string;
        simple_preview?: { name?: string; description?: string; value?: string };
      }>;
    }>;
  }>(`/accounts/${encodeURIComponent(raw)}/events?limit=${Math.min(50, Math.max(5, limit))}`);
  const rows: TreasuryTxRow[] = [];
  for (const ev of data?.events || []) {
    const id = ev.event_id || `t${ev.timestamp || 0}`;
    const at = Number(ev.timestamp) || 0;
    const actions = ev.actions || [];
    if (!actions.length) {
      rows.push({ id, at, title: "tx" });
      continue;
    }
    actions.forEach((a, i) => {
      rows.push({
        id: `${id}:${i}`,
        at,
        title: (a.simple_preview?.name || a.type || "tx").trim(),
        detail: a.simple_preview?.description?.trim() || undefined,
        amount: a.simple_preview?.value?.trim() || undefined,
        failed: a.status === "failed",
      });
    });
  }
  return rows;
}

export function tonscanAccountUrl(dao = DAO_ADDRESS) {
  return `https://tonviewer.com/${Address.parse(dao).toString({ bounceable: true, urlSafe: true })}`;
}

export const FUND_CONVERT_TON_MIN_PARAM = "fund.convert.ton.min";

export function fundConvertMinNano(p: DaoParam | null | undefined): number {
  if (!p) return 0;
  if (p.isString) {
    const s = (p.str || "").trim().toLowerCase();
    if (!s || s === "-" || s === "0" || s === "false" || s === "off") return 0;
    const n = Number(s);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  }
  const n = Number(p.numRaw ?? p.num ?? 0);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
}

export function isFundConvertEnabled(p: DaoParam | null | undefined) {
  return fundConvertMinNano(p) > 0;
}

export function tonToNano(ton: number): number {
  if (!Number.isFinite(ton) || ton <= 0) return 0;
  return Math.round(ton * 1e9);
}

export function nanoToTon(nano: number): number {
  if (!Number.isFinite(nano) || nano <= 0) return 0;
  return nano / 1e9;
}

export async function fetchConvertStatus(dao = DAO_ADDRESS): Promise<ConvertStatus | null> {
  try {
    const res = await fetch(`${civicBase()}/v1/convert/status?dao=${encodeURIComponent(dao)}`, {
      credentials: "omit",
    });
    if (!res.ok) return null;
    return (await res.json()) as ConvertStatus;
  } catch {
    return null;
  }
}

export function moduleAddrRaw(addr: string): bigint {
  return BigInt("0x" + Address.parse(addr).hash.toString("hex"));
}

/** Scan full params list (same key may appear more than once). */
export function isModuleAllowed(params: readonly DaoParam[], moduleAddr: string): boolean {
  if (!moduleAddr.trim()) return false;
  let want: bigint;
  try {
    want = moduleAddrRaw(moduleAddr);
  } catch {
    return false;
  }
  const matches = (p: DaoParam) => {
    if (p.str?.trim()) {
      try {
        if (Address.parse(p.str).equals(Address.parse(moduleAddr))) return true;
      } catch {
        /* */
      }
    }
    if (p.numRaw != null) {
      try {
        if (BigInt(p.numRaw) === want) return true;
      } catch {
        /* */
      }
    } else if (p.num != null && Number.isFinite(p.num)) {
      try {
        if (BigInt(Math.trunc(p.num)) === want) return true;
      } catch {
        /* */
      }
    }
    return false;
  };
  for (const p of params) {
    if (p.key === "mod.deny" && matches(p)) return false;
  }
  for (const p of params) {
    if (p.key === "mod.allow" && matches(p)) return true;
  }
  return false;
}

export type ModExecKind =
  | "returnJetton"
  | "returnTon"
  | "sendJetton"
  | "sendNft"
  | "forward"
  | "dedustBurn";

export function modAllowParamKey(deny: boolean): "mod.allow" | "mod.deny" {
  return deny ? "mod.deny" : "mod.allow";
}

export function modExecParamKey(kind: ModExecKind): string {
  if (kind === "dedustBurn") return "mod.exec.forward";
  return `mod.exec.${kind}`;
}

export const OP_JETTON_BURN = 0x595f07bc;

export function buildJettonBurnBody(amountNano: bigint, responseDestination: string, queryId = 0n): Cell {
  return beginCell()
    .storeUint(OP_JETTON_BURN, 32)
    .storeUint(queryId, 64)
    .storeCoins(amountNano)
    .storeAddress(Address.parse(responseDestination))
    .storeBit(false)
    .endCell();
}

export function parseBodyBoc(input: string): Cell | null {
  const raw = input.trim().replace(/\s+/g, "");
  if (!raw) return null;
  try {
    if (/^[0-9a-fA-F]+$/.test(raw) && raw.length % 2 === 0) {
      return Cell.fromBoc(Buffer.from(raw, "hex"))[0] ?? null;
    }
    return Cell.fromBase64(raw);
  } catch {
    return null;
  }
}

async function sha256(data: Uint8Array): Promise<Uint8Array> {
  const buf = await crypto.subtle.digest("SHA-256", data as BufferSource);
  return new Uint8Array(buf);
}

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function b58decode(s: string): Uint8Array | null {
  const bytes: number[] = [0];
  for (const ch of s) {
    const val = B58.indexOf(ch);
    if (val < 0) return null;
    let carry = val;
    for (let i = 0; i < bytes.length; i++) {
      carry += bytes[i] * 58;
      bytes[i] = carry & 0xff;
      carry >>= 8;
    }
    while (carry > 0) {
      bytes.push(carry & 0xff);
      carry >>= 8;
    }
  }
  let pad = 0;
  for (const ch of s) {
    if (ch !== "1") break;
    pad++;
  }
  const out = new Uint8Array(pad + bytes.length);
  for (let i = 0; i < bytes.length; i++) out[out.length - 1 - i] = bytes[i];
  return out;
}

export async function tronDestBytes(input: string): Promise<Uint8Array | null> {
  const s = input.trim();
  if (!s.startsWith("T") || s.length < 30) return null;
  const decoded = b58decode(s);
  if (!decoded || decoded.length < 25) return null;
  const body = decoded.subarray(0, decoded.length - 4);
  const sum = decoded.subarray(decoded.length - 4);
  const h1 = await sha256(body);
  const h2 = await sha256(h1);
  if (sum[0] !== h2[0] || sum[1] !== h2[1] || sum[2] !== h2[2] || sum[3] !== h2[3]) return null;
  if (body[0] !== 0x41) return null;
  return body;
}

export function humanAmountToUnits(human: string, decimals: number): bigint | null {
  const s = human.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(s)) return null;
  const [a, b = ""] = s.split(".");
  if (b.length > decimals) return null;
  const frac = b.padEnd(decimals, "0");
  try {
    return BigInt(a + frac);
  } catch {
    return null;
  }
}

export function buildChainEnqueueBody(opts: {
  chainId: number;
  nonce: bigint;
  decimals: number;
  amount: bigint;
  dest: Uint8Array;
}): Cell {
  return beginCell()
    .storeUint(1, 8)
    .storeUint(0, 8)
    .storeUint(opts.chainId, 8)
    .storeUint(opts.nonce, 64)
    .storeUint(opts.decimals, 8)
    .storeUint(opts.amount, 128)
    .storeRef(beginCell().storeBuffer(Buffer.from(opts.dest)).endCell())
    .endCell();
}

export const CHAIN_TRC20 = 3;

function chainWalletStateInit(dao: string) {
  const code = Cell.fromBase64(CHAINWALLET_CODE_B64);
  const tail = beginCell().storeBit(false).storeBit(false).storeBit(false).endCell();
  return {
    code,
    data: beginCell().storeAddress(Address.parse(dao)).storeBit(false).storeRef(tail).endCell(),
  };
}

export function chainWalletAddress(dao = DAO_ADDRESS): string {
  return contractAddress(0, chainWalletStateInit(dao)).toString({ bounceable: true, urlSafe: true });
}

export function buildChainWalletDeployTx(dao = DAO_ADDRESS) {
  const init = chainWalletStateInit(dao);
  const addr = contractAddress(0, init);
  const stateInitCell = beginCell().store(storeStateInit(init)).endCell();
  return {
    address: addr.toString({ bounceable: true, urlSafe: true }),
    validUntil: Math.floor(Date.now() / 1000) + 360,
    messages: [
      {
        address: addr.toString({ bounceable: true, urlSafe: true }),
        amount: toNano("0.15").toString(),
        payload: beginCell().storeUint(0, 32).storeStringTail("init").endCell().toBoc().toString("base64"),
        stateInit: stateInitCell.toBoc().toString("base64"),
      },
    ],
  };
}

function dexLpStateInit(dao: string, guardian: string) {
  return {
    code: Cell.fromBase64(DEXLP_CODE_B64),
    data: beginCell()
      .storeAddress(Address.parse(dao))
      .storeAddress(Address.parse(guardian))
      .endCell(),
  };
}

export function dexLpAddress(dao: string, guardian: string): string {
  return contractAddress(0, dexLpStateInit(dao, guardian)).toString({ bounceable: true, urlSafe: true });
}

export function buildDexLpDeployTx(dao: string, guardian: string) {
  const init = dexLpStateInit(dao, guardian);
  const addr = contractAddress(0, init);
  const stateInitCell = beginCell().store(storeStateInit(init)).endCell();
  return {
    address: addr.toString({ bounceable: true, urlSafe: true }),
    validUntil: Math.floor(Date.now() / 1000) + 360,
    messages: [
      {
        address: addr.toString({ bounceable: true, urlSafe: true }),
        amount: toNano("0.05").toString(),
        payload: beginCell().storeUint(0, 32).storeStringTail("init").endCell().toBoc().toString("base64"),
        stateInit: stateInitCell.toBoc().toString("base64"),
      },
    ],
  };
}
