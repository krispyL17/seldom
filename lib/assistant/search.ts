import { buildSearchContextBlock } from '../../search/summarize'
import type { SearchResultItem, SearchSummary } from '../../search/types'

const WEB_SEARCH_HINTS =
  /\b(search|find|look up|latest|current|news|today|what is|who is|when is|how to|explain|definition|meaning of|price of|cost of|deadline|requirements)\b/i

const USER_AGENT = 'Seldom/1.0 (personal assistant)'

export function shouldWebSearch(query: string): boolean {
  return WEB_SEARCH_HINTS.test(query.trim())
}

async function searchWikipedia(query: string, limit: number): Promise<SearchResultItem[]> {
  const url = new URL('https://en.wikipedia.org/w/api.php')
  url.searchParams.set('action', 'query')
  url.searchParams.set('list', 'search')
  url.searchParams.set('srsearch', query)
  url.searchParams.set('srlimit', String(limit))
  url.searchParams.set('format', 'json')

  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) return []

  const data = (await response.json()) as { query?: { search?: Array<{ title: string; snippet: string }> } }
  return (data.query?.search ?? []).map((hit) => ({
    title: hit.title,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title.replace(/ /g, '_'))}`,
    snippet: hit.snippet.replace(/<[^>]+>/g, ''),
    domain: 'en.wikipedia.org',
  }))
}

async function searchStackOverflow(query: string, limit: number): Promise<SearchResultItem[]> {
  const url = new URL('https://api.stackexchange.com/2.3/search/advanced')
  url.searchParams.set('order', 'desc')
  url.searchParams.set('sort', 'relevance')
  url.searchParams.set('q', query)
  url.searchParams.set('site', 'stackoverflow')
  url.searchParams.set('pagesize', String(limit))

  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) return []

  const data = (await response.json()) as { items?: Array<{ title: string; link: string; excerpt: string }> }
  return (data.items ?? []).map((item) => ({
    title: item.title,
    url: item.link,
    snippet: item.excerpt.replace(/<[^>]+>/g, ''),
    domain: 'stackoverflow.com',
  }))
}

export async function runWebSearch(query: string): Promise<SearchSummary | null> {
  const [wiki, stack] = await Promise.allSettled([
    searchWikipedia(query, 3),
    searchStackOverflow(query, 2),
  ])

  const results: SearchResultItem[] = []
  if (wiki.status === 'fulfilled') results.push(...wiki.value)
  if (stack.status === 'fulfilled') results.push(...stack.value)

  if (results.length === 0) return null

  return {
    query,
    provider: 'trusted-apis',
    results: results.slice(0, 5),
    summary: results.map((r, i) => `${i + 1}. ${r.title}: ${r.snippet}`).join('\n'),
    contextBlock: buildSearchContextBlock(query, results.slice(0, 5)),
  }
}
