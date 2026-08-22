import { ensureDevEnvLoaded } from '../loadDevEnv.js'
import {
  resolveOllamaMaxTokens,
  shouldDisableThinking,
  stripThinkingFromContent,
} from './limits.js'
import type { OllamaConfig, OllamaHealthStatus } from './types.js'
import { OllamaUnavailableError } from './types.js'

export type { OllamaConfig, OllamaHealthStatus } from './types.js'
export { OllamaUnavailableError } from './types.js'

const DEFAULT_BASE_URL = 'http://localhost:11434'

let lastSuccessfulAt: string | null = null
let lastResponseTimeMs: number | null = null

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/$/, '')
}

export function loadOllamaConfig(): OllamaConfig | null {
  ensureDevEnvLoaded()

  const baseUrl = normalizeBaseUrl(process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE_URL)
  const chatModel = process.env.OLLAMA_MODEL?.trim()
  if (!chatModel) return null

  const embedModel = process.env.OLLAMA_EMBED_MODEL?.trim() || chatModel

  return { baseUrl, chatModel, embedModel }
}

function ollamaHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  const apiKey = process.env.OLLAMA_API_KEY?.trim()
  if (apiKey) headers.Authorization = `Bearer ${apiKey}`
  return headers
}

export function getOllamaEnvStatus(): { ready: boolean; missing: string[] } {
  ensureDevEnvLoaded()

  const missing: string[] = []
  if (!process.env.OLLAMA_MODEL?.trim()) {
    missing.push('OLLAMA_MODEL (e.g. OLLAMA_MODEL=qwen3:8b) in .env.local or Vercel env')
  }

  return { ready: missing.length === 0, missing }
}

export function getLastOllamaMetrics(): {
  lastSuccessfulAt: string | null
  lastResponseTimeMs: number | null
} {
  return { lastSuccessfulAt, lastResponseTimeMs }
}

export async function checkOllamaHealth(config?: OllamaConfig | null): Promise<OllamaHealthStatus> {
  const cfg = config ?? loadOllamaConfig()
  const baseUrl = normalizeBaseUrl(cfg?.baseUrl ?? process.env.OLLAMA_BASE_URL ?? DEFAULT_BASE_URL)
  const started = Date.now()

  try {
    const response = await fetch(`${baseUrl}/api/tags`, {
      signal: AbortSignal.timeout(8000),
      headers: ollamaHeaders(),
    })
    const responseTimeMs = Date.now() - started

    if (!response.ok) {
      return {
        online: false,
        baseUrl,
        model: cfg?.chatModel ?? process.env.OLLAMA_MODEL?.trim() ?? null,
        embedModel: cfg?.embedModel ?? null,
        responseTimeMs,
        lastSuccessfulAt,
        error: `Ollama responded with HTTP ${response.status}`,
      }
    }

    lastSuccessfulAt = new Date().toISOString()
    lastResponseTimeMs = responseTimeMs

    return {
      online: true,
      baseUrl,
      model: cfg?.chatModel ?? process.env.OLLAMA_MODEL?.trim() ?? null,
      embedModel: cfg?.embedModel ?? null,
      responseTimeMs,
      lastSuccessfulAt,
    }
  } catch (err) {
    return {
      online: false,
      baseUrl,
      model: cfg?.chatModel ?? process.env.OLLAMA_MODEL?.trim() ?? null,
      embedModel: cfg?.embedModel ?? null,
      responseTimeMs: Date.now() - started,
      lastSuccessfulAt,
      error: err instanceof Error ? err.message : 'Could not reach Ollama',
    }
  }
}

export async function ollamaChat(
  config: OllamaConfig,
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options: { temperature?: number; maxTokens?: number; skipHealthCheck?: boolean } = {},
): Promise<string> {
  if (!options.skipHealthCheck) {
    const health = await checkOllamaHealth(config)
    if (!health.online) {
      throw new OllamaUnavailableError(
        health.error ??
          'Ollama is not running. Start Ollama locally and ensure OLLAMA_BASE_URL is correct.',
      )
    }
  }

  const started = Date.now()
  const numPredict = resolveOllamaMaxTokens(options.maxTokens)
  const disableThinking = shouldDisableThinking(config.chatModel)

  const requestBody: Record<string, unknown> = {
    model: config.chatModel,
    messages,
    stream: false,
    options: {
      temperature: options.temperature ?? 0.7,
      num_predict: numPredict,
    },
  }
  if (disableThinking) {
    requestBody.think = false
  }

  const response = await fetch(`${config.baseUrl}/api/chat`, {
    method: 'POST',
    headers: ollamaHeaders(),
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(120_000),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Ollama chat failed (${response.status}): ${body}`)
  }

  const data = (await response.json()) as {
    message?: { content?: string; thinking?: string }
    done_reason?: string
  }

  if (data.done_reason === 'length') {
    console.warn(
      `[ollama] Reply hit num_predict limit (${numPredict}) for model ${config.chatModel}. ` +
        'Raise OLLAMA_MAX_TOKENS if responses keep ending mid-sentence.',
    )
  }

  const reply = stripThinkingFromContent(data.message?.content?.trim() ?? '')
  if (!reply) throw new Error('Ollama returned an empty response')

  lastSuccessfulAt = new Date().toISOString()
  lastResponseTimeMs = Date.now() - started

  return reply
}

export async function ollamaEmbed(config: OllamaConfig, text: string): Promise<number[]> {
  const trimmed = text.trim()
  if (!trimmed) throw new Error('Cannot embed empty text')

  const health = await checkOllamaHealth(config)
  if (!health.online) {
    throw new OllamaUnavailableError(
      health.error ?? 'Ollama is unavailable — semantic memory retrieval skipped.',
    )
  }

  const started = Date.now()
  const response = await fetch(`${config.baseUrl}/api/embeddings`, {
    method: 'POST',
    headers: ollamaHeaders(),
    body: JSON.stringify({
      model: config.embedModel,
      prompt: trimmed,
    }),
    signal: AbortSignal.timeout(60_000),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Ollama embedding failed (${response.status}): ${body}`)
  }

  const data = (await response.json()) as { embedding?: number[] }
  const embedding = data.embedding
  if (!embedding?.length) throw new Error('Ollama returned an empty embedding')

  lastSuccessfulAt = new Date().toISOString()
  lastResponseTimeMs = Date.now() - started

  return embedding
}
