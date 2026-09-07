/** DeDust swap helpers for DAO token purchase. */
const USDT_TON = "USDT";

export function dedustSwapUrl(from: string, to: string): string {
  const a = encodeURIComponent(from.trim());
  const b = encodeURIComponent(to.trim());
  return `https://dedust.io/swap/${a}/${b}`;
}

/** USDT (TON) → DAO jetton master. */
export function daoTokenDedustBuyUrl(jettonMaster: string): string {
  return dedustSwapUrl(USDT_TON, jettonMaster);
}
