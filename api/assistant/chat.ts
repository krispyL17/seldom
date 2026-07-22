import type { VercelRequest, VercelResponse } from '@vercel/node'
import { extractBearerToken, verifyAccessToken } from '../../lib/assistant/auth.js'
import { handleChat } from '../../lib/assistant/orchestrator.js'
import { loadAssistantEnv } from '../../lib/assistant/types.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const env = loadAssistantEnv()
  if (!env) {
    return res.status(503).json({
      error: 'Assistant not configured',
      hint: 'Set OPENAI_API_KEY, SUPABASE_URL, and SUPABASE_ANON_KEY in Vercel environment variables.',
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

  const body = req.body as { message?: string; history?: Array<{ role: 'user' | 'assistant'; content: string }> }
  if (!body.message?.trim()) {
    return res.status(400).json({ error: 'message is required' })
  }

  try {
    const result = await handleChat(auth.client, env, {
      message: body.message,
      history: body.history,
    })
    return res.status(200).json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Assistant error'
    console.error('[assistant/chat]', message)
    return res.status(500).json({ error: message })
  }
}
