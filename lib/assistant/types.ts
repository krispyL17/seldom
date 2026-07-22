/**
 * Server-side assistant orchestration — used by Vercel API routes.
 * Runs on each user prompt: embed → retrieve memories → search → LLM.
 */

export interface AssistantEnv {
  supabaseUrl: string
  supabaseAnonKey: string
  openaiApiKey: string
  chatModel: string
  embedModel: string
}

export interface ChatRequest {
  message: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export interface ChatResponse {
  reply: string
  meta: {
    memoriesUsed: number
    searchUsed: boolean
    model: string
    mode: 'live' | 'fallback'
  }
}

export function loadAssistantEnv(): AssistantEnv | null {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY
  const openaiApiKey = process.env.OPENAI_API_KEY

  if (!supabaseUrl || !supabaseAnonKey || !openaiApiKey) return null

  return {
    supabaseUrl,
    supabaseAnonKey,
    openaiApiKey,
    chatModel: process.env.OPENAI_CHAT_MODEL ?? 'gpt-4o-mini',
    embedModel: process.env.OPENAI_EMBED_MODEL ?? 'text-embedding-3-small',
  }
}
