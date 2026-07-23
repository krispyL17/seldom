import type { SupabaseClient } from '@supabase/supabase-js'
import { generateChatReply } from '../ai/chat.js'
import { loadPromptConfig, type PromptConfig } from '../prompts/loader.js'
import { retrieveMemories } from '../assistant/memory.js'
import { assembleSoccerContext, formatSoccerContextBlock } from './context.js'
import { runCoachingSearch, shouldCoachWebSearch } from './resources.js'
import type {
  CoachChatRequest,
  CoachEnv,
  CoachGenerateRequest,
  CoachMode,
  CoachResponse,
} from './types.js'

const PROMPT_ID = 'soccer-coach'

function buildUserMessage(request: CoachChatRequest | CoachGenerateRequest, mode: CoachMode): string {
  if ('message' in request && request.message.trim()) {
    return request.message.trim()
  }

  const prompts: Record<Exclude<CoachMode, 'chat'>, string> = {
    training_plan: 'Generate my weekly training plan based on my current data.',
    technical: 'Generate technical development recommendations for me.',
    tactical: 'Generate tactical advice for my position and recent performances.',
    development: 'Generate a multi-week development plan for me.',
  }

  return prompts[mode as Exclude<CoachMode, 'chat'>]
}

function resolveMode(request: CoachChatRequest | CoachGenerateRequest): CoachMode {
  if ('mode' in request && request.mode !== 'chat') return request.mode
  if ('mode' in request && request.mode) return request.mode
  return 'chat'
}

function buildSystemPrompt(config: PromptConfig, mode: CoachMode): string {
  const modeConfig = config.modes[mode] ?? config.modes.chat
  if (!modeConfig) return config.system
  return `${config.system}\n\n---\n\nMode instructions:\n${modeConfig.instruction}`
}

export async function handleCoachRequest(
  client: SupabaseClient,
  env: CoachEnv,
  userId: string,
  request: CoachChatRequest | CoachGenerateRequest,
): Promise<CoachResponse> {
  const mode = resolveMode(request)
  const userMessage = buildUserMessage(request, mode)
  const promptConfig = await loadPromptConfig(PROMPT_ID, client)
  const playerContext = await assembleSoccerContext(client, userId)

  const contextBlock = formatSoccerContextBlock(playerContext)
  const searchTopic =
    'message' in request && request.message.trim()
      ? request.message.trim()
      : `${mode} soccer training development`

  const [memoryResult, searchResult] = await Promise.allSettled([
    retrieveMemories(client, env, userMessage, 6),
    shouldCoachWebSearch(searchTopic, promptConfig.search)
      ? runCoachingSearch(searchTopic, promptConfig.search)
      : Promise.resolve(null),
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

  const systemPrompt = buildSystemPrompt(promptConfig, mode)
  const contextBlocks = [contextBlock, memoryBlock, searchBlock].filter(Boolean) as string[]

  const history = 'history' in request ? request.history?.slice(-6) : undefined

  const reply = await generateChatReply(env, systemPrompt, userMessage, {
    contextBlocks,
    history,
    maxTokens: mode === 'development' ? 2200 : 1800,
  })

  return {
    reply,
    meta: {
      mode,
      memoriesUsed,
      searchUsed,
      model: env.chatModel,
      contextSummary: {
        sessions: playerContext.trainingSessions.length,
        matches: playerContext.matches.length,
        weaknesses: playerContext.weaknesses.length,
        strengths: playerContext.strengths.length,
        goals: playerContext.goals.length,
      },
    },
  }
}

export async function getCoachSuggestions(client?: SupabaseClient): Promise<string[]> {
  const config = await loadPromptConfig(PROMPT_ID, client)
  return config.suggestions
}

export async function getCoachWelcome(client?: SupabaseClient): Promise<string> {
  const config = await loadPromptConfig(PROMPT_ID, client)
  return config.welcome ?? config.system.slice(0, 240)
}
