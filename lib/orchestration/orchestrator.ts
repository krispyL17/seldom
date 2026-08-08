import type { SupabaseClient } from '@supabase/supabase-js'
import { generateChatReply } from '../ai/chat.js'
import { generateConversationTitle } from '../ai/conversationTitle.js'
import {
  COLLEGE_ACTION_INSTRUCTIONS,
  executeCollegeActions,
  parseActionsFromReply,
} from '../assistant/actions.js'
import { retrieveMemories } from '../assistant/memory.js'
import { runWebSearch, shouldWebSearch } from '../assistant/search.js'
import type { AssistantEnv } from '../assistant/types.js'
import { loadPromptConfig, type PromptConfig } from '../prompts/loader.js'
import { assembleOSContext, formatOSContextBlock, formatPatternsBlock } from './context.js'
import { getModuleByMode, OS_MODULES } from './modules.js'
import { detectProactivePatterns } from './patterns.js'
import { modeSearchTopic, resolveMode } from './router.js'
import type { OSBootstrapResponse, OSChatRequest, OSChatResponse, OSMode } from './types.js'

const PROMPT_ID = 'assistant'

function buildSystemPrompt(config: PromptConfig, mode: OSMode): string {
  const modeConfig = config.modes[mode] ?? config.modes.chat
  if (!modeConfig) return config.system
  const actionBlock = mode === 'college_planning' ? `\n\n---\n\n${COLLEGE_ACTION_INSTRUCTIONS}` : ''
  return `${config.system}\n\n---\n\nActive capability mode: **${mode}**\n${modeConfig.instruction}${actionBlock}`
}

export async function handleOSChat(
  client: SupabaseClient,
  env: AssistantEnv,
  userId: string,
  request: OSChatRequest,
): Promise<OSChatResponse> {
  const message = request.message.trim()
  if (!message) throw new Error('Message is required')

  const mode = resolveMode(message, request.mode)
  const promptConfig = await loadPromptConfig(PROMPT_ID, client)
  const userContext = await assembleOSContext(client, userId)
  const proactiveInsights = detectProactivePatterns(userContext)

  const contextBlock = formatOSContextBlock(userContext)
  const patternsBlock = formatPatternsBlock(proactiveInsights)
  const searchTopic = modeSearchTopic(mode, message)

  const [memoryResult, searchResult] = await Promise.allSettled([
    retrieveMemories(client, env, message, 8),
    shouldWebSearch(searchTopic) ? runWebSearch(searchTopic) : Promise.resolve(null),
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
  const contextBlocks = [contextBlock, patternsBlock, memoryBlock, searchBlock].filter(Boolean) as string[]

  const userTurns = request.history?.filter((m) => m.role === 'user').length ?? 0
  const isNewConversation = userTurns === 0

  const maxTokens =
    mode === 'weekly_review' || mode === 'goal_breakdown'
      ? 2200
      : mode === 'chat'
        ? 1200
        : 1600

  const replyPromise = generateChatReply(env, systemPrompt, message, {
    contextBlocks,
    history: request.history?.slice(-4),
    maxTokens,
    skipHealthCheck: true,
  })

  const titlePromise = isNewConversation
    ? generateConversationTitle(env, message).catch(() => null)
    : Promise.resolve(null)

  const [replyRaw, suggestedTitle] = await Promise.all([replyPromise, titlePromise])

  let reply = replyRaw
  let actionsExecuted: Array<{ type: string; success: boolean; summary: string }> | undefined

  if (mode === 'college_planning') {
    const { cleanReply, actions } = parseActionsFromReply(replyRaw)
    if (actions.length > 0) {
      actionsExecuted = await executeCollegeActions(client, userId, actions)
      const summaries = actionsExecuted.filter((a) => a.success).map((a) => a.summary)
      reply = cleanReply
      if (summaries.length > 0) {
        reply += `\n\n---\n**Updated your workspace:** ${summaries.join(' · ')}`
      }
    } else {
      reply = cleanReply
    }
  }

  const module = getModuleByMode(mode)

  return {
    reply,
    meta: {
      mode,
      module: module?.id ?? null,
      memoriesUsed,
      searchUsed,
      model: env.chatModel,
      proactiveInsights,
      contextSummary: userContext.summary,
      suggestedTitle: suggestedTitle ?? undefined,
      actionsExecuted,
    },
  }
}

export async function getOSBootstrap(
  client: SupabaseClient,
  _env: AssistantEnv,
  userId: string,
): Promise<OSBootstrapResponse> {
  const promptConfig = await loadPromptConfig(PROMPT_ID, client)
  const userContext = await assembleOSContext(client, userId)
  const proactiveInsights = detectProactivePatterns(userContext)

  return {
    welcome: promptConfig.welcome ?? promptConfig.system.slice(0, 400),
    suggestions: promptConfig.suggestions,
    modules: OS_MODULES,
    proactiveInsights,
  }
}
