import { describe, expect, it } from "vitest";
import {
  BUNDLED_VOTING_CATALOG,
  filterVotingCatalog,
  isPrivFundEnabled,
  isTopupActive,
} from "./votingCatalog";

describe("votingCatalog", () => {
  it("shows privatization enable when hub.off", () => {
    const { items } = filterVotingCatalog(BUNDLED_VOTING_CATALOG, {
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
    const { items } = filterVotingCatalog(BUNDLED_VOTING_CATALOG, {
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
