import type { MemoryServerConfig } from '../../../memory/types.js'

export class OllamaClient {
  constructor(private readonly config: MemoryServerConfig) {}

  async embed(text: string): Promise<number[]> {
    const url = `${this.config.ollamaBaseUrl}/api/embeddings`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.config.embeddingModel,
        prompt: text,
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      throw new Error(`Ollama embedding failed (${response.status}): ${body}`)
    }

    const data = (await response.json()) as { embedding?: number[] }
    if (!data.embedding || data.embedding.length === 0) {
      throw new Error('Ollama returned an empty embedding')
    }

    return data.embedding
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.ollamaBaseUrl}/api/tags`)
      return response.ok
    } catch {
      return false
    }
  }
}
