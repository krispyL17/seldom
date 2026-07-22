import type { CreateMemoryInput, Memory, MemoryServerConfig } from '../../../memory/types.js'
import { MemoryRepository, inputToMemory } from '../db/memory.repository.js'
import { OllamaClient } from '../ollama/ollama.client.js'

/**
 * EmbeddingService
 *
 * Responsible for:
 * - Creating embeddings via Ollama (nomic-embed-text)
 * - Storing memories + embeddings in SQLite
 * - Retrieving individual memories by id
 */
export class EmbeddingService {
  private readonly ollama: OllamaClient

  constructor(
    private readonly repository: MemoryRepository,
    config: MemoryServerConfig,
  ) {
    this.ollama = new OllamaClient(config)
  }

  async createEmbedding(text: string): Promise<number[]> {
    return this.ollama.embed(text)
  }

  /** Embed title + text combined for richer semantic signal */
  async embedMemoryContent(title: string, text: string): Promise<number[]> {
    const combined = `${title}\n\n${text}`.trim()
    return this.createEmbedding(combined)
  }

  async store(input: CreateMemoryInput): Promise<Memory> {
    const embedding = await this.embedMemoryContent(input.title, input.text)
    const memory = inputToMemory(input, embedding)
    this.repository.insert(memory)
    return memory
  }

  async storeBatch(inputs: CreateMemoryInput[]): Promise<Memory[]> {
    const results: Memory[] = []
    for (const input of inputs) {
      results.push(await this.store(input))
    }
    return results
  }

  getById(id: string): Memory | null {
    return this.repository.getById(id)
  }

  delete(id: string): boolean {
    return this.repository.delete(id)
  }

  count(): number {
    return this.repository.count()
  }

  async isOllamaAvailable(): Promise<boolean> {
    return this.ollama.healthCheck()
  }
}
