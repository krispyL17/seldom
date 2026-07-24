import { openAiKeyHeaders } from '@lib/userOpenAiKey'

export type AssistantMode =
  | 'chat'
  | 'daily_plan'
  | 'weekly_review'
  | 'goal_breakdown'
  | 'brainstorm'
  | 'essay_ideas'
  | 'project_ideas'
  | 'coding_ideas'
  | 'soccer_drills'
  | 'research_topics'
  | 'college_planning'
  | 'scholarship_ideas'
  | 'personal_recommendations'
  | 'reflection'
  | 'project_management'

export interface AssistantModule {
  id: string
  mode: AssistantMode
  label: string
  description: string
  keywords: string[]
}

export interface ProactiveInsight {
  id: string
  title: string
  description: string
  suggestedMode: AssistantMode
  priority: 'high' | 'medium' | 'low'
}

export interface AssistantBootstrap {
  welcome: string
  suggestions: string[]
  modules: AssistantModule[]
  proactiveInsights: ProactiveInsight[]
}

export interface AssistantChatRequest {
  message: string
  mode?: AssistantMode
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export interface AssistantChatResponse {
  reply: string
  meta: {
    mode: AssistantMode
    module: string | null
    memoriesUsed: number
    searchUsed: boolean
    model: string
    proactiveInsights: ProactiveInsight[]
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

export class AssistantApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'AssistantApiError'
  }
}

async function authFetch(accessToken: string, init?: RequestInit): Promise<Response> {
  return fetch('/api/assistant/chat', {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...openAiKeyHeaders(),
      ...init?.headers,
    },
  })
}

export async function fetchAssistantBootstrap(accessToken: string): Promise<AssistantBootstrap> {
  const response = await authFetch(accessToken, { method: 'GET' })
  const body = (await response.json().catch(() => ({}))) as AssistantBootstrap & { error?: string }

  if (!response.ok) {
    throw new AssistantApiError(body.error ?? `Assistant API error (${response.status})`, response.status)
  }

  return body
}

export async function sendAssistantMessage(
  accessToken: string,
  request: AssistantChatRequest,
): Promise<AssistantChatResponse> {
  const response = await authFetch(accessToken, {
    method: 'POST',
    body: JSON.stringify(request),
  })

  const body = (await response.json().catch(() => ({}))) as AssistantChatResponse & { error?: string }

  if (!response.ok) {
    throw new AssistantApiError(body.error ?? `Assistant API error (${response.status})`, response.status)
  }

  if (!body.reply) {
    throw new AssistantApiError('Empty response from assistant', 500)
  }

  return body
}

export async function checkAssistantHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/health')
    const data = (await response.json()) as { assistant?: boolean }
    return response.ok && Boolean(data.assistant)
  } catch {
    return false
  }
}
