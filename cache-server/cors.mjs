/**
 * Thin CORS for State cache-server (subset of dao/civic-verifier/publicApi.mjs).
 */

const DEFAULT_ALLOW_HEADERS = 'Content-Type, Authorization, Accept'
const DEFAULT_ALLOW_METHODS = 'GET, POST, OPTIONS'

/**
 * @param {import('http').IncomingMessage} req
 * @param {import('http').ServerResponse} res
 * @param {NodeJS.ProcessEnv} [env]
 */
export function applyCors(req, res, env = process.env) {
  const configured = String(env.CORS_ORIGIN || '').trim()
  const origin = configured || '*'
  const reqOrigin = String(req.headers?.origin || '').trim()
  if (origin === '*') {
    if (reqOrigin) {
      res.setHeader('Access-Control-Allow-Origin', reqOrigin)
      res.setHeader('Vary', 'Origin')
    } else {
      res.setHeader('Access-Control-Allow-Origin', '*')
    }
  } else {
    const allowed = configured.split(',').map((s) => s.trim()).filter(Boolean)
    const pick = reqOrigin && allowed.includes(reqOrigin) ? reqOrigin : allowed[0] || origin
    res.setHeader('Access-Control-Allow-Origin', pick)
    res.setHeader('Vary', 'Origin')
  }
  res.setHeader('Access-Control-Allow-Methods', DEFAULT_ALLOW_METHODS)
  res.setHeader('Access-Control-Allow-Headers', DEFAULT_ALLOW_HEADERS)
  res.setHeader('Access-Control-Max-Age', '86400')
  res.setHeader('Access-Control-Expose-Headers', 'Retry-After')
}
