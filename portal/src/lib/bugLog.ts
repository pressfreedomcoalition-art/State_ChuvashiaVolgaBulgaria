export type BugEntry = {
  id: string;
  ts: number;
  kind: "error" | "rejection" | "react";
  message: string;
  stack?: string;
  url: string;
  ua: string;
  autoFix?: string;
  fixed?: boolean;
};

const STORAGE_KEY = "chv_bug_log_v1";
const MAX_ENTRIES = 80;

function read(): BugEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as BugEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(entries: BugEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(-MAX_ENTRIES)));
  } catch {
    /* quota / private mode */
  }
}

function uid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function getBugLog(): BugEntry[] {
  return read().slice().reverse();
}

export function clearBugLog() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function logBug(
  kind: BugEntry["kind"],
  message: string,
  stack?: string,
  extra?: Pick<BugEntry, "autoFix" | "fixed">,
): BugEntry {
  const entry: BugEntry = {
    id: uid(),
    ts: Date.now(),
    kind,
    message: message.slice(0, 2000),
    stack: stack?.slice(0, 4000),
    url: location.href,
    ua: navigator.userAgent.slice(0, 300),
    ...extra,
  };
  const next = read();
  next.push(entry);
  write(next);
  if (import.meta.env.DEV) {
    console.warn("[chv-bug]", kind, message, stack || "");
  }
  return entry;
}

type BugHandler = (message: string, stack?: string) => void;

let onBugHook: BugHandler | null = null;

/** Called from autoFix after attempting remediation. */
export function setBugHook(fn: BugHandler | null) {
  onBugHook = fn;
}

export function bootBugLog() {
  if (typeof window === "undefined") return;

  window.addEventListener("error", (ev) => {
    const msg = ev.message || String(ev.error || "error");
    const stack = ev.error instanceof Error ? ev.error.stack : undefined;
    logBug("error", msg, stack);
    onBugHook?.(msg, stack);
  });

  window.addEventListener("unhandledrejection", (ev) => {
    const reason = ev.reason;
    const msg = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : undefined;
    logBug("rejection", msg, stack);
    onBugHook?.(msg, stack);
  });
}

export function logReactError(error: Error, info?: { componentStack?: string | null }) {
  const stack = [error.stack, info?.componentStack].filter(Boolean).join("\n---\n");
  logBug("react", error.message, stack);
  onBugHook?.(error.message, stack);
}
