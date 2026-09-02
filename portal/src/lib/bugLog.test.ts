import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearBugLog, getBugLog, logBug } from "./bugLog";
import { matchAutoFixRule } from "./autoFix";

describe("bugLog", () => {
  beforeEach(() => {
    clearBugLog();
    vi.stubGlobal("localStorage", {
      store: {} as Record<string, string>,
      getItem(this: { store: Record<string, string> }, k: string) {
        return this.store[k] ?? null;
      },
      setItem(this: { store: Record<string, string> }, k: string, v: string) {
        this.store[k] = v;
      },
      removeItem(this: { store: Record<string, string> }, k: string) {
        delete this.store[k];
      },
    });
    vi.stubGlobal("location", { href: "https://chv.blc.cab/" });
    vi.stubGlobal("navigator", { userAgent: "vitest" });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("stores and returns entries newest first", () => {
    logBug("error", "first");
    logBug("error", "second");
    const log = getBugLog();
    expect(log[0]?.message).toBe("second");
    expect(log).toHaveLength(2);
  });
});

describe("autoFix rules", () => {
  it("matches Buffer error", () => {
    expect(matchAutoFixRule("ReferenceError: Buffer is not defined")).toBe("buffer-polyfill");
  });

  it("matches civic fetch failure", () => {
    expect(matchAutoFixRule("TypeError: Failed to fetch https://dao.blc.cab/civic/health")).toBe(
      "civic-fetch-fallback",
    );
  });
});
