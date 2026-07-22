/**
 * HTTP client for the local search server.
 * Vite proxies /api/search → http://127.0.0.1:3848
 */

import type { SearchOptions, SearchSummary } from '../../../search/types'

const BASE = '/api/search'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? `Search API error (${response.status})`)
  }

  return response.json() as Promise<T>
}

export interface SearchRequestOptions extends SearchOptions {
  /** Run search even if heuristics say it is not needed */
  force?: boolean
}

export type SearchResponse = SearchSummary & {
  skipped?: boolean
  reason?: string
}

export async function searchWeb(
  query: string,
  options: SearchRequestOptions = {},
): Promise<SearchResponse> {
  return request<SearchResponse>('/search', {
    method: 'POST',
    body: JSON.stringify({ query, limit: options.limit, force: options.force }),
  })
}

export async function searchHealthCheck(): Promise<{
  ok: boolean
  provider: string
  available: boolean
  trustedDomains: number
}> {
  return request('/health')
}

export async function isSearchServerAvailable(): Promise<boolean> {
  try {
    const health = await searchHealthCheck()
    return health.ok
  } catch {
    return false
  }
}

/** Returns true when the query likely needs live web information */
export function queryNeedsWebSearch(query: string): boolean {
  return /\b(search|find|look up|latest|current|news|today|what is|who is|when is|how to|explain|definition|meaning of|price of|cost of|deadline|requirements)\b/i.test(
    query.trim(),
  )
}
