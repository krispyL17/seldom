import { buildSearchContextBlock } from '../../search/summarize.js'
import type { SearchResultItem, SearchSummary } from '../../search/types.js'
import type { PromptSearchConfig } from '../prompts/loader.js'

const USER_AGENT = 'Seldom/1.0 (soccer coach)'

async function searchWikipedia(query: string, limit: number): Promise<SearchResultItem[]> {
  const url = new URL('https://en.wikipedia.org/w/api.php')
  url.searchParams.set('action', 'query')
  url.searchParams.set('list', 'search')
  url.searchParams.set('srsearch', query)
  url.searchParams.set('srlimit', String(limit))
  url.searchParams.set('format', 'json')

  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
  if (!response.ok) return []

  const data = (await response.json()) as {
    query?: { search?: Array<{ title: string; snippet: string }> }
  }

  return (data.query?.search ?? []).map((hit) => ({
    title: hit.title,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title.replace(/ /g, '_'))}`,
    snippet: hit.snippet.replace(/<[^>]+>/g, ''),
    domain: 'en.wikipedia.org',
  }))
}

function buildQueries(topic: string, config?: PromptSearchConfig): string[] {
  if (!config?.queryTemplates?.length) {
    return [`${topic} soccer coaching`, `${topic} football training drill`]
  }
  return config.queryTemplates.map((t) => t.replace(/\{\{topic\}\}/g, topic))
}

function filterTrusted(results: SearchResultItem[], config?: PromptSearchConfig): SearchResultItem[] {
  const domains = config?.trustedDomains
  if (!domains?.length) return results
  const trusted = results.filter((r) => domains.some((d) => r.domain.includes(d.replace(/^www\./, ''))))
  return trusted.length > 0 ? trusted : results
}

export function shouldCoachWebSearch(message: string, config?: PromptSearchConfig): boolean {
  if (config?.enabled === false) return false
  const trimmed = message.trim()
  if (trimmed.length < 4) return false
  return true
}

export async function runCoachingSearch(
  topic: string,
  config?: PromptSearchConfig,
): Promise<SearchSummary | null> {
  const queries = buildQueries(topic, config).slice(0, 3)
  const settled = await Promise.allSettled(queries.map((q) => searchWikipedia(q, 2)))

  const results: SearchResultItem[] = []
  for (const result of settled) {
    if (result.status === 'fulfilled') results.push(...result.value)
  }

  const unique = filterTrusted(
    results.filter((r, i, arr) => arr.findIndex((x) => x.url === r.url) === i),
    config,
  ).slice(0, 5)

  if (unique.length === 0) return null

  return {
    query: topic,
    provider: 'coaching-resources',
    results: unique,
    summary: unique.map((r, i) => `${i + 1}. ${r.title}: ${r.snippet}`).join('\n'),
    contextBlock: buildSearchContextBlock(topic, unique),
  }
}
