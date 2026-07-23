import type { SupabaseClient } from '@supabase/supabase-js'
import { handleOSChat, getOSBootstrap } from '../orchestration/orchestrator.js'
import type { OSBootstrapResponse, OSChatRequest, OSMode } from '../orchestration/types.js'
import type { AssistantEnv, ChatRequest, ChatResponse } from './types.js'

export async function handleChat(
  client: SupabaseClient,
  env: AssistantEnv,
  userId: string,
  request: ChatRequest,
): Promise<ChatResponse> {
  const osRequest: OSChatRequest = {
    message: request.message,
    mode: request.mode,
    history: request.history,
  }

  const result = await handleOSChat(client, env, userId, osRequest)

  return {
    reply: result.reply,
    meta: {
      ...result.meta,
      mode: result.meta.mode,
    },
  }
}

export async function getAssistantBootstrap(
  client: SupabaseClient,
  env: AssistantEnv,
  userId: string,
): Promise<OSBootstrapResponse> {
  return getOSBootstrap(client, env, userId)
}

export type { OSMode, OSBootstrapResponse }
