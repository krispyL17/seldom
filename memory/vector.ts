/**
 * Vector math utilities — pure functions, safe for browser and Node.
 */

import type { RetrievedMemory } from './types'

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0

  let dot = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!
    normA += a[i]! * a[i]!
    normB += b[i]! * b[i]!
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB)
  if (denom === 0) return 0
  return dot / denom
}

export function recencyScore(isoDate: string, now = Date.now()): number {
  const created = new Date(isoDate).getTime()
  if (Number.isNaN(created)) return 0.5
  const daysOld = (now - created) / (1000 * 60 * 60 * 24)
  return Math.exp(-daysOld / 90)
}

export function normalizedImportance(importance: number): number {
  return Math.min(10, Math.max(1, importance)) / 10
}

export function combinedScore(
  similarity: number,
  importance: number,
  createdAt: string,
  weights = { similarity: 0.6, importance: 0.25, recency: 0.15 },
): number {
  return (
    similarity * weights.similarity +
    normalizedImportance(importance) * weights.importance +
    recencyScore(createdAt) * weights.recency
  )
}

export function buildContextBlock(memories: RetrievedMemory[]): string {
  if (memories.length === 0) return ''

  const lines = memories.map(
    (m, i) =>
      `[${i + 1}] (${m.category}, importance ${m.importance}/10) ${m.title}\n${m.text}`,
  )

  return `## Relevant memories\n\n${lines.join('\n\n')}`
}
