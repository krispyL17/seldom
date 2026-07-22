import type { SearchOptions, SearchResultItem } from '../../../search/types.js'

/**
 * Contract for swappable search providers.
 * Implement this interface to add Brave, SerpAPI, Bing, etc.
 */
export interface SearchProvider {
  readonly name: string
  search(query: string, options?: SearchOptions): Promise<SearchResultItem[]>
  isAvailable(): Promise<boolean>
}
