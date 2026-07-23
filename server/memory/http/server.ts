import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import type { CreateMemoryInput, MemoryServerConfig } from '../../../memory/types.js'
import { openDatabase } from '../db/connection.js'
import { MemoryRepository } from '../db/memory.repository.js'
import { EmbeddingService } from '../services/embedding.service.js'
import { RetrievalService } from '../services/retrieval.service.js'
import { MemoryIndexer } from '../services/memory-indexer.js'
import { setSidecarCors } from '../../shared/cors.js'

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

function sendJson(res: ServerResponse, status: number, data: unknown, origin?: string) {
  setSidecarCors(res, origin)
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

export function createMemoryServer(config: MemoryServerConfig) {
  const db = openDatabase(config)
  const repository = new MemoryRepository(db)
  const embeddingService = new EmbeddingService(repository, config)
  const retrievalService = new RetrievalService(repository, embeddingService)
  const indexer = new MemoryIndexer(embeddingService)

  const server = createServer(async (req, res) => {
    const origin = req.headers.origin
    const reply = (status: number, data: unknown) => sendJson(res, status, data, origin)

    if (req.method === 'OPTIONS') {
      reply(204, null)
      return
    }

    const url = new URL(req.url ?? '/', `http://127.0.0.1:${config.port}`)
    const path = url.pathname

    try {
      if (req.method === 'GET' && path === '/health') {
        const ollama = await embeddingService.isOllamaAvailable()
        reply(200, {
          ok: true,
          memories: repository.count(),
          ollama,
          model: config.embeddingModel,
        })
        return
      }

      if (req.method === 'POST' && path === '/memories') {
        const body = await readJson<CreateMemoryInput>(req)
        const memory = await embeddingService.store(body)
        reply(201, {
          id: memory.id,
          category: memory.category,
          title: memory.title,
          importance: memory.importance,
          createdAt: memory.createdAt,
        })
        return
      }

      if (req.method === 'POST' && path === '/memories/batch') {
        const body = await readJson<{ items: CreateMemoryInput[] }>(req)
        const memories = await embeddingService.storeBatch(body.items ?? [])
        reply(201, { count: memories.length, ids: memories.map((m) => m.id) })
        return
      }

      if (req.method === 'POST' && path === '/retrieve') {
        const body = await readJson<{ query: string; limit?: number; categories?: string[]; minScore?: number }>(req)
        if (!body.query?.trim()) {
          reply(400, { error: 'query is required' })
          return
        }
        const result = await retrievalService.retrieve(body.query, {
          limit: body.limit,
          categories: body.categories as CreateMemoryInput['category'][] | undefined,
          minScore: body.minScore,
        })
        reply(200, result)
        return
      }

      if (req.method === 'GET' && path.startsWith('/memories/')) {
        const id = decodeURIComponent(path.slice('/memories/'.length))
        const memory = embeddingService.getById(id)
        if (!memory) {
          reply(404, { error: 'Not found' })
          return
        }
        const { embedding: _, ...rest } = memory
        reply(200, rest)
        return
      }

      if (req.method === 'DELETE' && path.startsWith('/memories/')) {
        const id = decodeURIComponent(path.slice('/memories/'.length))
        reply(200, { deleted: embeddingService.delete(id) })
        return
      }

      reply(404, { error: 'Not found' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Internal error'
      reply(500, { error: message })
    }
  })

  return { server, db, embeddingService, retrievalService, indexer, repository }
}

export function startMemoryServer(config: MemoryServerConfig) {
  const { server } = createMemoryServer(config)
  server.listen(config.port, '127.0.0.1', () => {
    console.log(`Seldom memory server listening on http://127.0.0.1:${config.port}`)
    console.log(`SQLite: ${config.dbPath}`)
    console.log(`Ollama model: ${config.embeddingModel}`)
  })
  return server
}
