import { describe, expect, it } from "vitest";
import {
  filterVotingCatalog,
  isPrivFundEnabled,
  isTopupActive,
  type VotingCatalog,
} from "./votingCatalog";

const FIXTURE: VotingCatalog = {
  version: 1,
  categories: [
    { id: "funds", title: "Фонды" },
    { id: "citizenship", title: "Гражданство" },
  ],
  items: [
    {
      id: "priv-enable",
      vtype: 11,
      category: "funds",
      label: "Приватизация — включить",
      hint: "hub.on.priv_fund=1",
      require: { privFundOn: false },
    },
    {
      id: "priv-unlock",
      vtype: 7,
      category: "funds",
      label: "Разблокировать",
      hint: "kind=6",
      require: { privFundOn: true, hasPrivFund: true, privFundLive: false },
    },
    {
      id: "priv-disable",
      vtype: 11,
      category: "funds",
      label: "Выключить",
      hint: "tombstone",
      require: { privFundOn: true },
    },
    {
      id: "topup-create",
      vtype: 14,
      category: "funds",
      label: "Автопополнение",
      hint: "fund.topup",
      require: { topupActive: false },
    },
    {
      id: "ban-citizen",
      vtype: 13,
      category: "citizenship",
      label: "Бан",
      hint: "cit.ban",
      require: { banByVote: true },
    },
    {
      id: "nft-pass-open",
      vtype: 19,
      category: "citizenship",
      label: "NFT",
      hint: "cit.nft.collection",
      require: { nftPassOpen: false },
    },
  ],
};

describe("votingCatalog", () => {
  it("shows privatization enable when hub.off", () => {
    const { items } = filterVotingCatalog(FIXTURE, {
      privFundOn: false,
      hasPrivFund: false,
      privFundLive: false,
      topupActive: false,
      banByVote: false,
      nftPassOpen: false,
    });
    expect(items.some((i) => i.id === "priv-enable")).toBe(true);
    expect(items.some((i) => i.id === "priv-unlock")).toBe(false);
    expect(items.some((i) => i.id === "topup-create")).toBe(true);
    expect(items.some((i) => i.category === "funds")).toBe(true);
  });

  it("shows unlock when fund deployed but locked", () => {
    const { items } = filterVotingCatalog(FIXTURE, {
      privFundOn: true,
      hasPrivFund: true,
      privFundLive: false,
      topupActive: true,
      banByVote: true,
      nftPassOpen: true,
    });
    expect(items.some((i) => i.id === "priv-enable")).toBe(false);
    expect(items.some((i) => i.id === "priv-unlock")).toBe(true);
    expect(items.some((i) => i.id === "priv-disable")).toBe(true);
    expect(items.some((i) => i.id === "topup-create")).toBe(false);
    expect(items.some((i) => i.id === "ban-citizen")).toBe(true);
    expect(items.some((i) => i.id === "nft-pass-open")).toBe(false);
  });

  it("detects hub.on.priv_fund and fund.topup.*", () => {
    const map = new Map([
      ["hub.on.priv_fund", { key: "hub.on.priv_fund", isString: true, str: "1" }],
      ["fund.topup.pct", { key: "fund.topup.pct", isString: false, num: 100 }],
    ]);
    expect(isPrivFundEnabled(map)).toBe(true);
    expect(isTopupActive(map)).toBe(true);
  });
});
