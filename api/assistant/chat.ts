import type { VercelRequest, VercelResponse } from '@vercel/node'
import { setApiCors } from '../../lib/cors.js'
import { extractBearerToken, verifyAccessToken } from '../../lib/assistant/auth.js'
import { getAssistantBootstrap, handleChat } from '../../lib/assistant/orchestrator.js'
import { loadAssistantEnv, getAssistantEnvStatus } from '../../lib/assistant/types.js'
import { OllamaUnavailableError, checkOllamaHealth, loadOllamaConfig } from '../../lib/ollama/service.js'
import type { OSMode } from '../../lib/orchestration/types.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setApiCors(res, req.headers.origin)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  const env = loadAssistantEnv()
  if (!env) {
    const status = getAssistantEnvStatus()
    return res.status(503).json({
      error: 'Assistant not configured',
      missing: status.missing,
      hint: `Missing: ${status.missing.join('; ')}. Set Supabase + OLLAMA_MODEL in .env.local and restart dev:vercel.`,
    })
  }

  const ollamaHealth = await checkOllamaHealth(loadOllamaConfig())
  if (!ollamaHealth.online) {
    return res.status(503).json({
      error: 'Ollama unavailable',
      hint: 'Seldom requires Ollama. Start Ollama locally (http://localhost:11434) and pull your model, then retry.',
      ollama: ollamaHealth,
    })
  }

  const token = extractBearerToken(req.headers.authorization)
  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization header' })
  }

  const auth = await verifyAccessToken(env, token)
  if (!auth) {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }

  if (req.method === 'GET') {
    try {
      const bootstrap = await getAssistantBootstrap(auth.client, env, auth.userId)
      return res.status(200).json(bootstrap)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load assistant bootstrap'
      console.error('[assistant/chat GET]', message)
      return res.status(500).json({ error: message })
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body as {
    message?: string
    mode?: OSMode
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  }

  if (!body.message?.trim()) {
    return res.status(400).json({ error: 'message is required' })
  }

  try {
    const result = await handleChat(auth.client, env, auth.userId, {
      message: body.message,
      mode: body.mode,
      history: body.history,
    })
    return res.status(200).json(result)
  } catch (err) {
    if (err instanceof OllamaUnavailableError) {
      return res.status(503).json({ error: err.message, hint: 'Start Ollama and retry.' })
    }
    const message = err instanceof Error ? err.message : 'Assistant error'
    console.error('[assistant/chat]', message)
    return res.status(500).json({ error: message })
  }
}
