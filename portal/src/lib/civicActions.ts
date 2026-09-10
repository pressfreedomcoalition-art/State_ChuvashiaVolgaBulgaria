import { Address, beginCell, toNano } from "@ton/core";
import { DAO_ADDRESS } from "./config";
import { cacheGet } from "./civic";
import { civicFetch, civicPostJson } from "./civicFetch";
import { ensurePresentation, issuePassport } from "./passport";
import { parseContainerSides, resolveJettonWallet } from "./tonResolve";
import { t, getLang } from "./i18n";
import { isE2eTestnet } from "./e2eHooks";
import { buildTextComment } from "../ton/createVoting";

function reason(key: string) {
  return t(getLang(), key);
}

/** Minimal sendTransaction surface from TonConnectUI. */
type TonTxUi = {
  sendTransaction: (tx: {
    validUntil: number;
    messages: Array<{ address: string; amount: string; payload?: string }>;
  }) => Promise<unknown>;
};

const OP_CLAIM_PAY = 0x5adc0011;

async function civicPost<T>(path: string, body: unknown): Promise<T> {
  return civicPostJson<T>(path, body);
}

/** TonConnect often yields UQ… — verifier expects bounceable EQ…. */
function bounceableAddr(addr: string): string {
  try {
    return Address.parse(addr).toString({ bounceable: true, urlSafe: true });
  } catch {
    return addr;
  }
}

export async function resolveDaoModules(dao = DAO_ADDRESS) {
  const sides = await cacheGet<string[]>(`containerSides:${dao}`);
  const parsed = parseContainerSides(sides);
  if (parsed.citizenshipHub) return parsed;
  // Last resort: platform peek (own cache may be warm for params but empty for sides).
  try {
    const peekPath = `/v1/cache/peek?key=${encodeURIComponent(`containerSides:${dao}`)}`;
    const res = await civicFetch(peekPath);
    if (res.ok) {
      const j = (await res.json()) as { ok?: boolean; value?: string[] };
      if (j?.ok && Array.isArray(j.value) && j.value.length) {
        return parseContainerSides(j.value);
      }
    }
  } catch {
    /* keep empty */
  }
  return parsed;
}

export async function fetchCitizenshipStatus(dao = DAO_ADDRESS) {
  const presentation = await ensurePresentation({ reason: reason("unlockReasonStatus") });
  return civicPost<{
    ok: boolean;
    citizen?: boolean;
    status?: string;
    paths?: string[];
    commit?: string;
    kyc?: { status?: string; accessToken?: string; provider?: string };
  }>("/v1/citizenship/status", { presentation, dao });
}

export async function castCivicVote(opts: {
  voting: string;
  optionAddress: string;
  voter: string;
  civicSource?: string;
}) {
  const presentation = await ensurePresentation({
    voting: opts.voting,
    reason: reason("unlockReasonVote"),
  });
  let civicSource = opts.civicSource;
  if (!civicSource) {
    const mods = await resolveDaoModules();
    civicSource = mods.civicSource;
  }
  if (!civicSource) throw new Error("civic_source_missing");
  return civicPost<{ ok: boolean }>("/v1/vote", {
    presentation,
    voter: opts.voter,
    voting: opts.voting,
    dao: DAO_ADDRESS,
    civicSource,
    optionAddress: opts.optionAddress,
  });
}

export async function fetchGasStatus() {
  const presentation = await ensurePresentation({ reason: reason("unlockReasonGas") });
  return civicPost<{ ok: boolean; balanceTon?: number; nano?: string }>("/v1/gas/status", {
    presentation,
  });
}

export type DelegationStatus = {
  ok: boolean;
  myCommit?: string | null;
  delegateTo?: string | null;
  weight?: number;
  incoming?: string[] | number;
  effectiveWeight?: number;
};

function normCommit(h: string): string {
  return h.replace(/^0x/, "").toLowerCase().padStart(64, "0");
}

export function normalizePassportCommit(h: string | undefined | null): string {
  if (!h) return "";
  return normCommit(h);
}

export async function fetchDelegationStatus() {
  const presentation = await ensurePresentation({ reason: reason("unlockReasonDelegation") });
  return civicPost<DelegationStatus>("/v1/delegation/status", {
    presentation,
    dao: DAO_ADDRESS,
  });
}

export async function setVoteDelegation(toCommit: string) {
  const presentation = await ensurePresentation({ reason: reason("unlockReasonDelegation") });
  return civicPost<DelegationStatus>("/v1/delegation/set", {
    presentation,
    dao: DAO_ADDRESS,
    toCommit: normCommit(toCommit),
  });
}

export async function revokeVoteDelegation() {
  const presentation = await ensurePresentation({ reason: reason("unlockReasonDelegation") });
  return civicPost<DelegationStatus>("/v1/delegation/revoke", {
    presentation,
    dao: DAO_ADDRESS,
  });
}

const GAS_PENDING_KEY = "chv_gas_pending_v1";
const GAS_MIN_TON = 0.05;

type GasPending = { ticket: string; memo: string; fromWallet: string; at: number };

function saveGasPending(p: GasPending) {
  try {
    localStorage.setItem(GAS_PENDING_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

function readGasPending(): GasPending | null {
  try {
    const raw = localStorage.getItem(GAS_PENDING_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as GasPending;
    if (!j?.ticket || !j?.fromWallet) return null;
    if (Date.now() - (j.at || 0) > 48 * 3600_000) {
      localStorage.removeItem(GAS_PENDING_KEY);
      return null;
    }
    return j;
  } catch {
    return null;
  }
}

function clearGasPending() {
  try {
    localStorage.removeItem(GAS_PENDING_KEY);
  } catch {
    /* ignore */
  }
}

export async function issueGasTicket() {
  const presentation = await ensurePresentation({ reason: reason("unlockReasonGasTopUp") });
  return civicPost<{
    ok: boolean;
    ticket?: string;
    memo?: string;
    fundAddress?: string;
    minDepositTon?: number;
  }>("/v1/gas/ticket", { presentation });
}

export async function claimGasDeposit(opts: { ticket: string; fromWallet: string }) {
  const presentation = await ensurePresentation({ reason: reason("unlockReasonGasTopUp") });
  return civicPost<{
    ok: boolean;
    creditedTon?: number;
    balanceTon?: number;
  }>("/v1/gas/claim", {
    presentation,
    ticket: opts.ticket,
    fromWallet: bounceableAddr(opts.fromWallet),
  });
}

/** Retry claim after TonConnect if index lagged (or on Passport remount). */
export async function retryPendingGasClaim(): Promise<{ ok: boolean; balanceTon?: number; creditedTon?: number } | null> {
  const pending = readGasPending();
  if (!pending) return null;
  try {
    const r = await claimGasDeposit({ ticket: pending.ticket, fromWallet: pending.fromWallet });
    clearGasPending();
    return r;
  } catch {
    return null;
  }
}

export async function topUpPrepaidGas(opts: {
  tonConnectUI: TonTxUi;
  wallet: string;
  amountTon: number;
  fundAddressHint?: string | null;
}) {
  if (!Number.isFinite(opts.amountTon) || opts.amountTon < GAS_MIN_TON) {
    throw new Error(reason("gasMinAmount"));
  }
  const ticket = await issueGasTicket();
  if (!ticket.ticket || !ticket.memo) throw new Error("ticket fail");
  const dest = ticket.fundAddress || opts.fundAddressHint;
  if (!dest) throw new Error(reason("gasNoFund"));

  saveGasPending({
    ticket: ticket.ticket,
    memo: ticket.memo,
    fromWallet: opts.wallet,
    at: Date.now(),
  });

  const payload = buildTextComment(ticket.memo).toBoc().toString("base64");
  await opts.tonConnectUI.sendTransaction({
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [
      {
        address: dest,
        amount: toNano(opts.amountTon.toFixed(9)).toString(),
        payload,
      },
    ],
  });

  await new Promise((r) => setTimeout(r, 6000));
  try {
    const claimed = await claimGasDeposit({ ticket: ticket.ticket, fromWallet: opts.wallet });
    clearGasPending();
    return claimed;
  } catch (e) {
    // Index lag — leave pending for retryPendingGasClaim
    throw e;
  }
}

export async function claimPrivatizationShare(opts: {
  tonConnectUI: TonTxUi;
  wallet: string;
  fund: string;
}) {
  const presentation = await ensurePresentation({ reason: reason("unlockReasonPrivClaim") });
  const j = await civicPost<{
    ok: boolean;
    claimTx?: { address: string; amount: string; payload?: string };
    code?: string;
    error?: string;
  }>("/v1/funds/claim-privatization", {
    presentation,
    dao: DAO_ADDRESS,
    fund: bounceableAddr(opts.fund),
    voter: bounceableAddr(opts.wallet),
  });
  const msg = j.claimTx;
  if (!msg?.address) throw new Error(j.code || j.error || "claim_tx_missing");
  await opts.tonConnectUI.sendTransaction({
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [msg],
  });
  return j;
}

export function isInsufficientGasError(msg: string): boolean {
  return /insufficient_gas|insufficient_dao_gas|needDeposit|prepaid.?gas|недостаточно.*газ/i.test(msg);
}

/** Ensure local passport exists (issue if missing) then return presentation. */
export async function ensurePassportPresentation(reason: string) {
  try {
    return await ensurePresentation({ reason });
  } catch {
    await issuePassport();
    return ensurePresentation({ reason });
  }
}

export async function claimCitizenshipPay(opts: {
  tonConnectUI: TonTxUi;
  wallet: string;
  amountNano: bigint;
  payMaster: string;
}) {
  const mods = await resolveDaoModules();
  if (!mods.citizenshipHub) throw new Error("citizenship_hub_missing");
  if (!mods.pathPay) throw new Error("path_pay_missing");

  const presentation = await ensurePassportPresentation(reason("unlockReasonPayPath"));
  const st = await civicPost<{ ok: boolean; commit?: string }>("/v1/citizenship/status", {
    presentation,
    dao: DAO_ADDRESS,
  });
  const commitHex = st.commit;
  if (!commitHex) throw new Error("no_commit");

  let txHash: string | undefined = isE2eTestnet() ? "e2e-testnet-skip-tx" : undefined;
  if (!isE2eTestnet()) {
    const commit = BigInt(`0x${commitHex}`);
    const forward = beginCell()
      .storeUint(OP_CLAIM_PAY, 32)
      .storeUint(0, 64)
      .storeUint(commit, 256)
      .endCell();
    const userWallet = await resolveJettonWallet(opts.payMaster, opts.wallet);
    const body = beginCell()
      .storeUint(0x0f8a7ea5, 32)
      .storeUint(0, 64)
      .storeCoins(opts.amountNano)
      .storeAddress(Address.parse(mods.pathPay))
      .storeAddress(Address.parse(opts.wallet))
      .storeBit(false)
      .storeCoins(toNano("0.05"))
      .storeBit(true)
      .storeRef(forward)
      .endCell();

    const boc = await opts.tonConnectUI.sendTransaction({
      validUntil: Math.floor(Date.now() / 1000) + 360,
      messages: [
        {
          address: userWallet,
          amount: toNano("0.2").toString(),
          payload: body.toBoc().toString("base64"),
        },
      ],
    });
    await new Promise((r) => setTimeout(r, 8000));
    txHash = typeof boc === "string" ? boc : undefined;
  }

  const claimBody = {
    presentation,
    dao: DAO_ADDRESS,
    pathPay: mods.pathPay,
    citizenshipHub: mods.citizenshipHub,
    txHash,
  };

  let c = (await (
    await civicFetch("/v1/citizenship/claim-pay", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(claimBody),
    })
  ).json()) as { ok?: boolean; code?: string; error?: string; paths?: string[] };

  for (let i = 0; i < 5 && !c.ok && (c.code === "tx_not_found" || c.code === "payment_not_found"); i++) {
    await new Promise((r) => setTimeout(r, isE2eTestnet() ? 10 : 5000));
    c = (await (
      await civicFetch("/v1/citizenship/claim-pay", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(claimBody),
      })
    ).json()) as typeof c;
  }
  if (!c.ok) throw new Error(c.code || c.error || "pay claim fail");
  return c;
}

export async function claimCitizenshipWallet(wallet: string) {
  const mods = await resolveDaoModules();
  if (!mods.citizenshipHub) throw new Error("citizenship_hub_missing");
  const presentation = await ensurePassportPresentation(reason("unlockReasonWalletPath"));
  return civicPost<{
    ok: boolean;
    paths?: string[];
    commit?: string;
    merged?: boolean;
    mergedInto?: string;
  }>("/v1/citizenship/claim-wallet", {
    presentation,
    dao: DAO_ADDRESS,
    wallet: bounceableAddr(wallet),
    citizenshipHub: mods.citizenshipHub,
  });
}

export type DocsClaims = {
  surname?: string;
  givenName?: string;
  patronymic?: string;
  nationality?: string;
  birthPlace?: string;
  regPlace?: string;
  formerCitizenship?: string;
  documentType?: string;
  documentNumber?: string;
};

export async function claimCitizenshipDocs(opts?: {
  claims?: DocsClaims;
  feeTxHash?: string;
}) {
  const mods = await resolveDaoModules();
  if (!mods.citizenshipHub) throw new Error("citizenship_hub_missing");
  const presentation = await ensurePassportPresentation(reason("unlockReasonDocsPath"));
  const claims = opts?.claims;
  const res = await civicFetch("/v1/citizenship/claim-docs", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      presentation,
      dao: DAO_ADDRESS,
      citizenshipHub: mods.citizenshipHub,
      // Omit empty claims — Sumsub OCR supplies identity (commitmentMode=ocr).
      ...(claims && Object.values(claims).some((v) => String(v || "").trim())
        ? { claims }
        : {}),
      ...(opts?.feeTxHash ? { feeTxHash: opts.feeTxHash } : {}),
    }),
  });
  const j = (await res.json()) as {
    ok?: boolean;
    citizen?: boolean;
    commit?: string;
    code?: string;
    error?: string;
    fee?: { amount?: string; token?: string; recipient?: string };
    kyc?: { status?: string; accessToken?: string; provider?: string };
    paths?: string[];
  };
  return j;
}

export async function payDocsKycFee(opts: {
  tonConnectUI: TonTxUi;
  wallet: string;
  fee: { amount?: string; token?: string; recipient?: string };
  commit: string;
}) {
  const amount = BigInt(opts.fee.amount || "0");
  const token = opts.fee.token;
  const recipient = opts.fee.recipient || DAO_ADDRESS;
  if (!token || amount <= 0n) throw new Error("bad_fee");

  const memoCell = beginCell()
    .storeUint(0, 32)
    .storeStringTail(`blc-kyc:${opts.commit}`)
    .endCell();
  const userWallet = await resolveJettonWallet(token, opts.wallet);
  const body = beginCell()
    .storeUint(0x0f8a7ea5, 32)
    .storeUint(0, 64)
    .storeCoins(amount)
    .storeAddress(Address.parse(recipient))
    .storeAddress(Address.parse(opts.wallet))
    .storeBit(false)
    .storeCoins(toNano("0.05"))
    .storeBit(true)
    .storeRef(memoCell)
    .endCell();

  await opts.tonConnectUI.sendTransaction({
    validUntil: Math.floor(Date.now() / 1000) + 600,
    messages: [
      {
        address: userWallet,
        amount: toNano("0.12").toString(),
        payload: body.toBoc().toString("base64"),
      },
    ],
  });
  await new Promise((r) => setTimeout(r, 8000));
}
