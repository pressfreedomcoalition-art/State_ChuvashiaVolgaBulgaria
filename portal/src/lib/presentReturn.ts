/** Accept presentation returned from official DAO Face ID export. */
const PRESENT_KEY = "chv_incoming_presentation";

export function saveIncomingPresentation(presentation: string) {
  try {
    sessionStorage.setItem(PRESENT_KEY, presentation);
  } catch {
    /* private mode */
  }
}

export function takeIncomingPresentation(): string | null {
  try {
    const p = sessionStorage.getItem(PRESENT_KEY);
    if (p) sessionStorage.removeItem(PRESENT_KEY);
    return p;
  } catch {
    return null;
  }
}

function b64urlToJson(raw: string): { presentation?: string } | null {
  try {
    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const json = decodeURIComponent(escape(atob(b64 + pad)));
    return JSON.parse(json) as { presentation?: string };
  } catch {
    return null;
  }
}

/** Parse hash/query/Telegram start_param for presentation handoff. */
export function parsePresentReturn(startParam?: string | null): string | null {
  if (typeof window === "undefined") return null;
  const chunks = [
    window.location.hash.replace(/^#/, ""),
    window.location.search.replace(/^\?/, ""),
    startParam || "",
  ];
  for (const raw of chunks) {
    if (!raw) continue;
    const m = raw.match(/(?:^|[?&#])present_([^&\s]+)/);
    if (m) {
      const obj = b64urlToJson(m[1]);
      if (obj?.presentation) return obj.presentation;
    }
    const p = new URLSearchParams(raw);
    const presentation = p.get("presentation") || p.get("p");
    if (presentation) return presentation;
  }
  return null;
}

export function stripPresentFromUrl() {
  try {
    const u = new URL(window.location.href);
    u.searchParams.delete("presentation");
    u.searchParams.delete("p");
    u.searchParams.delete("present");
    u.searchParams.delete("error");
    const hash = u.hash.replace(/present_[^&]+/, "").replace(/presentation=[^&]+/, "");
    window.history.replaceState({}, "", u.pathname + u.search + (hash === "#" ? "" : hash));
  } catch {
    /* ignore */
  }
}
