export interface OllamaConfig {
  baseUrl: string
  chatModel: string
  embedModel: string
}

export interface OllamaHealthStatus {
  online: boolean
  baseUrl: string
  model: string | null
  embedModel: string | null
  responseTimeMs: number | null
  lastSuccessfulAt: string | null
  error?: string
}

export class OllamaUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OllamaUnavailableError'
  }
}
