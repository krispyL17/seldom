import type { SupabaseClient } from '@supabase/supabase-js'
import type { AssistantEnv, ChatRequest, ChatResponse } from './types'
import { retrieveMemories } from './memory'
import { generateReply } from './llm'
import { runWebSearch, shouldWebSearch } from './search'

export async function handleChat(
  client: SupabaseClient,
  env: AssistantEnv,
  request: ChatRequest,
): Promise<ChatResponse> {
  const message = request.message.trim()
  if (!message) throw new Error('Message is required')

  const [memoryResult, searchResult] = await Promise.allSettled([
    retrieveMemories(client, env, message, 8),
    shouldWebSearch(message) ? runWebSearch(message) : Promise.resolve(null),
  ])

  const memoryBlock =
    memoryResult.status === 'fulfilled' ? memoryResult.value.contextBlock : undefined
  const memoriesUsed =
    memoryResult.status === 'fulfilled' ? memoryResult.value.memories.length : 0

  const searchBlock =
    searchResult.status === 'fulfilled' && searchResult.value?.contextBlock
      ? searchResult.value.contextBlock
      : undefined
  const searchUsed = Boolean(searchBlock)

  const reply = await generateReply(env, message, {
    memoryBlock,
    searchBlock,
    history: request.history?.slice(-6),
  })

  return {
    reply,
    meta: {
      memoriesUsed,
      searchUsed,
      model: env.chatModel,
      mode: 'live',
    },
  }
}
