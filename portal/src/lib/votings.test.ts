import { describe, expect, it } from "vitest";
import { normalizeVoting } from "./votings";

describe("normalizeVoting", () => {
  it("preserves awaitingFinalize instead of mapping to pending", () => {
    const row = normalizeVoting({
      address: "EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx",
      status: "active",
      awaitingFinalize: true,
      title: "X",
    });
    expect(row?.status).toBe("active");
    expect(row?.awaitingFinalize).toBe(true);
  });

  it("marks awaitingFinalize from past endsAt", () => {
    const row = normalizeVoting({
      address: "EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx",
      status: "active",
      endsAt: Math.floor(Date.now() / 1000) - 60,
    });
    expect(row?.awaitingFinalize).toBe(true);
  });

  it("keeps finished when normalizing", () => {
    const row = normalizeVoting({
      address: "EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx",
      status: "finished",
    });
    expect(row?.status).toBe("finished");
    expect(row?.awaitingFinalize).toBe(false);
  });
});
