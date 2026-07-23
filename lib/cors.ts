import type { VercelResponse } from '@vercel/node'

const DEFAULT_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']

function allowedOrigins(): string[] {
  const fromEnv = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean)
  return fromEnv?.length ? fromEnv : DEFAULT_ORIGINS
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
