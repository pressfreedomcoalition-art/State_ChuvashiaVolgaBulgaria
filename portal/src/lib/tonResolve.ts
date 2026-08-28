import { Address, beginCell, Cell } from "@ton/core";

/** Resolve sender jetton wallet (TEP-74) via tonapi, fallback toncenter public. */
export async function resolveJettonWallet(jettonMaster: string, owner: string): Promise<string> {
  const master = Address.parse(jettonMaster).toString({ bounceable: true, urlSafe: true });
  const ownerBounce = Address.parse(owner).toString({ bounceable: true, urlSafe: true });

  try {
    const r = await fetch(
      `https://tonapi.io/v2/accounts/${encodeURIComponent(ownerBounce)}/jettons/${encodeURIComponent(master)}`,
    );
    if (r.ok) {
      const j = (await r.json()) as { wallet_address?: { address?: string } };
      const w = j.wallet_address?.address;
      if (w) return Address.parse(w).toString({ bounceable: true, urlSafe: true });
    }
  } catch {
    /* fall through */
  }

  const ownerBoc = beginCell().storeAddress(Address.parse(owner)).endCell().toBoc().toString("base64");
  const res = await fetch("https://ton.access.orbs.network/44A1c0ffF586CF870223CcB146Db39F1090fBAaE/1/mainnet/toncenter-api-v2/runGetMethod", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      address: master,
      method: "get_wallet_address",
      stack: [["tvm.Slice", ownerBoc]],
    }),
  });
  const data = (await res.json()) as {
    ok?: boolean;
    result?: { exit_code?: number; stack?: unknown[] };
  };
  if (!data.ok || data.result?.exit_code !== 0) {
    throw new Error(`get_wallet_address exit ${data.result?.exit_code ?? "?"}`);
  }
  const item = data.result!.stack![0] as [string, { bytes?: string } | string];
  const boc = typeof item[1] === "string" ? item[1] : item[1]?.bytes;
  if (!boc) throw new Error("get_wallet_address empty");
  return Cell.fromBase64(boc).beginParse().loadAddress()!.toString({ bounceable: true, urlSafe: true });
}

export function parseContainerSides(sides: string[] | null | undefined) {
  return {
    civicSource: sides?.[0] || "",
    citizenshipHub: sides?.[1] || "",
    pathPay: sides?.[2] || "",
  };
}
