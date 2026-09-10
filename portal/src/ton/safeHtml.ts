/**
 * Minimal HTML allowlist for deputy/party bio — strip scripts / handlers / bad URLs.
 * Pure string tokenizer (Node + browser, no DOMParser).
 */

const ALLOWED = new Set([
  'b', 'strong', 'i', 'em', 'u', 's', 'br', 'p', 'div',
  'ul', 'ol', 'li', 'h2', 'h3', 'h4', 'a', 'blockquote', 'span',
])

const VOID = new Set(['br'])

/** Decode common entities from contentEditable innerHTML before re-escaping. */
export function unescapeHtmlText(s: string): string {
  return String(s || '')
    .replace(/&nbsp;/gi, '\u00a0')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, n) => {
      const c = Number(n)
      return Number.isFinite(c) ? String.fromCodePoint(c) : ''
    })
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => {
      const c = parseInt(h, 16)
      return Number.isFinite(c) ? String.fromCodePoint(c) : ''
    })
    // &amp; last so &amp;nbsp; → &nbsp; → nbsp on a second pass if needed
    .replace(/&amp;/gi, '&')
}

export function escapeText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function isSafeHref(href: string): boolean {
  const h = href.trim()
  if (!h) return false
  if (h.startsWith('#') || h.startsWith('/')) return true
  try {
    const u = new URL(h, 'https://example.invalid')
    return u.protocol === 'https:' || u.protocol === 'http:' || u.protocol === 'mailto:'
  } catch {
    return false
  }
}

function attrMap(raw: string): Record<string, string> {
  const out: Record<string, string> = {}
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g
  let m: RegExpExecArray | null
  while ((m = re.exec(raw))) {
    out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? ''
  }
  return out
}

/** Strip dangerous markup; return safe HTML fragment. */
export function sanitizeBioHtml(dirty: string): string {
  let s = String(dirty || '')
  if (!s.trim()) return ''
  // contentEditable often emits &nbsp; / &amp; — unescape once before tokenize
  // so we never emit literal "&nbsp;" / "&amp;nbsp;" as visible text.
  s = s
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<\/?(iframe|object|embed|form|input|button|textarea|select|meta|link|base|svg|math|font)(\s[^>]*)?>/gi, '')

  const parts: string[] = []
  const re = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>|([^<]+)/g
  let m: RegExpExecArray | null
  const openStack: string[] = []

  while ((m = re.exec(s))) {
    if (m[3] != null) {
      // Decode browser entities, then escape once — avoids &amp;nbsp; ghosts.
      let text = unescapeHtmlText(m[3])
      // Second pass if nested &amp;nbsp;
      if (/&(?:nbsp|amp|lt|gt|quot|#)/i.test(text)) text = unescapeHtmlText(text)
      parts.push(escapeText(text))
      continue
    }
    const tag = m[1].toLowerCase()
    const full = m[0]
    const closing = full.startsWith('</')
    const selfClosing = /\/>\s*$/.test(full) || VOID.has(tag)

    if (!ALLOWED.has(tag)) continue

    if (closing) {
      while (openStack.length) {
        const top = openStack.pop()!
        parts.push(`</${top}>`)
        if (top === tag) break
      }
      continue
    }

    if (tag === 'a') {
      const attrs = attrMap(m[2] || '')
      let href = (attrs.href || '').trim()
      href = unescapeHtmlText(href)
      if (!isSafeHref(href)) continue
      parts.push(
        `<a href="${escapeText(href)}" rel="noopener noreferrer" target="_blank">`,
      )
      if (!selfClosing) openStack.push('a')
      continue
    }

    if (VOID.has(tag) || selfClosing) {
      parts.push(`<${tag}>`)
      continue
    }

    parts.push(`<${tag}>`)
    openStack.push(tag)
  }

  while (openStack.length) {
    parts.push(`</${openStack.pop()}>`)
  }

  return parts.join('')
}

/** Plain snippet for list cards (no markup). */
export function bioToPlain(raw: string, maxLen = 120): string {
  const html = sanitizeBioHtml(raw)
  const plain = unescapeHtmlText(
    html
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<\/(p|div|h[2-4]|li|blockquote)>/gi, ' ')
      .replace(/<[^>]+>/g, ''),
  )
    .replace(/\s+/g, ' ')
    .trim()
  if (plain.length <= maxLen) return plain
  return `${plain.slice(0, maxLen - 1)}…`
}

/**
 * HTML safe for display. Legacy plain text (no tags) keeps newlines via <br>.
 */
export function bioToDisplayHtml(raw: string): string {
  const trimmed = String(raw || '')
  if (!trimmed.trim()) return ''
  const looksHtml = /<[a-z][\s\S]*>/i.test(trimmed)
  if (!looksHtml) {
    return escapeText(trimmed).replace(/\r\n|\r|\n/g, '<br>')
  }
  return sanitizeBioHtml(trimmed)
}
