import type { AssistantEnv } from './types'

export async function createEmbedding(env: AssistantEnv, text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.embedModel,
      input: text.trim(),
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`OpenAI embedding failed (${response.status}): ${body}`)
  }

  const data = (await response.json()) as { data?: Array<{ embedding: number[] }> }
  const embedding = data.data?.[0]?.embedding
  if (!embedding?.length) throw new Error('OpenAI returned an empty embedding')
  return embedding
}
