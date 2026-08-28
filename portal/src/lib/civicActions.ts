import { Address, beginCell, toNano } from "@ton/core";
import { civicBase, DAO_ADDRESS } from "./config";
import { cacheGet } from "./civic";
import { ensurePresentation, issuePassport } from "./passport";
import { parseContainerSides, resolveJettonWallet } from "./tonResolve";

/** Minimal sendTransaction surface from TonConnectUI. */
type TonTxUi = {
  sendTransaction: (tx: {
    validUntil: number;
    messages: Array<{ address: string; amount: string; payload?: string }>;
  }) => Promise<unknown>;
};

const OP_CLAIM_PAY = 0x5adc0011;

async function civicPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${civicBase()}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = (await res.json()) as T & { ok?: boolean; error?: string; code?: string };
  if (!res.ok || (j as { ok?: boolean }).ok === false) {
    throw new Error((j as { code?: string; error?: string }).code || (j as { error?: string }).error || `HTTP ${res.status}`);
  }
  return j;
}

export async function resolveDaoModules(dao = DAO_ADDRESS) {
  const sides = await cacheGet<string[]>(`containerSides:${dao}`);
  return parseContainerSides(sides);
}

export async function fetchCitizenshipStatus(dao = DAO_ADDRESS) {
  const presentation = await ensurePresentation({ reason: "Статус гражданства" });
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
    reason: "Голос гражданина",
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
  const presentation = await ensurePresentation({ reason: "Баланс газа" });
  return civicPost<{ ok: boolean; balanceTon?: number; nano?: string }>("/v1/gas/status", {
    presentation,
  });
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

  const presentation = await ensurePassportPresentation("Оплата пути гражданства");
  const st = await civicPost<{ ok: boolean; commit?: string }>("/v1/citizenship/status", {
    presentation,
    dao: DAO_ADDRESS,
  });
  const commitHex = st.commit;
  if (!commitHex) throw new Error("no_commit");

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
  const claimBody = {
    presentation,
    dao: DAO_ADDRESS,
    pathPay: mods.pathPay,
    citizenshipHub: mods.citizenshipHub,
    txHash: typeof boc === "string" ? boc : undefined,
  };

  let c = await fetch(`${civicBase()}/v1/citizenship/claim-pay`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(claimBody),
  }).then((r) => r.json() as Promise<{ ok?: boolean; code?: string; error?: string; paths?: string[] }>);

  for (let i = 0; i < 5 && !c.ok && (c.code === "tx_not_found" || c.code === "payment_not_found"); i++) {
    await new Promise((r) => setTimeout(r, 5000));
    c = await fetch(`${civicBase()}/v1/citizenship/claim-pay`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(claimBody),
    }).then((r) => r.json());
  }
  if (!c.ok) throw new Error(c.code || c.error || "pay claim fail");
  return c;
}

export async function claimCitizenshipWallet(wallet: string) {
  const mods = await resolveDaoModules();
  if (!mods.citizenshipHub) throw new Error("citizenship_hub_missing");
  const presentation = await ensurePassportPresentation("Путь Wallet/NFT");
  return civicPost<{
    ok: boolean;
    paths?: string[];
    commit?: string;
    merged?: boolean;
    mergedInto?: string;
  }>("/v1/citizenship/claim-wallet", {
    presentation,
    dao: DAO_ADDRESS,
    wallet,
    citizenshipHub: mods.citizenshipHub,
  });
}

export type DocsClaims = {
  surname: string;
  givenName: string;
  patronymic?: string;
  nationality: string;
  birthPlace: string;
  regPlace?: string;
  formerCitizenship?: string;
  documentType: string;
  documentNumber: string;
};

export async function claimCitizenshipDocs(opts: {
  claims: DocsClaims;
  feeTxHash?: string;
}) {
  const mods = await resolveDaoModules();
  if (!mods.citizenshipHub) throw new Error("citizenship_hub_missing");
  const presentation = await ensurePassportPresentation("Документы / KYC");
  const res = await fetch(`${civicBase()}/v1/citizenship/claim-docs`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      presentation,
      dao: DAO_ADDRESS,
      citizenshipHub: mods.citizenshipHub,
      claims: opts.claims,
      ...(opts.feeTxHash ? { feeTxHash: opts.feeTxHash } : {}),
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
