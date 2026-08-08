import type { VercelRequest, VercelResponse } from '@vercel/node'
import { setApiCors } from '../../lib/cors.js'
import {
  checkOllamaHealth,
  getLastOllamaMetrics,
  getOllamaEnvStatus,
  loadOllamaConfig,
} from '../../lib/ollama/service.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setApiCors(res, req.headers.origin)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const config = loadOllamaConfig()
  const envStatus = getOllamaEnvStatus()
  const health = await checkOllamaHealth(config)
  const metrics = getLastOllamaMetrics()

  return res.status(200).json({
    configured: envStatus.ready,
    missing: envStatus.missing,
    status: health.online ? 'online' : 'offline',
    online: health.online,
    baseUrl: health.baseUrl,
    model: health.model,
    embedModel: health.embedModel,
    responseTimeMs: health.responseTimeMs ?? metrics.lastResponseTimeMs,
    lastSuccessfulAt: health.lastSuccessfulAt ?? metrics.lastSuccessfulAt,
    error: health.error ?? null,
    message: health.online
      ? 'Ollama is reachable.'
      : 'Ollama is offline. Start Ollama locally and verify OLLAMA_BASE_URL / OLLAMA_MODEL in .env.local.',
  })
}
