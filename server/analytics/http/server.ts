import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { DEFAULT_ANALYTICS_CONFIG } from '../../../analytics/types.js'
import type { AnalyticsSyncPayload } from '../../../analytics/types.js'
import { openAnalyticsDatabase } from '../db/connection.js'
import { AnalyticsService } from '../services/analytics.service.js'
import { setSidecarCors } from '../../shared/cors.js'

const config = DEFAULT_ANALYTICS_CONFIG
const db = openAnalyticsDatabase(config)
const service = new AnalyticsService(db)

async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf8')
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

export function startAnalyticsServer(port = config.port) {
  const server = createServer(async (req, res) => {
    const origin = req.headers.origin
    setSidecarCors(res, origin)

    if (req.method === 'OPTIONS') {
      res.writeHead(204)
      res.end()
      return
    }

    const url = new URL(req.url ?? '/', `http://127.0.0.1:${port}`)
    const path = url.pathname

    try {
      if (req.method === 'GET' && path === '/health') {
        const stats = service.stats()
        return json(res, 200, { ok: true, sqlite: true, ...stats })
      }

      if (req.method === 'GET' && path === '/dashboard') {
        const userId = url.searchParams.get('userId')
        if (!userId) return json(res, 400, { error: 'userId is required' })
        const dashboard = service.getDashboard(userId)
        if (!dashboard) return json(res, 404, { error: 'No analytics snapshot — sync first' })
        return json(res, 200, dashboard)
      }

      if (req.method === 'GET' && path === '/gym') {
        const userId = url.searchParams.get('userId')
        if (!userId) return json(res, 400, { error: 'userId is required' })
        return json(res, 200, { logs: service.listGymLogs(userId) })
      }

      if (req.method === 'POST' && path === '/sync') {
        const body = JSON.parse(await readBody(req)) as AnalyticsSyncPayload
        if (!body.userId) return json(res, 400, { error: 'userId is required' })
        const dashboard = service.syncAndCompute(body)
        return json(res, 200, dashboard)
      }

      if (req.method === 'POST' && path === '/gym') {
        const body = JSON.parse(await readBody(req)) as {
          userId: string
          session_date: string
          duration_min: number
          workout_type?: string
          notes?: string
        }
        if (!body.userId) return json(res, 400, { error: 'userId is required' })
        const log = service.addGymLog(body.userId, body)
        return json(res, 201, log)
      }

      json(res, 404, { error: 'Not found' })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Analytics server error'
      console.error('[analytics]', message)
      json(res, 500, { error: message })
    }
  })

  server.listen(port, '127.0.0.1', () => {
    console.log(`Analytics server http://127.0.0.1:${port}`)
    console.log(`SQLite: ${config.dbPath}`)
  })

  return server
}
