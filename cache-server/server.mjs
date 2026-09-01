/**
 * CHV State cache server — McKeys snapshots only.
 * Civic passport / vote / gas stay on platform civic-verifier.
 *
 * Env:
 *   PORT=8790
 *   DAO_ADDRESS=EQ…          (required for allowlist; same as VITE_DAO_ADDRESS)
 *   LANG_DAO_ADDRESS=EQ…     (optional second allowlisted container)
 *   CORS_ORIGIN=https://chv.blc.cab,http://localhost:5173
 *   CACHE_SECRET=…           (optional Bearer for POST /invalidate)
 *   TONAPI_KEY=…             (optional; LT checks on non-soft live keys)
 *   DATA_DIR=./data
 */
import express from 'express'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createListCache } from './listCache.mjs'
import { applyCors } from './cors.mjs'
import { dedupeVotingsByAddress, unionMergeVotingsList } from './votingsUnion.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT || 8790)
const DAO_ADDRESS = String(process.env.DAO_ADDRESS || '').trim()
const LANG_DAO_ADDRESS = String(process.env.LANG_DAO_ADDRESS || '').trim()
const CACHE_SECRET = String(process.env.CACHE_SECRET || '').trim()
const TONAPI_KEY = String(process.env.TONAPI_KEY || '').trim()
const DATA_DIR = String(process.env.DATA_DIR || join(__dirname, 'data')).trim()

/** @type {Map<string, { n: number, reset: number }>} */
const buckets = new Map()

function rateLimit(key, max, windowMs) {
  const now = Date.now()
  let b = buckets.get(key)
  if (!b || now > b.reset) {
    b = { n: 0, reset: now + windowMs }
    buckets.set(key, b)
  }
  b.n += 1
  return b.n <= max
}

function clientIp(req) {
  const xf = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim()
  return xf || req.socket?.remoteAddress || 'unknown'
}

function bounceable(addr) {
  const s = String(addr || '').trim()
  if (!s) return ''
  // Keep EQ/UQ as-is for string compare; allowlist uses portal bounceable EQ…
  return s
}

const allowedDaos = new Set(
  [DAO_ADDRESS, LANG_DAO_ADDRESS].map(bounceable).filter(Boolean),
)

/** McKeys whose suffix is our DAO container address. */
const DAO_SCOPED_PREFIXES = [
  'votings:',
  'params:',
  'daoConfig:',
  'daoEntry:',
  'daoBound:',
  'daoAvatar:',
  'daoCreator:',
  'daoWeight:',
  'daoState:',
  'daoCard:',
  'daoSemverGate:',
  'treasury:',
  'treasuryTon:',
  'treasuryJettons:',
  'deputyProfiles:',
  'deputyVotes:',
  'deputyIncoming:',
  'children:',
  'containerSides:',
  'sides:',
  'codeHash:',
  'needsPatch:',
  'versionOk:',
  'postMigrate:',
  'orphanStake:',
  'citPaths:',
  'citPaths2:',
  'citStatus:',
  'citCount:',
  'gasDao:',
  'fundSnap:',
  'communityPath:',
  'chainWallet:',
]

/** Per-voting snaps (suffix = voting contract, not DAO). */
const VOTING_DETAIL_RE = /^(votingState|votingMeta|votingAction):(.+)$/

function looksLikeTonAddr(s) {
  return /^(EQ|UQ)[A-Za-z0-9_-]{46}$/.test(s) || /^0:[a-fA-F0-9]{64}$/.test(s)
}

/**
 * Reject keys that target another DAO container.
 * Keys without a DAO addr (jetton:…, daos:…) are refused here.
 */
function assertKeyAllowed(key) {
  const k = String(key || '').trim()
  if (!k) return { ok: false, status: 400, error: 'key required' }
  if (!DAO_ADDRESS) return { ok: false, status: 500, error: 'DAO_ADDRESS unset' }

  const detail = VOTING_DETAIL_RE.exec(k)
  if (detail) {
    const addr = bounceable(detail[2])
    if (!looksLikeTonAddr(addr)) return { ok: false, status: 400, error: 'key_addr_required' }
    return { ok: true }
  }

  for (const p of DAO_SCOPED_PREFIXES) {
    if (k === p || k.startsWith(p)) {
      const addr = bounceable(k.slice(p.length).split(':')[0])
      if (!addr) return { ok: false, status: 400, error: 'key_addr_required' }
      if (!allowedDaos.has(addr)) {
        return { ok: false, status: 403, error: 'dao_not_allowed' }
      }
      return { ok: true }
    }
  }

  return { ok: false, status: 403, error: 'key_not_allowed' }
}

async function fetchAccountLt(addr) {
  if (!TONAPI_KEY || !addr) return null
  try {
    const url = `https://tonapi.io/v2/accounts/${encodeURIComponent(addr)}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${TONAPI_KEY}` },
      signal: AbortSignal.timeout(8_000),
    })
    if (!res.ok) return null
    const j = await res.json()
    const lt = j?.last_transaction_lt ?? j?.lastTransactionLt
    return lt != null ? String(lt) : null
  } catch {
    return null
  }
}

const listCache = createListCache({
  filePath: join(DATA_DIR, 'list-cache.json'),
  fetchAccountLt,
})

const app = express()
app.disable('x-powered-by')
app.use(express.json({ limit: '2mb' }))

app.use((req, res, next) => {
  applyCors(req, res, process.env)
  if (req.method === 'OPTIONS') return res.status(204).end()
  next()
})

app.get('/health', (_req, res) => {
  const st = listCache.stats()
  res.json({
    ok: true,
    service: 'chv-cache',
    dao: DAO_ADDRESS || null,
    entries: st.keys ?? 0,
  })
})

app.get('/v1/cache/peek', (req, res) => {
  if (!rateLimit(`cache-peek:${clientIp(req)}`, 240, 60_000)) {
    return res.status(429).json({ ok: false, error: 'rate' })
  }
  try {
    const key = String(req.query.key || '').trim()
    const gate = assertKeyAllowed(key)
    if (!gate.ok) return res.status(gate.status).json({ ok: false, error: gate.error })
    const hit = listCache.peek(key)
    if (!hit || hit.value === undefined) {
      return res.status(404).json({ ok: false, error: 'miss' })
    }
    res.json({ ok: true, at: hit.at, value: hit.value, stale: true })
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) })
  }
})

app.get('/v1/cache/list', async (req, res) => {
  if (!rateLimit(`cache-get:${clientIp(req)}`, 180, 60_000)) {
    return res.status(429).json({ ok: false, error: 'rate' })
  }
  try {
    const key = String(req.query.key || '').trim()
    const gate = assertKeyAllowed(key)
    if (!gate.ok) return res.status(gate.status).json({ ok: false, error: gate.error })
    const hit = await listCache.getFresh(key)
    if (!hit) return res.status(404).json({ ok: false, error: 'miss' })
    res.json({ ok: true, at: hit.at, lts: hit.lts, value: hit.value })
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) })
  }
})

app.post('/v1/cache/list', async (req, res) => {
  if (!rateLimit(`cache-post:${clientIp(req)}`, 90, 60_000)) {
    return res.status(429).json({ ok: false, error: 'rate' })
  }
  try {
    const key = String(req.body?.key || '').trim()
    let value = req.body?.value
    const gate = assertKeyAllowed(key)
    if (!gate.ok) return res.status(gate.status).json({ ok: false, error: gate.error })
    if (value === undefined) return res.status(400).json({ ok: false, error: 'value required' })

    // Guard: empty votings/params must not wipe last-good unless replace:true
    if (key.startsWith('votings:') && Array.isArray(value) && value.length === 0 && !req.body?.replace) {
      return res.status(400).json({ ok: false, error: 'empty_votings_refused' })
    }
    if (key.startsWith('params:') && Array.isArray(value) && value.length === 0 && !req.body?.replace) {
      return res.status(400).json({ ok: false, error: 'empty_params_refused' })
    }

    if (key.startsWith('votings:') && Array.isArray(value)) {
      value = dedupeVotingsByAddress(value)
      if (!req.body?.replace) {
        const prev = listCache.peek(key)?.value
        if (Array.isArray(prev) && prev.length > 0) {
          value = unionMergeVotingsList(prev, value)
        }
      }
    }

    const asStatic = !!req.body?.static
    const asSemi = !asStatic && !!req.body?.semi
    /** @type {string[]} */
    const scopeAddrs = (asStatic || asSemi)
      ? []
      : (Array.isArray(req.body?.scopeAddrs)
        ? req.body.scopeAddrs.map((a) => String(a || '').trim()).filter(Boolean).slice(0, 8)
        : [])
    /** @type {Record<string, string>} */
    const lts = {}
    for (const addr of scopeAddrs) {
      const lt = await fetchAccountLt(addr)
      if (lt != null) lts[addr] = lt
    }
    const clientLts = !(asStatic || asSemi) && req.body?.lts && typeof req.body.lts === 'object'
      ? req.body.lts
      : null
    if (clientLts) {
      for (const [a, lt] of Object.entries(clientLts)) {
        if (lts[a] == null && lt != null) lts[String(a)] = String(lt)
      }
    }

    const out = listCache.set(key, value, (asStatic || asSemi) ? {} : lts, {
      static: asStatic,
      semi: asSemi,
    })
    if (!out.ok) return res.status(400).json(out)
    res.json({
      ok: true,
      at: out.at,
      lts: (asStatic || asSemi) ? {} : lts,
      bytes: out.bytes,
      static: asStatic || !!out.kept,
      semi: asSemi,
    })
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) })
  }
})

app.post('/v1/cache/invalidate', (req, res) => {
  if (!rateLimit(`cache-inv:${clientIp(req)}`, 10, 60_000)) {
    return res.status(429).json({ ok: false, error: 'rate' })
  }
  if (CACHE_SECRET) {
    const auth = String(req.headers.authorization || '')
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
    if (token !== CACHE_SECRET) {
      return res.status(401).json({ ok: false, error: 'unauthorized' })
    }
  }
  try {
    const keys = Array.isArray(req.body?.keys)
      ? req.body.keys.map((k) => String(k || '').trim()).filter(Boolean).slice(0, 64)
      : []
    if (keys.length === 0) return res.status(400).json({ ok: false, error: 'keys required' })
    for (const k of keys) {
      const gate = assertKeyAllowed(k)
      if (!gate.ok) return res.status(gate.status).json({ ok: false, error: gate.error, key: k })
    }
    res.json(listCache.invalidate(keys))
  } catch (e) {
    res.status(500).json({ ok: false, error: e?.message || String(e) })
  }
})

app.get('/v1/cache/stats', (req, res) => {
  if (!rateLimit(`cache-stats:${clientIp(req)}`, 30, 60_000)) {
    return res.status(429).json({ ok: false, error: 'rate' })
  }
  res.json({ ok: true, service: 'chv-cache', dao: DAO_ADDRESS || null, ...listCache.stats() })
})

if (!DAO_ADDRESS) {
  console.warn('[chv-cache] DAO_ADDRESS is empty — all keyed writes/reads will 500')
}

app.listen(PORT, () => {
  console.log(`[chv-cache] :${PORT} dao=${DAO_ADDRESS || '(unset)'} data=${DATA_DIR}`)
})
