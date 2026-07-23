import type { VercelRequest, VercelResponse } from '@vercel/node'
import { setApiCors } from '../../lib/cors.js'
import { extractBearerToken, verifyAccessToken } from '../../lib/assistant/auth.js'
import { loadAssistantEnv } from '../../lib/assistant/types.js'
import { getCoachSuggestions, getCoachWelcome, handleCoachRequest } from '../../lib/soccer-coach/orchestrator.js'
import type { CoachChatRequest, CoachMode } from '../../lib/soccer-coach/types.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setApiCors(res, req.headers.origin)

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  const env = loadAssistantEnv()
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

  if (req.method === 'GET') {
    try {
      const suggestions = await getCoachSuggestions(auth.client)
      const welcome = await getCoachWelcome(auth.client)
      return res.status(200).json({ suggestions, welcome })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load suggestions'
      return res.status(500).json({ error: message })
    }
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const body = req.body as CoachChatRequest & { mode?: CoachMode }
  if (!body.message?.trim() && body.mode === 'chat') {
    return res.status(400).json({ error: 'message is required for chat mode' })
  }

  try {
    const result = await handleCoachRequest(auth.client, env, auth.userId, {
      message: body.message ?? '',
      mode: body.mode ?? 'chat',
      history: body.history,
    })
    return res.status(200).json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Coach error'
    console.error('[soccer/coach/chat]', message)
    return res.status(500).json({ error: message })
  }
}
