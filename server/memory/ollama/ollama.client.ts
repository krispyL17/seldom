import type { MemoryServerConfig } from '../../../memory/types.js'
import {
  checkOllamaHealth,
  loadOllamaConfig,
  ollamaEmbed,
} from '../../../lib/ollama/service.js'

/** Delegates to the shared lib/ollama service — single AI integration point. */
export class OllamaClient {
  private readonly config: NonNullable<ReturnType<typeof loadOllamaConfig>>

  constructor(serverConfig: MemoryServerConfig) {
    const loaded = loadOllamaConfig()
    this.config = loaded ?? {
      baseUrl: serverConfig.ollamaBaseUrl,
      chatModel: process.env.OLLAMA_MODEL?.trim() ?? '',
      embedModel: process.env.OLLAMA_EMBED_MODEL?.trim() || process.env.OLLAMA_MODEL?.trim() || '',
    }
  }

  async embed(text: string): Promise<number[]> {
    if (!this.config.chatModel) {
      throw new Error('OLLAMA_MODEL is not configured')
    }
    return ollamaEmbed(this.config, text)
  }

  async healthCheck(): Promise<boolean> {
    const health = await checkOllamaHealth(this.config)
    return health.online
  }
}
