import type { VercelRequest, VercelResponse } from '@vercel/node'
import { getAssistantEnvStatus, loadAssistantEnv } from '../lib/assistant/types.js'

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const env = loadAssistantEnv()
  const status = getAssistantEnvStatus()

  return res.status(200).json({
    ok: true,
    assistant: Boolean(env),
    timestamp: new Date().toISOString(),
    missing: status.missing,
    hint: env
      ? 'Assistant API ready — POST /api/assistant/chat with Authorization: Bearer <token>'
      : `Set missing env vars: ${status.missing.join(', ')}`,
  })
}
