/**
 * Shared list/value snapshot cache for the miniapp.
 * Keys match client McKeys.* — one store for catalog, votings, params, …
 *
 * Freshness: optional per-address last_transaction_lt. If any scope addr
 * moved on-chain, GET returns miss so the client (or warmer) re-fetches.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { isLiveSoftKey, LIVE_SOFT_TTL_MS } from './liveCacheKeys.mjs'

/**
 * Live snaps with matching account LT stay valid until this cap.
 * 15 min was too short: every visitor after the window missed and re-chained
 * the catalog (factory scan) even when MasterDAO had not moved.
 * Soft-live keys (LIVE_SOFT_PREFIXES) ignore LT and use LIVE_SOFT_TTL_MS instead.
 */
const HARD_TTL_MS = 6 * 60 * 60 * 1000
/**
 * When LT anchors missing or unread (tonapi 429) — serve last-good a bit longer
 * so every client does not miss at once and stampede chain (429 feedback loop).
 */
const SOFT_TTL_NO_LT_MS = 120 * 1000
/**
 * Immutable McKeys (votingMeta / votingAction / daoCreator / …).
 * Keep in sync with miniapp/src/ton/staticCache.ts STATIC_CACHE_PREFIXES.
 */
const STATIC_PREFIXES = [
  'votingMeta:',
  'votingAction:',
  'daoCreator:',
  'jetton:',
  'appMeta:',
  'containerSides:',
  /** Pre-cutover McKey — still write-once / no LT. */
  'sides:',
]
/** Static snaps survive votes (no LT) — long TTL only for disk trim. */
const STATIC_TTL_MS = 30 * 24 * 60 * 60 * 1000
/**
 * Semi-static (DAO settings etc.) — keep until overwrite / invalidate.
 * Sync with miniapp/src/ton/cachePolicy.ts SEMI_STATIC_CACHE_PREFIXES.
 */
const SEMI_PREFIXES = [
  'params:',
  'daoConfig:',
  'daoEntry:',
  'shortUrlDao:',
  'daoBound:',
  'daoAvatar:',
  'convert:',
  'dexLp:',
  'chainWallet:',
  'fundSnap:',
  'communityPath:',
  'citPaths2:',
  'citPaths:',
  'platGrowth',
  'daoWeight:',
  'versionOk:',
  'daoSemverGate:',
  'postMigrate:',
  'orphanStake:',
]
const SEMI_TTL_MS = 7 * 24 * 60 * 60 * 1000
const MAX_ENTRIES = 800
const MAX_VALUE_BYTES = 1_500_000

function isStaticKey(key, entry) {
  if (entry?.static) return true
  return STATIC_PREFIXES.some((p) => key === p || key.startsWith(p))
}

function isSemiKey(key, entry) {
  if (entry?.semi) return true
  return SEMI_PREFIXES.some((p) => key === p || key.startsWith(p))
}

/**
 * @param {{
 *   filePath?: string,
 *   fetchAccountLt: (addr: string) => Promise<string | null>,
 * }} opts
 */
export function createListCache(opts) {
  /** @type {Map<string, { at: number, value: unknown, lts: Record<string, string> }>} */
  const mem = new Map()
  let persistTimer = null
  const filePath = opts.filePath || ''

  function loadFile() {
    if (!filePath || !existsSync(filePath)) return
    try {
      const raw = JSON.parse(readFileSync(filePath, 'utf8'))
      const entries = raw?.entries
      if (!entries || typeof entries !== 'object') return
      for (const [k, v] of Object.entries(entries)) {
        if (!v || typeof v.at !== 'number' || v.value === undefined) continue
        mem.set(k, {
          at: v.at,
          value: v.value,
          lts: v.lts && typeof v.lts === 'object' ? v.lts : {},
          static: !!v.static || isStaticKey(k, null),
          semi: !!v.semi || isSemiKey(k, null),
        })
      }
    } catch (e) {
      console.warn('[listCache] load fail:', e?.message || e)
    }
  }

  function schedulePersist() {
    if (!filePath) return
    if (persistTimer) clearTimeout(persistTimer)
    persistTimer = setTimeout(() => {
      persistTimer = null
      try {
        mkdirSync(dirname(filePath), { recursive: true })
        const entries = {}
        for (const [k, v] of mem) entries[k] = v
        writeFileSync(filePath, JSON.stringify({ at: Date.now(), entries }))
      } catch (e) {
        console.warn('[listCache] persist fail:', e?.message || e)
      }
    }, 2000)
  }

  function trim() {
    if (mem.size <= MAX_ENTRIES) return
    const sorted = [...mem.entries()].sort((a, b) => a[1].at - b[1].at)
    const drop = sorted.slice(0, mem.size - MAX_ENTRIES)
    for (const [k] of drop) mem.delete(k)
  }

  loadFile()

  return {
    /** Raw get (no lt check). */
    peek(key) {
      return mem.get(key) || null
    },

    /**
     * Fresh get: hard TTL + lt match on scope addrs.
     * @returns {Promise<null | { at: number, value: unknown, lts: Record<string, string> }>}
     */
    async getFresh(key) {
      const hit = mem.get(key)
      if (!hit) return null
      const age = Date.now() - hit.at
      // Write-once immutables: ignore account LT (votes must not evict titles).
      if (isStaticKey(key, hit)) {
        if (age > STATIC_TTL_MS) return null
        return hit
      }
      // Settings etc.: ignore LT until client overwrites after VotingFinished.
      if (isSemiKey(key, hit)) {
        if (age > SEMI_TTL_MS) return null
        return hit
      }
      // Live soft keys: age only (ignore DAO LT). Guest POST /refresh re-probes.
      if (isLiveSoftKey(key)) {
        if (age > LIVE_SOFT_TTL_MS) return null
        if (key.startsWith('votings:') && (!Array.isArray(hit.value) || hit.value.length === 0)) {
          if (age > SOFT_TTL_NO_LT_MS) return null
        }
        return hit
      }
      if (age > HARD_TTL_MS) return null
      const addrs = Object.keys(hit.lts || {})
      // No LT anchors (POST failed to read lt) — short soft TTL only.
      // Catalog lists: longer grace so a TonAPI blip does not
      // evict the shared snap and stampede every guest into factory scan.
      if (addrs.length === 0) {
        const listGrace = (
          key.startsWith('daos:')
          && Array.isArray(hit.value)
          && hit.value.length > 0
        )
        const grace = listGrace ? 15 * 60 * 1000 : SOFT_TTL_NO_LT_MS
        if (age > grace) return null
        return hit
      }
      for (const addr of addrs) {
        try {
          const cur = await opts.fetchAccountLt(addr)
          if (cur == null) {
            // Fail-closed after soft window: unread LT under 429 must not
            // keep serving a shared stale snap to every client.
            if (age > SOFT_TTL_NO_LT_MS) return null
            continue
          }
          if (String(cur) !== String(hit.lts[addr])) return null
        } catch {
          if (age > SOFT_TTL_NO_LT_MS) return null
        }
      }
      return hit
    },

    /**
     * @param {string} key
     * @param {unknown} value
     * @param {Record<string, string> | null} [lts]
     * @param {{ static?: boolean, semi?: boolean, replaceLts?: boolean }} [opts]
     */
    set(key, value, lts = null, opts = null) {
      if (!key || typeof key !== 'string' || key.length > 256) {
        return { ok: false, error: 'bad_key' }
      }
      let size = 0
      try {
        size = JSON.stringify(value).length
      } catch {
        return { ok: false, error: 'value_not_json' }
      }
      if (size > MAX_VALUE_BYTES) return { ok: false, error: 'value_too_large' }
      const asStatic = !!(opts && opts.static) || isStaticKey(key, null)
      const asSemi = !asStatic && (!!(opts && opts.semi) || isSemiKey(key, null))
      const replaceLts = !!(opts && opts.replaceLts)
      // Write-once: keep first static snap (clients race on cold miss).
      if (asStatic) {
        const prev = mem.get(key)
        if (prev && prev.value !== undefined) {
          return { ok: true, at: prev.at, bytes: size, kept: true }
        }
      }
      const incomingLts = (asStatic || asSemi) ? {} : (lts && typeof lts === 'object' ? lts : {})
      const prev = mem.get(key)
      // Keep last good LT anchors when this POST could not read TonAPI
      // (empty lts used to force 45–120s soft miss → catalog chain storm).
      // replaceLts: server refresh after CreateVoting must drop stale DAO LT.
      const mergedLts = (asStatic || asSemi)
        ? {}
        : (
          replaceLts
            ? incomingLts
            : (
              Object.keys(incomingLts).length > 0
                ? incomingLts
                : ((prev && prev.lts && typeof prev.lts === 'object') ? prev.lts : {})
            )
        )
      mem.set(key, {
        at: Date.now(),
        value,
        lts: mergedLts,
        static: asStatic,
        semi: asSemi,
      })
      trim()
      schedulePersist()
      return { ok: true, at: Date.now(), bytes: size }
    },

    /** @param {string[]} keys */
    invalidate(keys) {
      let n = 0
      for (const k of keys || []) {
        if (mem.delete(k)) n++
      }
      if (n) schedulePersist()
      return { ok: true, removed: n }
    },

    stats() {
      return {
        keys: mem.size,
        hardTtlMs: HARD_TTL_MS,
        softTtlNoLtMs: SOFT_TTL_NO_LT_MS,
        staticTtlMs: STATIC_TTL_MS,
        semiTtlMs: SEMI_TTL_MS,
        stakeTtlMs: LIVE_SOFT_TTL_MS,
      }
    },
  }
}
