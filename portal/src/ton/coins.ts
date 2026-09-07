/** Whole+fractional coins → raw jetton units. */
export function toJettonUnits(amount: number, decimals: number): bigint {
  if (!Number.isFinite(amount) || amount < 0) return 0n;
  const [whole, frac = ""] = String(amount).replace(",", ".").split(".");
  const neg = whole.startsWith("-");
  const w = (neg ? whole.slice(1) : whole) || "0";
  if (!/^\d+$/.test(w) || (frac && !/^\d+$/.test(frac))) {
    return BigInt(Math.round(amount * 10 ** decimals));
  }
  const fracPadded = (frac + "0".repeat(decimals)).slice(0, decimals);
  const raw = BigInt(w) * 10n ** BigInt(decimals) + BigInt(fracPadded || "0");
  return neg ? -raw : raw;
}
