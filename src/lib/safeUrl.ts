const ALLOWED_PROTOCOLS = new Set(['http:', 'https:', 'mailto:'])

/** Block javascript: and other unsafe link targets in user/LLM markdown. */
export function sanitizeHref(href: string | undefined): string | undefined {
  if (!href) return undefined
  const trimmed = href.trim()
  if (trimmed.startsWith('#') || trimmed.startsWith('/')) return trimmed

  try {
    const url = new URL(trimmed, 'https://example.invalid')
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) return undefined
    return trimmed
  } catch {
    return undefined
  }
}
