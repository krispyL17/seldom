/**
 * Shared chat completion — delegates to Ollama (sole AI engine).
 */

import { loadOllamaConfig, ollamaChat, type OllamaConfig } from '../ollama/service.js'

export interface ChatModelEnv {
  ollamaBaseUrl: string
  chatModel: string
  embedModel: string
}

export function chatEnvFromOllama(config: OllamaConfig): ChatModelEnv {
  return {
    ollamaBaseUrl: config.baseUrl,
    chatModel: config.chatModel,
    embedModel: config.embedModel,
  }
}

export async function generateChatReply(
  env: ChatModelEnv,
  systemPrompt: string,
  userMessage: string,
  options: {
    contextBlocks?: string[]
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
    temperature?: number
    maxTokens?: number
    skipHealthCheck?: boolean
  } = {},
): Promise<string> {
  const config =
    loadOllamaConfig() ??
    ({
      baseUrl: env.ollamaBaseUrl,
      chatModel: env.chatModel,
      embedModel: env.embedModel,
    } satisfies OllamaConfig)

  const contextParts = options.contextBlocks?.filter(Boolean) ?? []
  const systemContent =
    contextParts.length > 0
      ? `${systemPrompt}\n\n---\n\n${contextParts.join('\n\n---\n\n')}`
      : systemPrompt

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemContent },
  ]

  for (const msg of options.history ?? []) {
    messages.push({ role: msg.role, content: msg.content })
  }

  messages.push({ role: 'user', content: userMessage })

  return ollamaChat(config, messages, {
    temperature: options.temperature,
    maxTokens: options.maxTokens,
    skipHealthCheck: options.skipHealthCheck,
  })
}
