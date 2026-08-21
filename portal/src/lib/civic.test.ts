import { describe, expect, it } from "vitest";
import {
  formatJettonAmount,
  officialDaoUrl,
  officialEligUrl,
  paramMap,
  pathEnabled,
  pickName,
  shortAddr,
  votingAddress,
  votingStatus,
} from "./civic";

describe("civic helpers", () => {
  it("formats jetton 21e15 at 9 decimals", () => {
    expect(formatJettonAmount("21000000000000000").replace(/\s/g, "")).toBe("21000000");
  });

  it("detects pay path from amount", () => {
    const m = paramMap([
      { key: "cit.path.pay.amount", num: 1, numRaw: "1", str: "EQD" },
      { key: "short_url", isString: true, str: "CHV" },
    ]);
    expect(pathEnabled(m, "pay")).toBe(true);
    expect(pathEnabled(m, "docs")).toBe(false);
    expect(pickName(null, m)).toBe("CHV");
  });

  it("maps voting status and address", () => {
    expect(votingStatus({ status: "active" })).toBe("active");
    expect(votingStatus({ status: "finished" })).toBe("finished");
    expect(votingAddress({ voting: "EQ1", address: "EQ2" })).toBe("EQ2");
  });

  it("builds official links", () => {
    expect(officialDaoUrl()).toContain("#dao=EQDD0Z8");
    expect(officialEligUrl("https://chv.blc.cab/elig")).toContain("elig=1");
    expect(shortAddr("EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx")).toMatch(/EQDD0Z/);
  });
});
