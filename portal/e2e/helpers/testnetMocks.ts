import type { Page } from "@playwright/test";

/** Fake TON wallet for e2e (no TonConnect). */
export const E2E_WALLET = "EQDtFpEwcFAEcRe5mLVh2N6C0y-_yrECpwzXtFMkJtPa5YdY";
export const E2E_DAO = "EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx";
export const E2E_VOTING = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";
export const E2E_OPT_YES = "EQD__________________________________________0vo";
export const E2E_OPT_NO = "EQC__________________________________________1vo";
export const E2E_CIVIC = "EQBCivicSourceTestnet00000000000000000000000001";
export const E2E_HUB = "EQBCitizenshipHubTest00000000000000000000000001";
export const E2E_PATH_PAY = "EQBPathPayTestnet000000000000000000000000000001";
export const E2E_JETTON = "EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs";

const PARAMS = [
  { key: "cit.path.pay", num: 1 },
  {
    key: "cit.path.pay.amount",
    num: 1_000_000_000,
    numRaw: "1000000000",
    str: E2E_JETTON,
    isString: true,
  },
  { key: "cit.path.docs", num: 1 },
  { key: "cit.path.docs.policy", str: JSON.stringify({ enabled: true, mode: "birth_or_reg" }), isString: true },
  { key: "cit.path.lang", num: 1 },
  { key: "cit.path.lang.quorum", num: 3 },
  { key: "cit.path.wallet", num: 1 },
  { key: "cit.path.wallet.policy", str: JSON.stringify({ enabled: true, sourceDao: E2E_DAO }), isString: true },
  { key: "short_url", str: "chv-e2e", isString: true },
];

const VOTINGS = [
  {
    address: E2E_VOTING,
    voting: E2E_VOTING,
    title: "E2E референдум",
    description: "mock voting",
    status: "active",
    options: [
      { address: E2E_OPT_YES, title: "За", votes: 2 },
      { address: E2E_OPT_NO, title: "Против", votes: 1 },
    ],
  },
];

const DEPUTIES = [
  { address: E2E_WALLET, name: "Депутат E2E", bio: "testnet mock", votes: 12 },
];

function envelope(value: unknown) {
  return { ok: true, at: Date.now(), value };
}

function cacheValue(key: string): unknown {
  if (key.startsWith("params:")) return PARAMS;
  if (key.startsWith("votings:")) return VOTINGS;
  if (key.startsWith("daoConfig:")) {
    return { name: "Чувашия E2E", title: "Чувашия E2E", voteJettonMaster: E2E_JETTON, minQuorum: 1 };
  }
  if (key.startsWith("containerSides:")) return [E2E_CIVIC, E2E_HUB, E2E_PATH_PAY];
  if (key.startsWith("deputyProfiles:")) return DEPUTIES;
  if (key.startsWith("votingState:") || key.startsWith("votingMeta:")) {
    return {
      status: "active",
      title: "E2E референдум",
      description: "mock voting",
      options: [
        { address: E2E_OPT_YES, title: "За", votes: 2 },
        { address: E2E_OPT_NO, title: "Против", votes: 1 },
      ],
    };
  }
  if (key.startsWith("treasury:")) {
    return { ton: "1.5", jettons: [{ symbol: "USDT", amount: "10" }] };
  }
  return null;
}

/** Install civic/cache mocks + block mainnet RPC (testnet substitute). */
export async function installTestnetMocks(page: Page) {
  await page.route(/tonapi\.io|ton\.access\.orbs|toncenter/i, (route) => route.abort());

  await page.route(/\/(cache|civic)\//, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname.replace(/^\/(cache|civic)/, "") || url.pathname;
    const method = req.method();

    // health / public
    if (path.endsWith("/health") || path.includes("/v1/public")) {
      await route.fulfill({ json: { ok: true, name: "e2e-testnet" } });
      return;
    }
    if (path.includes("/v1/citizenship/count")) {
      await route.fulfill({ json: { ok: true, count: 42 } });
      return;
    }
    if (path.includes("/v1/platform/kyc-tariff")) {
      await route.fulfill({ json: { ok: true, feeFloorUsdt: 1.62, defaultFeeSymbol: "USDT" } });
      return;
    }

    // cache peek / list / refresh
    if (path.includes("/v1/cache/")) {
      const key =
        url.searchParams.get("key") ||
        (method === "POST" ? String((await req.postDataJSON().catch(() => ({}))).key || "") : "");
      const value = cacheValue(key);
      if (value == null && path.includes("list")) {
        await route.fulfill({ status: 404, json: { ok: false, error: "miss" } });
        return;
      }
      await route.fulfill({ json: envelope(value) });
      return;
    }

    if (path.includes("/v1/passport/issue")) {
      await route.fulfill({
        json: {
          ok: true,
          credential: "e2e.credential.jwt",
          holderDid: "did:key:e2e",
          nfs: "nfs-e2e",
          audience: "blc-civic-verifier",
        },
      });
      return;
    }
    if (path.includes("/v1/passport/backup")) {
      await route.fulfill({ json: { ok: true, phrase: "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about" } });
      return;
    }
    if (path.includes("/v1/citizenship/status")) {
      await route.fulfill({
        json: { ok: true, citizen: false, commit: "aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899", paths: [] },
      });
      return;
    }
    if (path.includes("/v1/citizenship/claim-pay")) {
      await route.fulfill({ json: { ok: true, paths: ["pay"], citizen: true } });
      return;
    }
    if (path.includes("/v1/citizenship/claim-wallet")) {
      await route.fulfill({ json: { ok: true, paths: ["wallet"], citizen: true } });
      return;
    }
    if (path.includes("/v1/citizenship/claim-docs")) {
      await route.fulfill({ json: { ok: true, citizen: true, paths: ["docs"] } });
      return;
    }
    if (path.includes("/v1/vote")) {
      await route.fulfill({ json: { ok: true } });
      return;
    }
    if (path.includes("/v1/gas/status")) {
      await route.fulfill({ json: { ok: true, balanceTon: 0.05, nano: "50000000" } });
      return;
    }

    await route.fulfill({ json: { ok: true } });
  });
}

/** Enable e2e testnet mode (skip chain TX) + optional citizen/wallet/vault. */
export async function enableE2eSession(
  page: Page,
  opts: { citizen?: boolean; wallet?: boolean; vault?: boolean; presentation?: boolean } = {},
) {
  const citizen = opts.citizen !== false;
  const wallet = opts.wallet !== false;
  const vault = opts.vault !== false;
  const presentation = opts.presentation !== false;
  await page.addInitScript(
    ({ citizen, wallet, vault, presentation, w, present }) => {
      sessionStorage.setItem("chv_e2e_testnet", "1");
      if (citizen) sessionStorage.setItem("chv-citizen", "1");
      if (wallet) sessionStorage.setItem("chv_e2e_wallet", w);
      if (presentation) sessionStorage.setItem("chv_session_presentation", present);
      if (vault) {
        localStorage.setItem(
          "chv_passport_vault_v1",
          JSON.stringify({
            credential: "e2e.credential.jwt",
            holderPrivateJwk: { kty: "EC", crv: "P-256", x: "AA", y: "AA", d: "AA" },
            holderDid: "did:key:e2e",
            nfs: "nfs-e2e",
            audience: "blc-civic-verifier",
          }),
        );
      }
    },
    {
      citizen,
      wallet,
      vault,
      presentation,
      w: E2E_WALLET,
      present: "e2e.credential.jwt~e2e.kb.jwt",
    },
  );
}
