import { Address } from "@ton/core";
import { DAO_ADDRESS } from "./config";
import type { TreasurySnap } from "./civic";
import { cacheGet } from "./civic";

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

/** Live TON + jettons on the DAO container (tonapi). */
export async function fetchTreasuryLive(dao = DAO_ADDRESS): Promise<TreasurySnap> {
  const bounce = Address.parse(dao).toString({ bounceable: true, urlSafe: true });
  const raw = Address.parse(dao).toRawString();

  const [acc, jets] = await Promise.all([
    tonapiGet<{ balance?: string | number }>(`/accounts/${encodeURIComponent(bounce)}`),
    tonapiGet<{
      balances?: Array<{
        balance?: string | number;
        wallet_address?: { address?: string } | string;
        jetton?: { address?: string; symbol?: string; name?: string; decimals?: number | string };
      }>;
    }>(`/accounts/${encodeURIComponent(raw)}/jettons?limit=1000`),
  ]);

  const nano = Number(acc?.balance ?? 0);
  const ton = Number.isFinite(nano) ? nano : 0;

  const jettons: NonNullable<TreasurySnap["jettons"]> = [];
  for (const b of jets?.balances ?? []) {
    const rawBal = Number(b.balance ?? 0);
    if (!Number.isFinite(rawBal) || rawBal <= 0) continue;
    const decimals = Number(b.jetton?.decimals ?? 9);
    const dec = Number.isFinite(decimals) ? decimals : 9;
    let master = b.jetton?.address || "";
    const walletRaw = typeof b.wallet_address === "string" ? b.wallet_address : b.wallet_address?.address;
    let wallet = walletRaw || "";
    try {
      if (master) master = Address.parse(master).toString({ bounceable: true, urlSafe: true });
      if (wallet) wallet = Address.parse(wallet).toString({ bounceable: true, urlSafe: true });
    } catch {
      continue;
    }
    jettons.push({
      master,
      wallet,
      symbol: b.jetton?.symbol || b.jetton?.name || "JETTON",
      amount: rawBal / 10 ** dec,
      decimals: dec,
    });
  }

  jettons.sort((a, b) => Number(b.amount || 0) - Number(a.amount || 0));

  return { ton, jettons };
}

/**
 * Cache-first treasury; on miss / empty — live tonapi read
 * (platform often has no `treasury:` snap for civic DAOs).
 */
export async function loadTreasury(dao = DAO_ADDRESS): Promise<TreasurySnap | null> {
  try {
    return await fetchTreasuryLive(dao);
  } catch {
    /* fall through to cache */
  }

  const cached = await cacheGet<TreasurySnap>(`treasury:${dao}`).catch(() => null);
  if (cached && (cached.ton != null || cached.governance != null || (cached.jettons && cached.jettons.length))) {
    return cached;
  }

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
    return {
      ton: tonCached != null ? Math.round(Number(tonCached) * 1e9) : undefined,
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
