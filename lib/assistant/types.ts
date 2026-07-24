/**
 * Server-side assistant orchestration — used by Vercel API routes.
 * Delegates to lib/orchestration for modular OS capabilities.
 */

import type { OSMode } from '../orchestration/types.js'

export interface AssistantEnv {
  supabaseUrl: string
  supabaseAnonKey: string
  openaiApiKey: string
  chatModel: string
  embedModel: string
}

export interface ChatRequest {
  message: string
  mode?: OSMode
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export interface ChatResponse {
  reply: string
  meta: {
    mode: OSMode
    module: string | null
    memoriesUsed: number
    searchUsed: boolean
    model: string
    proactiveInsights: Array<{
      id: string
      title: string
      description: string
      suggestedMode: OSMode
      priority: 'high' | 'medium' | 'low'
    }>
    contextSummary: {
      openTasks: number
      completedTasks: number
      activeGoals: number
      journalEntriesLast14Days: number
      trainingSessionsLast14Days: number
      runsLast14Days: number
      collegesOnList: number
      collegePhase: 'junior' | 'senior' | 'unknown'
    }
  }
}

export function loadAssistantEnv(userOpenAiKey?: string | null): AssistantEnv | null {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY
  const openaiApiKey = (userOpenAiKey?.trim() || process.env.OPENAI_API_KEY)?.trim()

  if (!supabaseUrl || !supabaseAnonKey || !openaiApiKey) return null

  return {
    supabaseUrl,
    supabaseAnonKey,
    openaiApiKey,
    chatModel: process.env.OPENAI_CHAT_MODEL ?? 'gpt-4o-mini',
    embedModel: process.env.OPENAI_EMBED_MODEL ?? 'text-embedding-3-small',
  }
}

export function getAssistantEnvStatus(): {
  ready: boolean
  missing: string[]
} {
  const missing: string[] = []
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (!supabaseUrl) missing.push('SUPABASE_URL or VITE_SUPABASE_URL')
  if (!supabaseAnonKey) missing.push('SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY')
  if (!openaiApiKey) missing.push('OPENAI_API_KEY (or X-User-OpenAI-Key header)')

  return { ready: missing.length === 0, missing }
}

export function extractUserOpenAiKey(
  headers: Record<string, string | string[] | undefined>,
): string | undefined {
  const raw = headers['x-user-openai-key']
  if (typeof raw === 'string' && raw.trim()) return raw.trim()
  return undefined
}
