import { civicBase, DAO_ADDRESS } from "./config";
import { ensurePresentation } from "./passport";
import { cacheGet } from "./civic";

async function civicPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${civicBase()}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const j = (await res.json()) as T & { ok?: boolean; error?: string; code?: string };
  if (!res.ok || (j as { ok?: boolean }).ok === false) {
    throw new Error((j as { code?: string; error?: string }).code || (j as { error?: string }).error || `HTTP ${res.status}`);
  }
  return j;
}

export async function fetchCitizenshipStatus(dao = DAO_ADDRESS) {
  const presentation = await ensurePresentation({ reason: "Статус гражданства" });
  return civicPost<{
    ok: boolean;
    citizen?: boolean;
    status?: string;
    paths?: string[];
  }>("/v1/citizenship/status", { presentation, dao });
}

export async function castCivicVote(opts: {
  voting: string;
  optionAddress: string;
  voter: string;
  civicSource?: string;
}) {
  const presentation = await ensurePresentation({
    voting: opts.voting,
    reason: "Голос гражданина",
  });
  let civicSource = opts.civicSource;
  if (!civicSource) {
    const sides = await cacheGet<string[]>(`containerSides:${DAO_ADDRESS}`);
    civicSource = sides?.[2] || sides?.[0];
  }
  if (!civicSource) throw new Error("civic_source_missing");
  return civicPost<{ ok: boolean }>("/v1/vote", {
    presentation,
    voter: opts.voter,
    voting: opts.voting,
    dao: DAO_ADDRESS,
    civicSource,
    optionAddress: opts.optionAddress,
  });
}

export async function fetchGasStatus() {
  const presentation = await ensurePresentation({ reason: "Баланс газа" });
  return civicPost<{ ok: boolean; balanceTon?: number; nano?: string }>("/v1/gas/status", {
    presentation,
  });
}
