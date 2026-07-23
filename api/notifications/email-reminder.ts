import type { VercelRequest, VercelResponse } from '@vercel/node'
import { setApiCors } from '../../lib/cors.js'
import { extractBearerToken, verifyAccessToken } from '../../lib/assistant/auth.js'
import { loadAssistantEnv } from '../../lib/assistant/types.js'

interface ReminderBody {
  taskId?: string
  title?: string
  deadline?: string
}

async function sendViaResend(to: string, subject: string, text: string): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.RESEND_FROM ?? 'Seldom <onboarding@resend.dev>'
  if (!apiKey) return false

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, subject, text }),
  })

  return res.ok
}

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
    return res.status(503).json({ error: 'Server not configured' })
  }

  const token = extractBearerToken(req.headers.authorization)
  if (!token) {
    return res.status(401).json({ error: 'Missing Authorization header' })
  }

  const auth = await verifyAccessToken(env, token)
  if (!auth) {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }

  const body = req.body as ReminderBody
  const title = body.title?.trim()
  const deadline = body.deadline

  if (!title || !deadline) {
    return res.status(400).json({ error: 'title and deadline are required' })
  }

  const { data: userData } = await auth.client.auth.getUser(token)
  const to = userData.user?.email

  if (!to) {
    return res.status(400).json({ error: 'No email on account' })
  }

  const when = new Date(deadline).toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

  const subject = `Seldom reminder: ${title}`
  const text = `Reminder from Seldom\n\nTask: ${title}\nDue: ${when}\n\nOpen your control center to review.`

  const sent = await sendViaResend(to, subject, text)

  if (!sent) {
    return res.status(503).json({
      error: 'Email not configured',
      hint: 'Set RESEND_API_KEY and RESEND_FROM in Vercel environment variables.',
    })
  }

  return res.status(200).json({ ok: true, sent: true })
}
