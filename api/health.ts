import type { VercelRequest, VercelResponse } from '@vercel/node'
import { loadAssistantEnv } from '../../lib/assistant/types'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const env = loadAssistantEnv()

  return res.status(200).json({
    ok: true,
    assistant: Boolean(env),
    timestamp: new Date().toISOString(),
    hint: env
      ? 'Assistant API ready — POST /api/assistant/chat with Authorization: Bearer <token>'
      : 'Set OPENAI_API_KEY + Supabase env vars to enable the assistant',
  })
}
