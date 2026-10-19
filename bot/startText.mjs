/**
 * /start message for @bulgaria_state_bot.
 *
 * Never put real newlines (or `\n`) into systemd EnvironmentFile — it turns
 * `\n` into a literal `n`, so users see «Булгарии.nНажмите». Keep the copy here.
 */

export const DEFAULT_START_TEXT =
  "Кабинет гражданина Чувашии / Волжской Булгарии.\nНажмите кнопку, чтобы открыть миниапп.";

/** Repair mangled env / legacy `.n` and expand __NL__ / \\n. */
export function normalizeStartText(raw) {
  if (raw == null || String(raw).trim() === "") return DEFAULT_START_TEXT;
  let s = String(raw)
    .replace(/\r\n/g, "\n")
    .replace(/__NL__/g, "\n")
    .replace(/\\n/g, "\n")
    // systemd EnvironmentFile: ".\n" → ".n" before the next letter
    .replace(/\.n(?=[\p{L}\p{N}])/gu, ".\n");
  // Fail closed: still glued ".nX" → use the known-good default
  if (/\.n\S/.test(s)) return DEFAULT_START_TEXT;
  return s.trim() || DEFAULT_START_TEXT;
}

/**
 * Resolve text for /start.
 * Env is only used when it already contains a real newline or __NL__/\\n that
 * normalize can expand. One-line env or mangled `.n` → hardcoded default
 * (two lines). Do not rely on systemd EnvironmentFile for line breaks.
 */
export function resolveStartText(envValue = process.env.START_TEXT) {
  const raw = envValue == null ? "" : String(envValue);
  if (!raw.trim()) return DEFAULT_START_TEXT;
  const normalized = normalizeStartText(raw);
  // Prefer the canonical two-line copy unless env yields a clean multi-line text
  // that is not the mangled ".n" form.
  if (!normalized.includes("\n") || /\.n\S/.test(normalized)) {
    return DEFAULT_START_TEXT;
  }
  return normalized;
}
