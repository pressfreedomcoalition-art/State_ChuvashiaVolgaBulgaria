import { Address, beginCell, Cell, contractAddress, storeStateInit, toNano } from "@ton/core";
import { DEPUTY_CODE_B64 } from "./deputyCode.generated";

export const OP_UPDATE_DEPUTY = 0x5ade0001;
export const PROFILE_KIND_CITIZEN = 0;

export type DeputyProfile = {
  address: string;
  dao?: string;
  kind?: number;
  passportCommit?: string;
  subject?: string;
  owner?: string | null;
  photoUrl?: string;
  fullName?: string;
  /** Cache may use `name` / `photo` */
  name?: string;
  photo?: string;
  bio?: string;
  updatedAt?: number;
};

function emptyBio(): Cell {
  return beginCell().endCell();
}

export function bioCell(text: string): Cell {
  return beginCell().storeStringTail(text || "").endCell();
}

export function commitHexToBigInt(hex: string): bigint {
  const h = hex.replace(/^0x/, "").toLowerCase();
  if (!/^[0-9a-f]+$/.test(h) || h.length > 64) throw new Error("bad commit hex");
  return BigInt("0x" + h.padStart(64, "0"));
}

function profileInitData(dao: Address, kind: number, subject: bigint, owner: Address | null): Cell {
  const b1 = beginCell().storeStringRefTail("").storeRef(emptyBio()).storeUint(0, 32).endCell();
  return beginCell()
    .storeAddress(dao)
    .storeUint(kind, 8)
    .storeUint(subject, 256)
    .storeAddress(owner)
    .storeStringRefTail("")
    .storeRef(b1)
    .endCell();
}

export function deputyCodeCell(): Cell {
  return Cell.fromBase64(DEPUTY_CODE_B64);
}

export function deputyStateInit(
  dao: string,
  passportCommitHex: string,
  owner: string | null,
): { code: Cell; data: Cell } {
  return {
    code: deputyCodeCell(),
    data: profileInitData(
      Address.parse(dao),
      PROFILE_KIND_CITIZEN,
      commitHexToBigInt(passportCommitHex),
      owner ? Address.parse(owner) : null,
    ),
  };
}

export function deputyAddress(dao: string, passportCommitHex: string, owner: string | null): string {
  const init = deputyStateInit(dao, passportCommitHex, owner);
  return contractAddress(0, init).toString({ bounceable: true });
}

export function buildUpdateDeputyProfileBody(p: {
  photoUrl: string;
  fullName: string;
  bio: string;
}): Cell {
  return beginCell()
    .storeUint(OP_UPDATE_DEPUTY, 32)
    .storeUint(0, 64)
    .storeStringRefTail(p.photoUrl || "")
    .storeStringRefTail(p.fullName || "")
    .storeRef(bioCell(p.bio || ""))
    .endCell();
}

function normCommit(h: string): string {
  return h.replace(/^0x/, "").toLowerCase().padStart(64, "0");
}

/** Prefer existing on-chain profile (legacy address) over recomputed. */
export function findMyDeputyProfile(
  list: DeputyProfile[] | null | undefined,
  passportCommit: string,
): DeputyProfile | undefined {
  const want = normCommit(passportCommit);
  return (list || []).find((c) => {
    const raw = c.passportCommit || c.subject || "";
    if (!raw) return false;
    try {
      return normCommit(raw) === want;
    } catch {
      return false;
    }
  });
}

export function buildNominateTx(opts: {
  dao: string;
  passportCommit: string;
  wallet: string;
  existing?: DeputyProfile | null;
  photoUrl: string;
  fullName: string;
  bio: string;
}): {
  validUntil: number;
  messages: Array<{
    address: string;
    amount: string;
    payload?: string;
    stateInit?: string;
  }>;
} {
  const profileBody = buildUpdateDeputyProfileBody({
    photoUrl: opts.photoUrl,
    fullName: opts.fullName,
    bio: opts.bio,
  });
  const mine = opts.existing;
  const addr = mine?.address ?? deputyAddress(opts.dao, opts.passportCommit, opts.wallet);

  if (!mine) {
    const init = deputyStateInit(opts.dao, opts.passportCommit, opts.wallet);
    const dest = contractAddress(0, init);
    const stateInitCell = beginCell().store(storeStateInit(init)).endCell();
    return {
      validUntil: Math.floor(Date.now() / 1000) + 300,
      messages: [
        {
          address: dest.toString({ bounceable: false }),
          amount: toNano("0.12").toString(),
          payload: beginCell().storeUint(0, 32).storeStringTail("init").endCell().toBoc().toString("base64"),
          stateInit: stateInitCell.toBoc().toString("base64"),
        },
        {
          address: dest.toString({ bounceable: true }),
          amount: toNano("0.05").toString(),
          payload: profileBody.toBoc().toString("base64"),
        },
      ],
    };
  }

  return {
    validUntil: Math.floor(Date.now() / 1000) + 300,
    messages: [
      {
        address: Address.parse(addr).toString({ bounceable: true }),
        amount: toNano("0.05").toString(),
        payload: profileBody.toBoc().toString("base64"),
      },
    ],
  };
}
