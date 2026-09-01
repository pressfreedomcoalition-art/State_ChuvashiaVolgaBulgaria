/**
 * Re-copy listCache + liveCacheKeys (+ votingsUnion) from sibling ../dao.
 * Run from cache-server/: npm run sync-from-dao
 */
import { copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const cacheRoot = join(here, '..')
const daoCv = join(cacheRoot, '..', '..', 'dao', 'civic-verifier')
// State_ChuvashiaVolgaBulgaria/cache-server → ../../dao is wrong;
// sibling is ../dao from State root = cache-server/../dao
const daoCvSibling = join(cacheRoot, '..', 'dao', 'civic-verifier')
const files = ['listCache.mjs', 'liveCacheKeys.mjs', 'votingsUnion.mjs']

const srcDir = existsSync(join(daoCvSibling, 'listCache.mjs'))
  ? daoCvSibling
  : existsSync(join(daoCv, 'listCache.mjs'))
    ? daoCv
    : null

if (!srcDir) {
  console.error('dao civic-verifier not found (expected ../dao/civic-verifier from State root)')
  process.exit(1)
}

for (const f of files) {
  const src = join(srcDir, f)
  const dst = join(cacheRoot, f)
  if (!existsSync(src)) {
    console.warn('skip missing', src)
    continue
  }
  copyFileSync(src, dst)
  console.log('copied', f, '←', srcDir)
}
