export interface OllamaStatusResponse {
  configured: boolean
  missing: string[]
  status: 'online' | 'offline'
  online: boolean
  baseUrl: string
  model: string | null
  embedModel: string | null
  responseTimeMs: number | null
  lastSuccessfulAt: string | null
  error: string | null
  message: string
}

export interface HealthResponse {
  ok: boolean
  assistant: boolean
  ollama?: {
    online: boolean
    baseUrl: string
    model: string | null
    responseTimeMs: number | null
    lastSuccessfulAt: string | null
    error?: string
  }
  missing?: string[]
  hint?: string
}

export async function fetchOllamaStatus(): Promise<OllamaStatusResponse> {
  const response = await fetch('/api/ollama/status')
  const body = (await response.json().catch(() => ({}))) as Partial<OllamaStatusResponse>
  if (!response.ok) {
    throw new Error(body.message ?? body.error ?? `Ollama status error (${response.status})`)
  }
  return body as OllamaStatusResponse
}

export async function fetchHealthStatus(): Promise<HealthResponse> {
  const response = await fetch('/api/health')
  return (await response.json()) as HealthResponse
}

export async function checkAssistantHealth(): Promise<boolean> {
  try {
    const data = await fetchHealthStatus()
    return Boolean(data.ok && data.assistant)
  } catch {
    return false
  }
}
