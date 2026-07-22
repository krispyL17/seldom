import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { DEFAULT_SEARCH_CONFIG, type SearchServerConfig } from '../../../search/types.js'
import { createSearchProvider } from '../providers/provider.factory.js'
import { SearchService } from '../services/search.service.js'

function readJson<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      try {
        resolve(body ? (JSON.parse(body) as T) : ({} as T))
      } catch (err) {
        reject(err)
      }
    })
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  })
  res.end(JSON.stringify(data))
}

export function createSearchServer(config: SearchServerConfig) {
  const provider = createSearchProvider(config)
  const searchService = new SearchService(provider, config)

  const server = createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      sendJson(res, 204, null)
      return
    }

    const url = new URL(req.url ?? '/', `http://127.0.0.1:${config.port}`)
    const path = url.pathname

    try {
      if (req.method === 'GET' && path === '/health') {
        const available = await searchService.isProviderAvailable()
        sendJson(res, 200, {
          ok: true,
          provider: searchService.getProviderName(),
          available,
          trustedDomains: config.trustedDomains.length,
        })
        return
      }

      if (req.method === 'POST' && path === '/search') {
        const body = await readJson<{ query: string; limit?: number; force?: boolean }>(req)

        if (!body.query?.trim()) {
          sendJson(res, 400, { error: 'query is required' })
          return
        }

        if (!body.force && !searchService.shouldSearch(body.query)) {
          sendJson(res, 200, {
            query: body.query,
            skipped: true,
            reason: 'Query does not appear to need web search',
            provider: searchService.getProviderName(),
            results: [],
            summary: '',
            contextBlock: '',
          })
          return
        }

        const result = await searchService.searchTrusted(body.query, { limit: body.limit })
        sendJson(res, 200, result)
        return
      }

      sendJson(res, 404, { error: 'Not found' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal error'
      sendJson(res, 500, { error: message })
    }
  })

  return { server, searchService }
}

export function startSearchServer(config: SearchServerConfig = DEFAULT_SEARCH_CONFIG) {
  const { server } = createSearchServer(config)
  server.listen(config.port, () => {
    console.log(`Seldom search server listening on http://127.0.0.1:${config.port}`)
    console.log(`Provider: ${config.provider}`)
    console.log(`Trusted domains: ${config.trustedDomains.length}`)
  })
  return server
}

export function loadSearchConfig(): SearchServerConfig {
  const provider = (process.env.SEARCH_PROVIDER ?? DEFAULT_SEARCH_CONFIG.provider) as SearchServerConfig['provider']

  return {
    ...DEFAULT_SEARCH_CONFIG,
    port: Number(process.env.SEARCH_PORT ?? DEFAULT_SEARCH_CONFIG.port),
    provider,
    tavilyApiKey: process.env.TAVILY_API_KEY,
    maxResults: Number(process.env.SEARCH_MAX_RESULTS ?? DEFAULT_SEARCH_CONFIG.maxResults),
  }
}
