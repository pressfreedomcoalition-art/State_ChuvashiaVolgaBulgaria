import { Address } from "@ton/core";
import { DAO_ADDRESS } from "./config";
import type { TreasurySnap } from "./civic";
import { cacheGet } from "./civic";

const BLC_MASTER = "EQD_tFz9JQRVZNMgy3bzvnzei9deo9qc5NMtumG4_sx1zZRc";

type JettonRow = NonNullable<TreasurySnap["jettons"]>[number];

async function sleep(ms: number) {
  await new Promise((r) => setTimeout(r, ms));
}

function bounce(addr: string): string {
  return Address.parse(addr).toString({ bounceable: true, urlSafe: true });
}

function raw(addr: string): string {
  return Address.parse(addr).toRawString();
}

function nanoToHuman(nano: number, decimals: number): number {
  return nano / 10 ** decimals;
}

async function tonapiGet<T>(path: string): Promise<T | null> {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(`https://tonapi.io/v2${path}`, { credentials: "omit" });
      if (res.status === 404) return null;
      if (res.status === 429 || res.status >= 500) {
        await sleep(400 * (i + 1));
        continue;
      }
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      await sleep(300 * (i + 1));
    }
  }
  return null;
}

/** Toncenter v3 — CORS * and often reachable when tonapi.io is blocked (RF / TG). */
async function toncenterGet<T>(path: string): Promise<T | null> {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(`https://toncenter.com/api/v3${path}`, { credentials: "omit" });
      if (res.status === 404) return null;
      if (res.status === 429 || res.status >= 500) {
        await sleep(400 * (i + 1));
        continue;
      }
      if (!res.ok) return null;
      return (await res.json()) as T;
    } catch {
      await sleep(300 * (i + 1));
    }
  }
  return null;
}

function isEmptySnap(s: TreasurySnap | null | undefined): boolean {
  if (!s) return true;
  const ton = Number(s.ton ?? s.governance ?? 0);
  const jets = s.jettons?.length ?? 0;
  return (!Number.isFinite(ton) || ton <= 0) && jets === 0;
}

async function fetchViaTonapi(dao: string): Promise<TreasurySnap | null> {
  const b = bounce(dao);
  const r = raw(dao);
  const [acc, jets] = await Promise.all([
    tonapiGet<{ balance?: string | number }>(`/accounts/${encodeURIComponent(b)}`),
    tonapiGet<{
      balances?: Array<{
        balance?: string | number;
        wallet_address?: { address?: string } | string;
        jetton?: { address?: string; symbol?: string; name?: string; decimals?: number | string };
      }>;
    }>(`/accounts/${encodeURIComponent(r)}/jettons?limit=1000`),
  ]);

  // Both failed → not a valid empty treasury (likely network / 429).
  if (!acc && !jets) return null;

  const nano = Number(acc?.balance ?? 0);
  const jettons: JettonRow[] = [];
  for (const row of jets?.balances ?? []) {
    const rawBal = Number(row.balance ?? 0);
    if (!Number.isFinite(rawBal) || rawBal <= 0) continue;
    const decimals = Number(row.jetton?.decimals ?? 9);
    const dec = Number.isFinite(decimals) ? decimals : 9;
    let master = row.jetton?.address || "";
    const walletRaw =
      typeof row.wallet_address === "string" ? row.wallet_address : row.wallet_address?.address;
    let wallet = walletRaw || "";
    try {
      if (master) master = bounce(master);
      if (wallet) wallet = bounce(wallet);
    } catch {
      continue;
    }
    jettons.push({
      master,
      wallet,
      symbol: row.jetton?.symbol || row.jetton?.name || "JETTON",
      amount: nanoToHuman(rawBal, dec),
      decimals: dec,
    });
  }
  jettons.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
  return {
    ton: Number.isFinite(nano) ? nano : 0,
    jettons,
  };
}

async function fetchViaToncenter(dao: string): Promise<TreasurySnap | null> {
  const b = bounce(dao);
  const [states, jw] = await Promise.all([
    toncenterGet<{
      accounts?: Array<{ balance?: string | number }>;
    }>(`/accountStates?address=${encodeURIComponent(b)}`),
    toncenterGet<{
      jetton_wallets?: Array<{
        address?: string;
        balance?: string | number;
        jetton?: string;
      }>;
      address_book?: Record<string, { user_friendly?: string }>;
      metadata?: Record<
        string,
        {
          token_info?: Array<{
            type?: string;
            name?: string;
            symbol?: string;
            extra?: { decimals?: number | string };
          }>;
        }
      >;
    }>(`/jetton/wallets?owner_address=${encodeURIComponent(b)}&limit=50`),
  ]);

  if (!states && !jw) return null;

  const nano = Number(states?.accounts?.[0]?.balance ?? 0);
  const book = jw?.address_book || {};
  const meta = jw?.metadata || {};
  const jettons: JettonRow[] = [];

  for (const w of jw?.jetton_wallets ?? []) {
    const rawBal = Number(w.balance ?? 0);
    if (!Number.isFinite(rawBal) || rawBal <= 0) continue;
    const masterRaw = w.jetton || "";
    if (!masterRaw) continue;
    const info = meta[masterRaw]?.token_info?.find((t) => t.type === "jetton_masters");
    const decimals = Number(info?.extra?.decimals ?? 9);
    const dec = Number.isFinite(decimals) ? decimals : 9;
    let master = book[masterRaw]?.user_friendly || masterRaw;
    let wallet = book[w.address || ""]?.user_friendly || w.address || "";
    try {
      master = bounce(master);
      if (wallet) wallet = bounce(wallet);
    } catch {
      continue;
    }
    jettons.push({
      master,
      wallet,
      symbol: info?.symbol || info?.name || "JETTON",
      amount: nanoToHuman(rawBal, dec),
      decimals: dec,
    });
  }

  // Ensure BLC shows even if metadata lag — match by known master.
  const blcBounce = bounce(BLC_MASTER);
  if (!jettons.some((j) => j.master && bounce(j.master) === blcBounce)) {
    const blcWallet = (jw?.jetton_wallets ?? []).find((w) => {
      try {
        return w.jetton && bounce(w.jetton) === blcBounce;
      } catch {
        return false;
      }
    });
    if (blcWallet) {
      const rawBal = Number(blcWallet.balance ?? 0);
      if (rawBal > 0) {
        let wallet = book[blcWallet.address || ""]?.user_friendly || blcWallet.address || "";
        try {
          if (wallet) wallet = bounce(wallet);
        } catch {
          wallet = "";
        }
        jettons.push({
          master: blcBounce,
          wallet,
          symbol: "BLC",
          amount: nanoToHuman(rawBal, 9),
          decimals: 9,
        });
      }
    }
  }

  jettons.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));
  return {
    ton: Number.isFinite(nano) ? nano : 0,
    jettons,
  };
}

/** Live TON + jettons on the DAO container (tonapi → toncenter). */
export async function fetchTreasuryLive(dao = DAO_ADDRESS): Promise<TreasurySnap> {
  const viaApi = await fetchViaTonapi(dao);
  if (viaApi && !isEmptySnap(viaApi)) return viaApi;

  const viaTc = await fetchViaToncenter(dao);
  if (viaTc && !isEmptySnap(viaTc)) return viaTc;

  // Prefer partial tonapi over empty (e.g. ton ok, jettons miss).
  if (viaApi) return viaApi;
  if (viaTc) return viaTc;
  throw new Error("treasury_read_failed");
}

/**
 * Live tonapi/toncenter first; on miss / empty / failure — cache.
 * Never invent a false zero treasury when the read failed.
 */
export async function loadTreasury(dao = DAO_ADDRESS): Promise<TreasurySnap | null> {
  try {
    return await fetchTreasuryLive(dao);
  } catch {
    /* fall through */
  }

  const cached = await cacheGet<TreasurySnap>(`treasury:${dao}`).catch(() => null);
  if (cached && !isEmptySnap(cached)) return cached;

  const [tonCached, jetCached] = await Promise.all([
    cacheGet<number>(`treasuryTon:${dao}`).catch(() => null),
    cacheGet<
      Array<{
        master?: string;
        wallet?: string;
        symbol?: string;
        balance?: number;
        decimals?: number;
        amount?: number;
      }>
    >(`treasuryJettons:${dao}`).catch(() => null),
  ]);

  if (tonCached != null || (jetCached && jetCached.length)) {
    // DAO cache often stores human TON; UI treats >1e6 as nano.
    const tonNum = Number(tonCached);
    const tonNano = Number.isFinite(tonNum) && tonNum < 1e6 ? Math.round(tonNum * 1e9) : tonNum;
    return {
      ton: tonCached != null ? tonNano : undefined,
      jettons: (jetCached || []).map((j) => ({
        master: j.master,
        wallet: j.wallet,
        symbol: j.symbol,
        amount: j.amount ?? j.balance,
        decimals: j.decimals,
      })),
    };
  }

  return cached;
}
