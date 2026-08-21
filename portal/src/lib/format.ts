export function shortAddr(addr: string, left = 6, right = 4): string {
  if (!addr) return "";
  if (addr.length <= left + right + 1) return addr;
  return `${addr.slice(0, left)}…${addr.slice(-right)}`;
}

export function formatTon(nano: string | number | undefined): string {
  if (nano === undefined || nano === null || nano === "") return "—";
  const n = typeof nano === "string" ? Number(nano) : nano;
  if (!Number.isFinite(n)) return String(nano);
  const ton = n / 1e9;
  if (ton >= 1_000_000) return `${(ton / 1_000_000).toFixed(2)}M TON`;
  if (ton >= 1_000) return `${(ton / 1_000).toFixed(2)}K TON`;
  return `${ton.toLocaleString("ru-RU", { maximumFractionDigits: 4 })} TON`;
}

export function formatJetton(raw: string | number | undefined, decimals = 9): string {
  if (raw === undefined || raw === null || raw === "") return "—";
  const n = typeof raw === "string" ? Number(raw) : raw;
  if (!Number.isFinite(n)) return String(raw);
  const v = n / 10 ** decimals;
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(2)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(2)}K`;
  return v.toLocaleString("ru-RU", { maximumFractionDigits: 4 });
}

export function formatDate(ts?: number | string): string {
  if (!ts) return "";
  const n = typeof ts === "string" ? Number(ts) : ts;
  if (!Number.isFinite(n) || n <= 0) return "";
  const ms = n < 1e12 ? n * 1000 : n;
  return new Date(ms).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function daysLeft(endsAt?: number | string): string {
  if (!endsAt) return "";
  const n = typeof endsAt === "string" ? Number(endsAt) : endsAt;
  if (!Number.isFinite(n) || n <= 0) return "";
  const ms = n < 1e12 ? n * 1000 : n;
  const diff = ms - Date.now();
  if (diff <= 0) return "срок вышел";
  const days = Math.ceil(diff / 86400000);
  return `осталось ${days} дн.`;
}

export function votingStatus(raw?: string | number): "pending" | "active" | "finished" | "unknown" {
  const s = String(raw ?? "").toLowerCase();
  if (s === "0" || s === "pending" || s === "created") return "pending";
  if (s === "1" || s === "active" || s === "started" || s === "voting") return "active";
  if (s === "2" || s === "3" || s === "finished" || s === "ended" || s === "done") return "finished";
  return "unknown";
}
