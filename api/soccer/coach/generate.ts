import type { VercelRequest, VercelResponse } from '@vercel/node'
import { setApiCors } from '../../../lib/cors.js'
import { extractBearerToken, verifyAccessToken } from '../../../lib/assistant/auth.js'
import { loadAssistantEnv, extractUserOpenAiKey } from '../../../lib/assistant/types.js'
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

  const env = loadAssistantEnv(extractUserOpenAiKey(req.headers))
  if (!env) {
    return res.status(503).json({
      error: 'Soccer coach not configured',
      hint: 'Set OPENAI_API_KEY, SUPABASE_URL, and SUPABASE_ANON_KEY.',
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
    const message = err instanceof Error ? err.message : 'Coach error'
    console.error('[soccer/coach/generate]', message)
    return res.status(500).json({ error: message })
  }
}
