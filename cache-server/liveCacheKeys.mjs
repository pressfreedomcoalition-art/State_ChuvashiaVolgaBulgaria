/**
 * Live McKeys that must soft-expire on the shared cache (ignore DAO LT).
 * Guests POST /v1/cache/refresh after miss — custom handler when present,
 * else client hyper-stale → chain (see miniapp listLoad liveGuestKeepMaxAgeMs).
 *
 * Keep in sync with miniapp LIVE_POLICY prefixes (except daos: / nonVote:).
 * daos: stays LT/SWR (catalog stampede). nonVote: browser session only.
 */
export const LIVE_SOFT_TTL_MS = 90 * 1000

export const LIVE_SOFT_PREFIXES = [
  'votings:',
  'votingState:',
  'voterStake:',
  'children:',
  'treasuryJettons:',
  'treasuryTon:',
  'treasury:',
  'stake:',
  'tokenBal:',
  'parties:',
  'deputyProfiles:',
  'deputyVotes:',
  'deputyIncoming:',
  'delStatus:',
  'citStatus:',
  'citCount:',
  'nftOwn:',
  'nftOwn2:',
  'gasPers:',
  'gasDao:',
  'gasFund:',
  'childWalletBound:',
  'boundBotNotify:',
  'factoryLatest:',
  'daoCard:',
  'daoState:',
  'codeHash:',
  'needsPatch:',
  'migKind:',
  'boundBot:',
  'boundDomain:',
]

export function isLiveSoftKey(key) {
  return typeof key === 'string' && LIVE_SOFT_PREFIXES.some((p) => key.startsWith(p))
}
