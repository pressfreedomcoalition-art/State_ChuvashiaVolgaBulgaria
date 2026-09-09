/** Playwright e2e: sessionStorage flags — no mainnet TX, mock civic/cache as “testnet”. */

export function isE2eTestnet(): boolean {
  try {
    return sessionStorage.getItem("chv_e2e_testnet") === "1";
  } catch {
    return false;
  }
}

export function e2eWallet(): string {
  try {
    return sessionStorage.getItem("chv_e2e_wallet") || "";
  } catch {
    return "";
  }
}

export function resolveWallet(tonAddress: string | undefined | null): string {
  return (tonAddress || e2eWallet() || "").trim();
}

/** Deterministic voting contract for create→launch→vote e2e. */
export const E2E_MOCK_VOTING = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";
