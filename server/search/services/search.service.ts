import type { SearchOptions, SearchResultItem, SearchSummary, SearchServerConfig } from '../../../search/types.js'
import { buildSearchContextBlock, buildSiteRestrictedQuery, isTrustedDomain, summarizeResults } from '../../../search/summarize.js'
import type { SearchProvider } from '../providers/search-provider.interface.js'

const WEB_SEARCH_HINTS =
  /\b(search|find|look up|latest|current|news|today|what is|who is|when is|how to|explain|definition|meaning of|price of|cost of|deadline|requirements)\b/i

/**
 * SearchService orchestrates provider calls, trusted-domain filtering, and summarization.
 */
export class SearchService {
  constructor(
    private readonly provider: SearchProvider,
    private readonly config: SearchServerConfig,
  ) {}

  shouldSearch(query: string): boolean {
    return WEB_SEARCH_HINTS.test(query.trim())
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchSummary> {
    const trimmed = query.trim()
    const limit = options.limit ?? this.config.maxResults
    const domains = options.domains ?? this.config.trustedDomains

    // trusted-apis provider already queries allowlisted sites; skip site: restriction
    const searchQuery =
      this.provider.name === 'trusted-apis'
        ? trimmed
        : buildSiteRestrictedQuery(trimmed, domains)

    const rawResults = await this.provider.search(searchQuery, { limit: limit * 2 })

    const trusted = rawResults
      .filter((item) => isTrustedDomain(item.url, domains))
      .slice(0, limit)

    return this.toSummary(trimmed, trusted)
  }

  async searchTrusted(query: string, options: SearchOptions = {}): Promise<SearchSummary> {
    return this.search(query, options)
  }

  getProviderName(): string {
    return this.provider.name
  }

  async isProviderAvailable(): Promise<boolean> {
    return this.provider.isAvailable()
  }

  private toSummary(query: string, results: SearchResultItem[]): SearchSummary {
    const summary = summarizeResults(query, results)
    const contextBlock = buildSearchContextBlock(query, results)

    return {
      query,
      provider: this.provider.name as SearchSummary['provider'],
      results,
      summary,
      contextBlock,
    }
  }
}
