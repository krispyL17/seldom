/**
 * HTTP client for the local memory server.
 * Vite proxies /api/memory → http://127.0.0.1:3847
 */

import type { CreateMemoryInput, RetrieveOptions, RetrieveResult } from '../../../memory/types'

const BASE = '/api/memory'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { error?: string }
    throw new Error(body.error ?? `Memory API error (${response.status})`)
  }

  return response.json() as Promise<T>
}

export async function retrieveMemories(
  query: string,
  options: RetrieveOptions = {},
): Promise<RetrieveResult> {
  return request<RetrieveResult>('/retrieve', {
    method: 'POST',
    body: JSON.stringify({ query, ...options }),
  })
}

export async function storeMemory(input: CreateMemoryInput): Promise<{ id: string }> {
  return request('/memories', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export async function memoryHealthCheck(): Promise<{
  ok: boolean
  memories: number
  ollama: boolean
  model: string
}> {
  return request('/health')
}

export async function isMemoryServerAvailable(): Promise<boolean> {
  try {
    const health = await memoryHealthCheck()
    return health.ok
  } catch {
    return false
  }
}
