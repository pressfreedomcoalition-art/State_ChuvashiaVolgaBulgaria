import { Address } from "@ton/core";

function bounce(addr: string): string {
  try {
    return Address.parse(addr).toString({ bounceable: true, urlSafe: true });
  } catch {
    return addr;
  }
}

function keyFor(voting: string, wallet?: string | null): string {
  const v = bounce(voting);
  if (wallet) return `chv_voted_v1:${v}:${bounce(wallet)}`;
  return `chv_voted_v1:${v}`;
}

/** Remember that this device cast a vote (civic or wallet). */
export function markLocalVoted(voting: string, wallet?: string | null) {
  try {
    localStorage.setItem(keyFor(voting), "1");
    if (wallet) localStorage.setItem(keyFor(voting, wallet), "1");
  } catch {
    /* private mode */
  }
}

export function hasLocalVoted(voting: string, wallet?: string | null): boolean {
  try {
    if (localStorage.getItem(keyFor(voting)) === "1") return true;
    if (wallet && localStorage.getItem(keyFor(voting, wallet)) === "1") return true;
  } catch {
    /* ignore */
  }
  return false;
}

export function isAlreadyVotedError(msg: string): boolean {
  const m = msg.toLowerCase();
  return (
    m.includes("already voted") ||
    m.includes("already_voted") ||
    m.includes("уже голос") ||
    m.includes("уже проголосов") ||
    m.includes("voted_already") ||
    m.includes("duplicate vote")
  );
}
