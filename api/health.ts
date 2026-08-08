import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  checkOllamaHealth,
  getOllamaEnvStatus,
  getLastOllamaMetrics,
  loadOllamaConfig,
} from '../lib/ollama/service.js'
import { loadAssistantEnv } from '../lib/assistant/types.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const env = loadAssistantEnv()
  const status = getOllamaEnvStatus()
  const ollamaConfig = loadOllamaConfig()
  const ollamaHealth = await checkOllamaHealth(ollamaConfig)
  const metrics = getLastOllamaMetrics()

  return res.status(200).json({
    ok: true,
    assistant: Boolean(env) && ollamaHealth.online,
    ollama: {
      ...ollamaHealth,
      lastSuccessfulAt: ollamaHealth.lastSuccessfulAt ?? metrics.lastSuccessfulAt,
      responseTimeMs: ollamaHealth.responseTimeMs ?? metrics.lastResponseTimeMs,
    },
    timestamp: new Date().toISOString(),
    missing: status.missing,
    hint: env && ollamaHealth.online
      ? 'Assistant API ready — POST /api/assistant/chat with Authorization: Bearer <token>'
      : ollamaHealth.online
        ? status.missing.join('; ')
        : 'Seldom requires Ollama. Start Ollama locally (default http://localhost:11434) and set OLLAMA_MODEL in .env.local.',
  })
}
