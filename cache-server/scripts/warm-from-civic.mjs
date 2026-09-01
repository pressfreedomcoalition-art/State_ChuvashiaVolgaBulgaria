/**
 * Phase-1 warmer: pull selected McKeys from platform civic and POST into local cache.
 * Usage (cache-server running on :8790):
 *   node scripts/warm-from-civic.mjs
 * Env: DAO_ADDRESS, CACHE_URL (default http://127.0.0.1:8790),
 *      CIVIC_URL (default https://dao.won.onl/civic)
 */
const DAO = String(process.env.DAO_ADDRESS || 'EQDD0Z8_-Anqv5Yww14F-DpzKRaZZdWXgLs1p8c-XyC81Mmx').trim()
const CACHE = String(process.env.CACHE_URL || 'http://127.0.0.1:8790').replace(/\/$/, '')
const CIVIC = String(process.env.CIVIC_URL || 'https://dao.won.onl/civic').replace(/\/$/, '')

const KEYS = [
  { key: `daoConfig:${DAO}`, semi: true },
  { key: `params:${DAO}`, semi: true },
  { key: `votings:${DAO}`, semi: false },
  { key: `treasury:${DAO}`, semi: false },
  { key: `deputyProfiles:${DAO}`, semi: false },
]

async function pull(key) {
  const res = await fetch(`${CIVIC}/v1/cache/list?key=${encodeURIComponent(key)}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`civic ${res.status} ${key}`)
  const j = await res.json()
  return j?.value
}

async function push(key, value, flags) {
  const res = await fetch(`${CACHE}/v1/cache/list`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      key,
      value,
      semi: !!flags.semi,
      static: !!flags.static,
      scopeAddrs: flags.semi || flags.static ? undefined : [DAO],
    }),
  })
  const j = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`cache POST ${res.status} ${key}: ${j.error || ''}`)
  return j
}

for (const row of KEYS) {
  try {
    const value = await pull(row.key)
    if (value === null || value === undefined) {
      console.log('miss', row.key)
      continue
    }
    if (row.key.startsWith('votings:') && Array.isArray(value) && value.length === 0) {
      console.log('skip empty votings')
      continue
    }
    const out = await push(row.key, value, row)
    console.log('ok', row.key, 'bytes', out.bytes)
  } catch (e) {
    console.error('fail', row.key, e?.message || e)
  }
}
