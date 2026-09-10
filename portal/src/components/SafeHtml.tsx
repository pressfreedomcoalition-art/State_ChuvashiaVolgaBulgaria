import { bioToDisplayHtml } from "../ton/safeHtml";

/** Render deputy/party bio HTML after allowlist sanitize. */
export function SafeHtml({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const safe = bioToDisplayHtml(html);
  if (!safe) return null;
  return (
    <div
      className={`safe-html${className ? ` ${className}` : ""}`}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
