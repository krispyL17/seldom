import type { ServerResponse } from 'node:http'

const LOCAL_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']

function allowedOrigins(): string[] {
  const fromEnv = process.env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim()).filter(Boolean)
  return fromEnv?.length ? fromEnv : LOCAL_ORIGINS
}

export function setSidecarCors(res: ServerResponse, requestOrigin?: string) {
  const allowed = allowedOrigins()
  const origin =
    requestOrigin && allowed.includes(requestOrigin) ? requestOrigin : allowed[0]

  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
}
