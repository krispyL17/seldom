export type {
  SearchOptions,
  SearchProviderName,
  SearchResultItem,
  SearchSummary,
} from '../../../search/types'

export {
  searchWeb,
  searchHealthCheck,
  isSearchServerAvailable,
  queryNeedsWebSearch,
  type SearchRequestOptions,
  type SearchResponse,
} from './searchClient'
