import type { SupabaseClient } from '@supabase/supabase-js'
import { buildContextBlock, combinedScore, recencyScore } from '../../memory/vector'
import type { RetrievedMemory } from '../../memory/types'
import type { AssistantEnv } from './types'
import { createEmbedding } from './embeddings'

interface MatchRow {
  id: string
  category: string
  title: string
  text: string
  importance: number
  created_at: string
  similarity: number
}

export async function retrieveMemories(
  client: SupabaseClient,
  env: AssistantEnv,
  query: string,
  limit = 8,
): Promise<{ memories: RetrievedMemory[]; contextBlock: string }> {
  const embedding = await createEmbedding(env, query)

  const { data, error } = await client.rpc('match_memories', {
    query_embedding: embedding,
    match_count: limit,
    match_threshold: 0.2,
  })

  if (error) {
    // pgvector migration not applied yet
    if (error.message.includes('match_memories') || error.code === 'PGRST202') {
      return { memories: [], contextBlock: '' }
    }
    throw error
  }

  const rows = (data ?? []) as MatchRow[]

  const memories: RetrievedMemory[] = rows
    .map((row) => {
      const recency = recencyScore(row.created_at)
      const score = combinedScore(row.similarity, row.importance, row.created_at)
      return {
        id: row.id,
        category: row.category as RetrievedMemory['category'],
        title: row.title,
        text: row.text,
        importance: row.importance,
        createdAt: row.created_at,
        similarity: row.similarity,
        recencyScore: recency,
        combinedScore: score,
      }
    })
    .sort((a, b) => b.combinedScore - a.combinedScore)

  return {
    memories,
    contextBlock: buildContextBlock(memories),
  }
}

export async function storeMemory(
  client: SupabaseClient,
  env: AssistantEnv,
  input: {
    category: string
    title: string
    text: string
    importance: number
    sourceId?: string | null
  },
): Promise<void> {
  const embedding = await createEmbedding(env, `${input.title}\n\n${input.text}`)

  const { error } = await client.from('memories').insert({
    category: input.category,
    title: input.title.trim(),
    text: input.text.trim(),
    importance: Math.min(10, Math.max(1, input.importance)),
    source_id: input.sourceId ?? null,
    embedding,
  })

  if (error) throw error
}
