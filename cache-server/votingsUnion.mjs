/**
 * Server-side votings list merge (mirror miniapp/src/ton/votingsUnion.ts).
 * Incomplete soft scans / status-only refresh must not wipe newer rows.
 */
import { Address } from '@ton/core'

export function votingAddrKey(addr) {
  if (!addr) return ''
  try {
    return Address.parse(addr).toRawString()
  } catch {
    return String(addr)
  }
}

export function canonicalVotingId(addr) {
  try {
    return Address.parse(addr).toString({ bounceable: true })
  } catch {
    return String(addr)
  }
}

function normTitle(title) {
  return String(title || '').trim().replace(/\s+/g, ' ').toLowerCase()
}

function rowFreshness(v) {
  let s = 0
  if (v?._statusAt) s += Number(v._statusAt)
  if (!v?.notStarted) s += 1e12
  if (v?.status === 'closed') s += 2e12
  if (v?.actionKind != null) s += 1e9
  if (v?.title && !/…|\.\.\./.test(v.title)) s += 1e8
  return s
}

function pickTurnout(newer, older) {
  const aAt = Number(newer?._turnoutAt) || 0
  const bAt = Number(older?._turnoutAt) || 0
  if (aAt !== bAt) {
    const preferred = aAt > bAt ? newer : older
    if (preferred?.totalVotes != null) return preferred.totalVotes
  }
  const av = newer?.totalVotes
  const bv = older?.totalVotes
  if (av != null && bv != null) return Math.max(Number(av), Number(bv))
  return av ?? bv
}

export function dedupeVotingsByAddress(list) {
  if (!Array.isArray(list) || list.length === 0) return []
  const by = new Map()
  const order = []
  for (const v of list) {
    if (!v?.id) continue
    const k = votingAddrKey(v.id)
    if (!k) continue
    const row = { ...v, id: canonicalVotingId(v.id) }
    const prev = by.get(k)
    if (!prev) {
      by.set(k, row)
      order.push(k)
      continue
    }
    const newer = rowFreshness(row) >= rowFreshness(prev) ? row : prev
    const older = newer === row ? prev : row
    by.set(k, {
      ...older,
      ...newer,
      id: canonicalVotingId(newer.id),
      title: newer.title || older.title,
      description: newer.description ?? older.description,
      actionKind: newer.actionKind ?? older.actionKind,
      newCodeHash: newer.newCodeHash ?? older.newCodeHash,
      creator: newer.creator ?? older.creator,
      quorum: newer.quorum || older.quorum,
      endsAt: newer.endsAt || older.endsAt,
      totalVotes: pickTurnout(newer, older),
      _turnoutAt: Math.max(newer._turnoutAt || 0, older._turnoutAt || 0)
        || newer._turnoutAt
        || older._turnoutAt,
      _statusAt: Math.max(newer._statusAt || 0, older._statusAt || 0)
        || newer._statusAt
        || older._statusAt,
    })
  }
  return order.map((k) => by.get(k)).filter(Boolean)
}

/**
 * Merge incoming list with durable prev. Empty next keeps prev.
 * Drops optimistic ghosts (same title, still notStarted, different addr).
 */
export function unionMergeVotingsList(prev, next) {
  const prevArr = Array.isArray(prev) ? prev : []
  const nextArr = Array.isArray(next) ? next : []
  if (nextArr.length === 0) return dedupeVotingsByAddress(prevArr)
  const nextKeys = new Set(nextArr.map((v) => votingAddrKey(v.id)).filter(Boolean))
  const nextTitles = new Set(
    nextArr.map((v) => normTitle(v.title)).filter((t) => t.length > 0),
  )
  const keptPrev = prevArr.filter((v) => {
    const k = votingAddrKey(v.id)
    if (k && nextKeys.has(k)) return false
    if (v.notStarted) {
      const t = normTitle(v.title)
      if (t && nextTitles.has(t)) return false
    }
    return true
  })
  return dedupeVotingsByAddress([...nextArr, ...keptPrev])
}
