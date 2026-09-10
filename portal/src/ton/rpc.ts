import { Address, beginCell, Cell, Dictionary } from "@ton/core";
import { Buffer } from "buffer";
import type { DaoParam } from "../lib/civic";

const ORBS =
  "https://ton.access.orbs.network/44A1c0ffF586CF870223CcB146Db39F1090fBAaE/1/mainnet/toncenter-api-v2/runGetMethod";

type StackAny = Array<[string, { bytes?: string; num?: string } | string | number]>;

async function tcRun(address: string, method: string, stack: unknown[] = []) {
  const res = await fetch(ORBS, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ address, method, stack }),
  });
  return (await res.json()) as {
    ok?: boolean;
    result?: { exit_code?: number; stack?: StackAny };
  };
}

function parseDaoParamSlice(s: ReturnType<Cell["beginParse"]>): DaoParam {
  const key = s.loadStringRefTail();
  const isString = s.loadBit();
  const num = s.loadIntBig(257);
  const str = s.loadStringRefTail();
  if (isString) return { key, isString, str };
  return {
    key,
    isString,
    num: Number(num),
    numRaw: num.toString(),
    ...(str ? { str } : {}),
  };
}

function paramsFromBoc(boc: string): DaoParam[] {
  const cell =
    /^[0-9a-fA-F]+$/.test(boc) && boc.length % 2 === 0
      ? Cell.fromBoc(Buffer.from(boc, "hex"))[0]
      : Cell.fromBase64(boc);
  const dict = Dictionary.loadDirect(
    Dictionary.Keys.BigInt(257),
    {
      serialize: () => {
        throw new Error("read-only");
      },
      parse: (src) => parseDaoParamSlice(src.loadRef().beginParse()),
    },
    cell,
  );
  return [...dict.values()];
}

function stackNum(data: Awaited<ReturnType<typeof tcRun>>): number | null {
  if (!data.ok || data.result?.exit_code !== 0) return null;
  const raw = data.result.stack?.[0]?.[1];
  try {
    if (typeof raw === "string") return Number(BigInt(raw));
    if (typeof raw === "number") return raw;
    if (raw && typeof raw === "object" && "num" in raw) return Number(BigInt(String(raw.num)));
  } catch {
    /* ignore */
  }
  return null;
}

function stackAddr(data: Awaited<ReturnType<typeof tcRun>>): string | null {
  if (!data.ok || data.result?.exit_code !== 0) return null;
  const boc =
    (data.result.stack?.[0]?.[1] as { bytes?: string })?.bytes ??
    (typeof data.result.stack?.[0]?.[1] === "string" ? data.result.stack[0][1] : null);
  if (!boc || typeof boc !== "string") return null;
  try {
    return Cell.fromBase64(boc).beginParse().loadAddress()!.toString({ bounceable: true, urlSafe: true });
  } catch {
    return null;
  }
}

/** 6.0 salt for next voting address. */
export async function fetchDaoVotingSeqno(container: string): Promise<number | null> {
  for (let i = 0; i < 3; i++) {
    const n = stackNum(await tcRun(container, "get_voting_seqno"));
    if (n != null && Number.isFinite(n)) return n;
    if (i < 2) await new Promise((r) => setTimeout(r, 400 * (i + 1)));
  }
  return null;
}

export async function fetchDaoVersion(container: string): Promise<number> {
  const n = stackNum(await tcRun(container, "get_version"));
  return n != null && n >= 3 ? n : 6;
}

export async function fetchCivicSource(container: string): Promise<string | null> {
  return stackAddr(await tcRun(container, "get_civic_source"));
}

export async function fetchVoteJettonWallet(container: string): Promise<string | null> {
  // get_config item 7 on v6 = voteJettonWallet (optional)
  const data = await tcRun(container, "get_config");
  if (!data.ok || data.result?.exit_code !== 0) return null;
  const stack = data.result.stack || [];
  const boc =
    (stack[7]?.[1] as { bytes?: string })?.bytes ??
    (typeof stack[7]?.[1] === "string" ? stack[7][1] : null);
  if (!boc || typeof boc !== "string") return null;
  try {
    const a = Cell.fromBase64(boc).beginParse().loadAddress();
    return a ? a.toString({ bounceable: true, urlSafe: true }) : null;
  } catch {
    return null;
  }
}

/** On-chain DAO creator (`get_creator`) — DexLP guardian. */
export async function fetchDaoCreator(container: string): Promise<string | null> {
  for (let i = 0; i < 3; i++) {
    const a = stackAddr(await tcRun(container, "get_creator"));
    if (a) return a;
    try {
      const res = await fetch(
        `https://tonapi.io/v2/blockchain/accounts/${encodeURIComponent(container)}/methods/get_creator`,
        { credentials: "omit" },
      );
      if (res.ok) {
        const j = (await res.json()) as {
          success?: boolean;
          stack?: Array<{ type?: string; cell?: string }>;
        };
        const boc = j.stack?.[0]?.cell;
        if (j.success && boc) {
          const cell =
            /^[0-9a-fA-F]+$/.test(boc) && boc.length % 2 === 0
              ? Cell.fromBoc(Buffer.from(boc, "hex"))[0]
              : Cell.fromBase64(boc);
          const addr = cell.beginParse().loadAddress();
          if (addr) return Address.parse(addr.toString()).toString({ bounceable: true, urlSafe: true });
        }
      }
    } catch {
      /* next */
    }
    if (i < 2) await new Promise((r) => setTimeout(r, 400 * (i + 1)));
  }
  return null;
}

/** LightVoting `get_voted(voter)` — best-effort; civic nullifier votes may not show here. */
export async function fetchVotingHasVoted(voting: string, voter: string): Promise<boolean | null> {
  try {
    const voterCell = beginCell().storeAddress(Address.parse(voter)).endCell().toBoc().toString("base64");
    const data = await tcRun(voting, "get_voted", [["tvm.Slice", voterCell]]);
    const n = stackNum(data);
    if (n != null) return n !== 0;
  } catch {
    /* try tonapi */
  }
  try {
    const res = await fetch(
      `https://tonapi.io/v2/blockchain/accounts/${encodeURIComponent(voting)}/methods/get_voted`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "omit",
        body: JSON.stringify({ args: [voter] }),
      },
    );
    if (!res.ok) return null;
    const j = (await res.json()) as {
      success?: boolean;
      decoded?: { voted?: boolean } | boolean;
      stack?: Array<{ type?: string; num?: string; value?: string | boolean }>;
    };
    if (!j.success) return null;
    if (typeof j.decoded === "boolean") return j.decoded;
    if (j.decoded && typeof j.decoded === "object" && "voted" in j.decoded) return !!j.decoded.voted;
    const top = j.stack?.[0];
    if (typeof top?.value === "boolean") return top.value;
    if (top?.num != null) return Number(top.num) !== 0;
  } catch {
    return null;
  }
  return null;
}

/** Privatization child + unlocked flag (`get_privatization_fund` / `get_unlocked`). */
export async function fetchPrivatizationStatus(container: string): Promise<{
  fund: string | null;
  live: boolean;
}> {
  const fund = await stackAddr(await tcRun(container, "get_privatization_fund"));
  if (!fund) return { fund: null, live: false };
  const unlocked = stackNum(await tcRun(fund, "get_unlocked"));
  return { fund, live: unlocked != null && unlocked !== 0 };
}

/** Child treasury top-up fund (`get_treasury_topup_fund`). */
export async function fetchTreasuryTopupFund(container: string): Promise<string | null> {
  return stackAddr(await tcRun(container, "get_treasury_topup_fund"));
}

/**
 * Full params dict from chain (`get_params`).
 * Civic `params:` snapshots can be truncated — never treat a 1-row list as complete.
 */
export async function fetchDaoParamsOnChain(container: string): Promise<DaoParam[]> {
  const fromOrbs = await tcRun(container, "get_params");
  if (fromOrbs.ok && fromOrbs.result?.exit_code === 0) {
    const top = fromOrbs.result.stack?.[0];
    const boc =
      (top?.[1] as { bytes?: string })?.bytes ?? (typeof top?.[1] === "string" ? top[1] : null);
    if (boc) {
      try {
        return paramsFromBoc(boc);
      } catch {
        /* fall through */
      }
    }
  }
  const res = await fetch(
    `https://tonapi.io/v2/blockchain/accounts/${encodeURIComponent(container)}/methods/get_params`,
    { credentials: "omit" },
  );
  if (!res.ok) throw new Error(`get_params ${res.status}`);
  const j = (await res.json()) as {
    success?: boolean;
    stack?: Array<{ type?: string; cell?: string }>;
  };
  const boc = j.stack?.[0]?.cell;
  if (!j.success || !boc) return [];
  return paramsFromBoc(boc);
}
