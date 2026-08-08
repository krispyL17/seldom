import type { AssistantEnv } from './types.js'
import { ollamaEmbed } from '../ollama/service.js'

export async function createEmbedding(env: AssistantEnv, text: string): Promise<number[]> {
  return ollamaEmbed(
    {
      baseUrl: env.ollamaBaseUrl,
      chatModel: env.chatModel,
      embedModel: env.embedModel,
    },
    text,
  )
}
