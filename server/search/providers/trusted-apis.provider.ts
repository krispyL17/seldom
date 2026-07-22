import type { SearchOptions, SearchResultItem } from '../../../search/types.js'
import type { SearchProvider } from './search-provider.interface.js'

interface WikiSearchHit {
  title: string
  snippet: string
}

interface StackSearchItem {
  title: string
  link: string
  excerpt: string
}

interface MdnSearchDoc {
  title: string
  mdn_url: string
  summary: string
}

const USER_AGENT = 'Seldom/1.0 (personal assistant; +https://github.com/seldom)'

/**
 * Queries trusted sites directly via their public APIs — no scraping, no API keys.
 * Sources: Wikipedia, Stack Overflow, MDN.
 */
export class TrustedApisProvider implements SearchProvider {
  readonly name = 'trusted-apis'

  async search(query: string, options: SearchOptions = {}): Promise<SearchResultItem[]> {
    const limit = options.limit ?? 6
    const perSource = Math.max(2, Math.ceil(limit / 3))

    const [wiki, stack, mdn] = await Promise.allSettled([
      this.searchWikipedia(query, perSource),
      this.searchStackOverflow(query, perSource),
      this.searchMdn(query, perSource),
    ])

    const merged: SearchResultItem[] = []
    for (const batch of [wiki, stack, mdn]) {
      if (batch.status === 'fulfilled') merged.push(...batch.value)
    }

    return merged.slice(0, limit)
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(
        'https://en.wikipedia.org/w/api.php?action=query&meta=siteinfo&format=json',
        { headers: { 'User-Agent': USER_AGENT } },
      )
      return response.ok
    } catch {
      return false
    }
  }

  private async searchWikipedia(query: string, limit: number): Promise<SearchResultItem[]> {
    const url = new URL('https://en.wikipedia.org/w/api.php')
    url.searchParams.set('action', 'query')
    url.searchParams.set('list', 'search')
    url.searchParams.set('srsearch', query)
    url.searchParams.set('srlimit', String(limit))
    url.searchParams.set('format', 'json')

    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (!response.ok) return []

    const data = (await response.json()) as { query?: { search?: WikiSearchHit[] } }
    return (data.query?.search ?? []).map((hit) => ({
      title: hit.title,
      url: `https://en.wikipedia.org/wiki/${encodeURIComponent(hit.title.replace(/ /g, '_'))}`,
      snippet: this.stripHtml(hit.snippet),
      domain: 'en.wikipedia.org',
    }))
  }

  private async searchStackOverflow(query: string, limit: number): Promise<SearchResultItem[]> {
    const url = new URL('https://api.stackexchange.com/2.3/search/advanced')
    url.searchParams.set('order', 'desc')
    url.searchParams.set('sort', 'relevance')
    url.searchParams.set('q', query)
    url.searchParams.set('site', 'stackoverflow')
    url.searchParams.set('pagesize', String(limit))

    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (!response.ok) return []

    const data = (await response.json()) as { items?: StackSearchItem[] }
    return (data.items ?? []).map((item) => ({
      title: item.title,
      url: item.link,
      snippet: this.stripHtml(item.excerpt),
      domain: 'stackoverflow.com',
    }))
  }

  private async searchMdn(query: string, limit: number): Promise<SearchResultItem[]> {
    const url = new URL('https://developer.mozilla.org/api/v1/search')
    url.searchParams.set('q', query)
    url.searchParams.set('locale', 'en-US')

    const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
    if (!response.ok) return []

    const data = (await response.json()) as { documents?: MdnSearchDoc[] }
    return (data.documents ?? []).slice(0, limit).map((doc) => ({
      title: doc.title,
      url: `https://developer.mozilla.org${doc.mdn_url}`,
      snippet: this.stripHtml(doc.summary),
      domain: 'developer.mozilla.org',
    }))
  }

  private stripHtml(value: string): string {
    return value
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .trim()
  }
}
