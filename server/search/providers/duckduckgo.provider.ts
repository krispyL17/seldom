import type { SearchOptions, SearchResultItem } from '../../../search/types.js'
import type { SearchProvider } from './search-provider.interface.js'

interface DuckDuckGoHtmlResult {
  title: string
  url: string
  snippet: string
}

/**
 * DuckDuckGo HTML search — no API key required.
 * Parses lite HTML results from html.duckduckgo.com.
 */
export class DuckDuckGoProvider implements SearchProvider {
  readonly name = 'duckduckgo'

  async search(query: string, options: SearchOptions = {}): Promise<SearchResultItem[]> {
    const limit = options.limit ?? 8

    const response = await fetch('https://html.duckduckgo.com/html/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Seldom/1.0 (personal assistant)',
      },
      body: new URLSearchParams({
        q: query,
        b: '',
        kl: 'us-en',
      }),
    })

    if (!response.ok) {
      throw new Error(`DuckDuckGo search failed (${response.status})`)
    }

    const html = await response.text()
    const parsed = this.parseHtmlResults(html).slice(0, limit)

    return parsed.map((item) => ({
      title: item.title,
      url: item.url,
      snippet: item.snippet,
      domain: this.extractDomain(item.url),
    }))
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch('https://html.duckduckgo.com/html/', {
        method: 'HEAD',
      })
      return response.ok || response.status === 405
    } catch {
      return false
    }
  }

  private parseHtmlResults(html: string): DuckDuckGoHtmlResult[] {
    const results: DuckDuckGoHtmlResult[] = []

    const resultBlockRegex =
      /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?(?:class="result__snippet"[^>]*>([\s\S]*?)<\/a>|<td[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/td>)/gi

    let match: RegExpExecArray | null
    while ((match = resultBlockRegex.exec(html)) !== null) {
      const rawUrl = this.decodeRedirect(match[1] ?? '')
      const title = this.stripTags(match[2] ?? '').trim()
      const snippet = this.stripTags(match[3] ?? match[4] ?? '').trim()

      if (!rawUrl || !title) continue

      results.push({ title, url: rawUrl, snippet: snippet || title })
    }

    if (results.length > 0) return results

    // Fallback: simpler link/snippet pairs
    const linkRegex = /class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
    while ((match = linkRegex.exec(html)) !== null) {
      const rawUrl = this.decodeRedirect(match[1] ?? '')
      const title = this.stripTags(match[2] ?? '').trim()
      if (rawUrl && title) {
        results.push({ title, url: rawUrl, snippet: title })
      }
    }

    return results
  }

  private decodeRedirect(url: string): string {
    try {
      if (url.includes('uddg=')) {
        const parsed = new URL(url, 'https://duckduckgo.com')
        const target = parsed.searchParams.get('uddg')
        if (target) return decodeURIComponent(target)
      }
      return url
    } catch {
      return url
    }
  }

  private stripTags(value: string): string {
    return value
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
  }

  private extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace(/^www\./, '')
    } catch {
      return ''
    }
  }
}
