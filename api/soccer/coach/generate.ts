import type { VercelRequest, VercelResponse } from '@vercel/node'
import { setApiCors } from '../../../lib/cors.js'
import { extractBearerToken, verifyAccessToken } from '../../../lib/assistant/auth.js'
import { loadAssistantEnv } from '../../../lib/assistant/types.js'
import { OllamaUnavailableError, checkOllamaHealth, loadOllamaConfig } from '../../../lib/ollama/service.js'
import { handleCoachRequest } from '../../../lib/soccer-coach/orchestrator.js'
import type { CoachGenerateRequest } from '../../../lib/soccer-coach/types.js'

const VALID_MODES = ['training_plan', 'technical', 'tactical', 'development'] as const

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setApiCors(res, req.headers.origin)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const env = loadAssistantEnv()
  if (!env) {
    return res.status(503).json({
      error: 'Soccer coach not configured',
      hint: 'Set SUPABASE_URL, SUPABASE_ANON_KEY, and OLLAMA_MODEL in .env.local.',
    })
  }

  const ollamaHealth = await checkOllamaHealth(loadOllamaConfig())
  if (!ollamaHealth.online) {
    return res.status(503).json({
      error: 'Ollama unavailable',
      hint: 'Start Ollama locally and retry.',
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

  const body = req.body as CoachGenerateRequest
  if (!body.mode || !VALID_MODES.includes(body.mode)) {
    return res.status(400).json({
      error: 'mode is required',
      validModes: VALID_MODES,
    })
  }

  try {
    const result = await handleCoachRequest(auth.client, env, auth.userId, body)
    return res.status(200).json(result)
  } catch (err) {
    if (err instanceof OllamaUnavailableError) {
      return res.status(503).json({ error: err.message, hint: 'Start Ollama and retry.' })
    }
    const message = err instanceof Error ? err.message : 'Coach error'
    console.error('[soccer/coach/generate]', message)
    return res.status(500).json({ error: message })
  }
}
