import { Cell } from "@ton/core";

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
