/**
 * Shared search types — used by the Node search server and React client.
 */

export type SearchProviderName = 'trusted-apis' | 'duckduckgo' | 'tavily'

export interface SearchResultItem {
  title: string
  url: string
  snippet: string
  domain: string
}

export interface SearchOptions {
  limit?: number
  /** Restrict to these domains; defaults to trusted allowlist */
  domains?: string[]
}

export interface SearchSummary {
  query: string
  provider: SearchProviderName
  results: SearchResultItem[]
  /** Compact summary for AI context injection */
  summary: string
  contextBlock: string
}

export interface SearchServerConfig {
  port: number
  provider: SearchProviderName
  tavilyApiKey?: string
  maxResults: number
  trustedDomains: string[]
}

export const DEFAULT_SEARCH_CONFIG: SearchServerConfig = {
  port: 3848,
  provider: 'trusted-apis',
  maxResults: 5,
  trustedDomains: [
    'developer.mozilla.org',
    'en.wikipedia.org',
    'wikipedia.org',
    'stackoverflow.com',
    'stackexchange.com',
    'collegeboard.org',
    'commonapp.org',
    'khanacademy.org',
    'britannica.com',
    'github.com',
    'docs.github.com',
    'nih.gov',
    'cdc.gov',
    'usa.gov',
    'edu',
  ],
}
