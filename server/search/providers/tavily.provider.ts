import type { SearchOptions, SearchResultItem } from '../../../search/types.js'
import type { SearchProvider } from './search-provider.interface.js'

interface TavilyResult {
  title: string
  url: string
  content: string
}

/**
 * Tavily search API — optional provider when TAVILY_API_KEY is set.
 * https://docs.tavily.com/
 */
export class TavilyProvider implements SearchProvider {
  readonly name = 'tavily'

  constructor(private readonly apiKey: string) {}

  async search(query: string, options: SearchOptions = {}): Promise<SearchResultItem[]> {
    const limit = options.limit ?? 8

    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: this.apiKey,
        query,
        max_results: limit,
        include_answer: false,
        search_depth: 'basic',
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Tavily search failed (${response.status}): ${body}`)
    }

    const data = (await response.json()) as { results?: TavilyResult[] }

    return (data.results ?? []).map((item) => ({
      title: item.title,
      url: item.url,
      snippet: item.content,
      domain: this.extractDomain(item.url),
    }))
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(this.apiKey)
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '')
    } catch {
      return ''
    }
  }
}
