import { logBug, setBugHook } from "./bugLog";

type FixResult = { label: string; fixed: boolean; reload?: boolean };

type FixRule = {
  id: string;
  test: (message: string, stack?: string) => boolean;
  apply: () => FixResult | Promise<FixResult>;
};

const RELOAD_GUARD = "chv_autofix_reload_v1";

function canReload(id: string): boolean {
  try {
    const raw = sessionStorage.getItem(RELOAD_GUARD);
    const seen = raw ? (JSON.parse(raw) as Record<string, number>) : {};
    const last = seen[id] || 0;
    if (Date.now() - last < 60_000) return false;
    seen[id] = Date.now();
    sessionStorage.setItem(RELOAD_GUARD, JSON.stringify(seen));
    return true;
  } catch {
    return false;
  }
}

const RULES: FixRule[] = [
  {
    id: "buffer-polyfill",
    test: (msg) => /Buffer is not defined/i.test(msg),
    apply: async () => {
      await import("../buffer-polyfill");
      if (typeof (globalThis as { Buffer?: unknown }).Buffer !== "undefined") {
        return { label: "buffer-polyfill", fixed: true, reload: canReload("buffer-polyfill") };
      }
      return { label: "buffer-polyfill", fixed: false };
    },
  },
  {
    id: "civic-fetch-fallback",
    test: (msg) => /failed to fetch|networkerror|load failed/i.test(msg) && /civic|dao\./i.test(msg),
    apply: () => {
      try {
        sessionStorage.setItem("chv_civic_force_won", "1");
      } catch {
        /* ignore */
      }
      return {
        label: "civic-fetch-fallback",
        fixed: true,
        reload: canReload("civic-fetch-fallback"),
      };
    },
  },
];

let handling = false;

async function tryAutoFix(message: string, stack?: string) {
  if (handling) return;
  for (const rule of RULES) {
    if (!rule.test(message, stack)) continue;
    handling = true;
    try {
      const result = await rule.apply();
      logBug("error", message, stack, { autoFix: result.label, fixed: result.fixed });
      if (result.fixed && result.reload) {
        location.reload();
      }
    } finally {
      handling = false;
    }
    return;
  }
}

export function bootAutoFix() {
  setBugHook((msg, stack) => {
    void tryAutoFix(msg, stack);
  });
}

/** For tests / sandbox. */
export function matchAutoFixRule(message: string, stack?: string): string | null {
  for (const rule of RULES) {
    if (rule.test(message, stack)) return rule.id;
  }
  return null;
}
