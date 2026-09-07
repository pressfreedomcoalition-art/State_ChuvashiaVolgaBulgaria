import { Address, beginCell, Cell, contractAddress, Dictionary } from "@ton/core";
import {
  ContractLightVotingV1,
  storeVoteSettings,
  storeWinnerInfo,
  dictValueParserOptionInfoRoot,
  type OptionInfoRoot,
} from "./generated/ContractLightVotingV1";
import { ContractVaultDAOv1 } from "./generated/ContractVaultDAOv1";
import {
  type CreateVotingBodyLayout,
  type DaoActionInput,
  type DaoVersion,
  type VoteSettingsInput,
  buildCreateVotingReqBody,
  votingMetaCell,
  voteSettingsStruct,
} from "./createVoting";

const EMPTY_WINNER = {
  $$type: "WinnerInfo" as const,
  address: null,
  amount: 0n,
  total: 0n,
  finished: false,
};

export async function precomputeOptionVault(
  voting: Address | string,
  title: string,
  description: string,
): Promise<Address> {
  const owner =
    typeof voting === "string" ? Address.parse(voting) : Address.parse(voting.toString());
  const init = await ContractVaultDAOv1.fromInit(owner, 0n, {
    $$type: "OptionInfo",
    title,
    description,
  });
  return init.address;
}

export async function precomputeVotingAddress(
  container: Address,
  creator: Address,
  meta: Cell,
  settings: ReturnType<typeof voteSettingsStruct>,
  version: DaoVersion,
  weightSource: Address | null,
  votingSeqno = 0,
): Promise<Address> {
  if (version >= 6) {
    const init = await ContractLightVotingV1.fromInit(
      container,
      creator,
      container,
      BigInt(votingSeqno),
      0n,
      meta,
      settings,
      Dictionary.empty(),
      EMPTY_WINNER,
      Dictionary.empty(),
      Dictionary.empty(),
      weightSource,
    );
    return init.address;
  }
  // V5 without on-chain LV code: approximate with baked 6.0 code (CHV is 6.x).
  const data = beginCell()
    .storeAddress(container)
    .storeAddress(creator)
    .storeAddress(container)
    .storeUint(0n, 4)
    .storeRef(meta)
    .storeRef(
      beginCell()
        .store(storeVoteSettings(settings))
        .storeDict(
          Dictionary.empty<Address, OptionInfoRoot>(),
          Dictionary.Keys.Address(),
          dictValueParserOptionInfoRoot(),
        )
        .store(storeWinnerInfo(EMPTY_WINNER))
        .storeDict(Dictionary.empty(), Dictionary.Keys.Address(), Dictionary.Values.Bool())
        .storeDict(Dictionary.empty(), Dictionary.Keys.Address(), Dictionary.Values.BigVarUint(4))
        .storeRef(beginCell().storeAddress(weightSource).endCell())
        .endCell(),
    )
    .endCell();
  const init = await ContractLightVotingV1.fromInit(
    container,
    creator,
    container,
    0n,
    0n,
    meta,
    settings,
    Dictionary.empty(),
    EMPTY_WINNER,
    Dictionary.empty(),
    Dictionary.empty(),
    weightSource,
  );
  return contractAddress(0, { code: init.init!.code, data });
}

export type VotingOption = { title: string; description: string };

export async function prepareVoting(p: {
  container: string;
  creator: string;
  title: string;
  description: string;
  settings: VoteSettingsInput;
  options: VotingOption[];
  action: Omit<DaoActionInput, "approveOption"> & { approveIndex?: number };
  version?: DaoVersion;
  weightSource?: string | null;
  votingSeqno?: number;
  bodyLayout: CreateVotingBodyLayout;
}) {
  const container = Address.parse(p.container);
  const creator = Address.parse(p.creator);
  const version: DaoVersion = p.version ?? 6;
  const baseAction: DaoActionInput = { ...p.action, approveOption: null };
  const meta = votingMetaCell(p.title, p.description, p.settings, baseAction);
  const settings = voteSettingsStruct(p.settings);
  const weightSource = p.weightSource ? Address.parse(p.weightSource) : null;

  const votingAddr = await precomputeVotingAddress(
    container,
    creator,
    meta,
    settings,
    version,
    weightSource,
    p.votingSeqno ?? 0,
  );

  const optionVaults: string[] = [];
  for (const o of p.options) {
    optionVaults.push((await precomputeOptionVault(votingAddr, o.title, o.description)).toString());
  }

  const approveOption =
    p.action.approveIndex != null ? optionVaults[p.action.approveIndex] ?? null : null;

  const body = buildCreateVotingReqBody(
    p.title,
    p.description,
    p.settings,
    { ...baseAction, approveOption },
    version,
    p.bodyLayout,
  );

  return {
    votingAddr: votingAddr.toString({ bounceable: true, urlSafe: true }),
    optionVaults,
    body,
  };
}
