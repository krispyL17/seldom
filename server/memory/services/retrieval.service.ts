import type { RetrieveOptions, RetrieveResult } from '../../../memory/types.js'
import { buildContextBlock, combinedScore, cosineSimilarity, recencyScore } from '../../../memory/vector.js'
import type { MemoryRepository } from '../db/memory.repository.js'
import type { EmbeddingService } from './embedding.service.js'

const DEFAULT_LIMIT = 8
const DEFAULT_MIN_SCORE = 0.25

/**
 * RetrievalService
 *
 * Before every AI response:
 * 1. Convert user question into embedding
 * 2. Search memory database (vector scan — never loads full DB into AI context)
 * 3. Retrieve top matches ranked by similarity + importance + recency
 * 4. Return only relevant memories as a compact context block
 */
export class RetrievalService {
  constructor(
    private readonly repository: MemoryRepository,
    private readonly embeddingService: EmbeddingService,
  ) {}

  async retrieve(query: string, options: RetrieveOptions = {}): Promise<RetrieveResult> {
    const limit = options.limit ?? DEFAULT_LIMIT
    const minScore = options.minScore ?? DEFAULT_MIN_SCORE

    const queryEmbedding = await this.embeddingService.createEmbedding(query.trim())

    const candidates = this.repository.listForSearch(options.categories)

    const ranked = candidates
      .map((row) => {
        const similarity = cosineSimilarity(queryEmbedding, row.embedding)
        const recency = recencyScore(row.created_at)
        const score = combinedScore(similarity, row.importance, row.created_at, {
          similarity: 0.6,
          importance: 0.25,
          recency: 0.15,
        })

        return {
          id: row.id,
          category: row.category,
          title: row.title,
          text: row.text,
          importance: row.importance,
          createdAt: row.created_at,
          similarity,
          recencyScore: recency,
          combinedScore: score,
        }
      })
      .filter((m) => m.combinedScore >= minScore)
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, limit)

    return {
      query,
      memories: ranked,
      contextBlock: buildContextBlock(ranked),
    }
  }
}
