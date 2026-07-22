import type { MemoryCategory, CreateMemoryInput, Memory } from '../../../memory/types.js'
import { bufferToEmbedding, embeddingToBuffer } from '../../../memory/vector-buffer.js'
import type { MemoryDatabase } from './connection.js'

export interface MemoryRow {
  id: string
  category: string
  title: string
  text: string
  importance: number
  created_at: string
  source_id: string | null
  embedding: Buffer
  embedding_dims: number
}

export interface MemoryVectorRow {
  id: string
  category: MemoryCategory
  title: string
  text: string
  importance: number
  created_at: string
  embedding: number[]
}

export class MemoryRepository {
  constructor(private readonly db: MemoryDatabase) {}

  insert(memory: Memory): void {
    const stmt = this.db.prepare(`
      INSERT INTO memories (id, category, title, text, importance, created_at, source_id, embedding, embedding_dims)
      VALUES (@id, @category, @title, @text, @importance, @created_at, @source_id, @embedding, @embedding_dims)
      ON CONFLICT(id) DO UPDATE SET
        category = excluded.category,
        title = excluded.title,
        text = excluded.text,
        importance = excluded.importance,
        created_at = excluded.created_at,
        source_id = excluded.source_id,
        embedding = excluded.embedding,
        embedding_dims = excluded.embedding_dims
    `)

    stmt.run({
      id: memory.id,
      category: memory.category,
      title: memory.title,
      text: memory.text,
      importance: memory.importance,
      created_at: memory.createdAt,
      source_id: memory.sourceId ?? null,
      embedding: embeddingToBuffer(memory.embedding),
      embedding_dims: memory.embedding.length,
    })
  }

  getById(id: string): Memory | null {
    const row = this.db.prepare('SELECT * FROM memories WHERE id = ?').get(id) as MemoryRow | undefined
    return row ? this.rowToMemory(row) : null
  }

  delete(id: string): boolean {
    const result = this.db.prepare('DELETE FROM memories WHERE id = ?').run(id)
    return result.changes > 0
  }

  count(): number {
    const row = this.db.prepare('SELECT COUNT(*) as c FROM memories').get() as { c: number }
    return row.c
  }

  /**
   * Loads vector-index fields only — not the full table scan of unrelated columns.
   * For personal-scale local DBs this is efficient; never loads into AI context.
   */
  listForSearch(categories?: MemoryCategory[]): MemoryVectorRow[] {
    let sql = `
      SELECT id, category, title, text, importance, created_at, embedding
      FROM memories
    `
    const params: string[] = []

    if (categories && categories.length > 0) {
      const placeholders = categories.map(() => '?').join(', ')
      sql += ` WHERE category IN (${placeholders})`
      params.push(...categories)
    }

    const rows = this.db.prepare(sql).all(...params) as Array<
      Omit<MemoryRow, 'source_id' | 'embedding_dims'> & { embedding: Buffer }
    >

    return rows.map((row) => ({
      id: row.id,
      category: row.category as MemoryCategory,
      title: row.title,
      text: row.text,
      importance: row.importance,
      created_at: row.created_at,
      embedding: bufferToEmbedding(row.embedding),
    }))
  }

  private rowToMemory(row: MemoryRow): Memory {
    return {
      id: row.id,
      category: row.category as MemoryCategory,
      title: row.title,
      text: row.text,
      importance: row.importance,
      createdAt: row.created_at,
      sourceId: row.source_id,
      embedding: bufferToEmbedding(row.embedding),
    }
  }
}

export function generateMemoryId(): string {
  return crypto.randomUUID()
}

export function inputToMemory(input: CreateMemoryInput, embedding: number[]): Memory {
  return {
    id: input.id ?? generateMemoryId(),
    category: input.category,
    title: input.title.trim(),
    text: input.text.trim(),
    importance: Math.min(10, Math.max(1, Math.round(input.importance))),
    createdAt: input.createdAt ?? new Date().toISOString(),
    sourceId: input.sourceId ?? null,
    embedding,
  }
}
