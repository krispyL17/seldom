import type { VercelResponse } from '@vercel/node'

const DEFAULT_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]

function vercelPreviewOrigins(): string[] {
  const origins: string[] = []
  if (process.env.VERCEL_URL) origins.push(`https://${process.env.VERCEL_URL}`)
  if (process.env.VERCEL_BRANCH_URL) origins.push(`https://${process.env.VERCEL_BRANCH_URL}`)
  return origins
}

function allowedOrigins(): string[] {
  const fromEnv = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean)
  if (fromEnv?.length) return fromEnv
  return [...DEFAULT_ORIGINS, ...vercelPreviewOrigins()]
}

export function setApiCors(res: VercelResponse, requestOrigin?: string) {
  const allowed = allowedOrigins()
  const origin =
    requestOrigin && allowed.includes(requestOrigin) ? requestOrigin : allowed[0]

  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}
