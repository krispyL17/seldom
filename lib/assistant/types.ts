/**
 * Server-side assistant orchestration — used by Vercel API routes.
 * Delegates to lib/orchestration for modular OS capabilities.
 */

import { ensureDevEnvLoaded } from '../loadDevEnv.js'
import { getOllamaEnvStatus, loadOllamaConfig } from '../ollama/service.js'
import type { OSMode } from '../orchestration/types.js'

export interface AssistantEnv {
  supabaseUrl: string
  supabaseAnonKey: string
  ollamaBaseUrl: string
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
    suggestedTitle?: string
    actionsExecuted?: Array<{ type: string; success: boolean; summary: string }>
  }
}

export function loadAssistantEnv(): AssistantEnv | null {
  ensureDevEnvLoaded()

  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY
  const ollama = loadOllamaConfig()

  if (!supabaseUrl || !supabaseAnonKey || !ollama) return null

  return {
    supabaseUrl,
    supabaseAnonKey,
    ollamaBaseUrl: ollama.baseUrl,
    chatModel: ollama.chatModel,
    embedModel: ollama.embedModel,
  }
}

export function getAssistantEnvStatus(): {
  ready: boolean
  missing: string[]
} {
  ensureDevEnvLoaded()

  const missing: string[] = []
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY

  if (!supabaseUrl) missing.push('SUPABASE_URL or VITE_SUPABASE_URL in .env.local')
  if (!supabaseAnonKey) missing.push('SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY in .env.local')

  const ollamaStatus = getOllamaEnvStatus()
  missing.push(...ollamaStatus.missing)

  return { ready: missing.length === 0, missing }
}
