/**
 * Pure helpers for building AI context from search results.
 */

import type { SearchResultItem } from './types.js'

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function isTrustedDomain(url: string, trustedDomains: string[]): boolean {
  const hostname = extractDomain(url).toLowerCase()
  if (!hostname) return false

  return trustedDomains.some((allowed) => {
    const rule = allowed.toLowerCase()
    if (rule === 'edu') return hostname.endsWith('.edu')
    return hostname === rule || hostname.endsWith(`.${rule}`)
  })
}

export function buildSiteRestrictedQuery(query: string, domains: string[], maxSites = 4): string {
  const sites = domains.slice(0, maxSites).map((d) => `site:${d}`)
  return `(${sites.join(' OR ')}) ${query}`
}

export function summarizeResults(query: string, results: SearchResultItem[]): string {
  if (results.length === 0) {
    return `No trusted results found for "${query}".`
  }

  const bullets = results.map(
    (r, i) => `${i + 1}. **${r.title}** (${r.domain}): ${r.snippet}`,
  )

  return [`Search summary for "${query}":`, ...bullets].join('\n')
}

export function buildSearchContextBlock(query: string, results: SearchResultItem[]): string {
  if (results.length === 0) return ''

  const lines = results.map(
    (r, i) =>
      `[${i + 1}] ${r.title} (${r.domain})\n${r.snippet}\nSource: ${r.url}`,
  )

  return `## Web search results (trusted sources)\n\nQuery: ${query}\n\n${lines.join('\n\n')}`
}
