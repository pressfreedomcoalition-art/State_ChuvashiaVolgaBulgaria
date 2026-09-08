import { describe, expect, it } from "vitest";
import { paramsCatalogLooksComplete } from "./daoParams";

describe("paramsCatalogLooksComplete", () => {
  it("rejects empty / party-only poison snapshots", () => {
    expect(paramsCatalogLooksComplete(null)).toBe(false);
    expect(paramsCatalogLooksComplete([])).toBe(false);
    expect(paramsCatalogLooksComplete([{ key: "party.allow", isString: true, str: "1" }])).toBe(false);
  });

  it("accepts catalogs with mod / cit / short_url", () => {
    expect(
      paramsCatalogLooksComplete([
        { key: "mod.allow", isString: false, str: "EQCkpaUMJVoCN42Nins3Q5HO23VIdUiFiRRSQYWKZCXejDmk" },
      ]),
    ).toBe(true);
    expect(paramsCatalogLooksComplete([{ key: "short_url", isString: true, str: "CHV" }])).toBe(true);
    expect(
      paramsCatalogLooksComplete([
        { key: "a", isString: true, str: "1" },
        { key: "b", isString: true, str: "1" },
        { key: "c", isString: true, str: "1" },
      ]),
    ).toBe(true);
  });
});
