export type VoteSettingsFloors = {
  durationHours: number;
  minDurationSec: number;
  deposit: number;
  quorum: number;
  supportPct: number;
  turnoutPct: number;
};

export function voteSettingsFloorsFromConfig(
  cfg: {
    minDuration?: number;
    minProposal?: number;
    minQuorum?: number;
    minSupportPct?: number;
    minTurnoutPct?: number;
  } | null | undefined,
): VoteSettingsFloors {
  const minDurationSec = Math.max(0, Number(cfg?.minDuration) || 0);
  const durationHours = Math.max(1, minDurationSec > 0 ? Math.ceil(minDurationSec / 3600) : 1);
  return {
    durationHours,
    minDurationSec,
    deposit: Math.max(1, Math.ceil(Number(cfg?.minProposal) || 1)),
    quorum: Math.max(0, Math.ceil(Number(cfg?.minQuorum) || 0)),
    supportPct: Math.min(99, Math.max(0, Math.floor(Number(cfg?.minSupportPct) || 0))),
    turnoutPct: Math.min(100, Math.max(0, Math.floor(Number(cfg?.minTurnoutPct) || 0))),
  };
}

export function createDurationSec(durationHoursRaw: string | number, floors: VoteSettingsFloors): number {
  const n = Math.floor(Number(durationHoursRaw));
  const hours = Number.isFinite(n) ? Math.max(floors.durationHours, n) : floors.durationHours;
  return Math.max(hours * 3600, floors.minDurationSec);
}
