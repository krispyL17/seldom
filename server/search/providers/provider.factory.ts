import type { SearchProviderName, SearchServerConfig } from '../../../search/types.js'
import { DuckDuckGoProvider } from './duckduckgo.provider.js'
import { TavilyProvider } from './tavily.provider.js'
import { TrustedApisProvider } from './trusted-apis.provider.js'
import type { SearchProvider } from './search-provider.interface.js'

/**
 * Factory for search providers — swap via SEARCH_PROVIDER env var.
 */
export function createSearchProvider(config: SearchServerConfig): SearchProvider {
  const name: SearchProviderName = config.provider

  switch (name) {
    case 'tavily':
      if (!config.tavilyApiKey) {
        console.warn('[search] Tavily selected but TAVILY_API_KEY missing — falling back to trusted-apis')
        return new TrustedApisProvider()
      }
      return new TavilyProvider(config.tavilyApiKey)
    case 'duckduckgo':
      return new DuckDuckGoProvider()
    case 'trusted-apis':
    default:
      return new TrustedApisProvider()
  }
}
