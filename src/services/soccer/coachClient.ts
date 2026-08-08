/**
 * Soccer AI coach client — calls /api/soccer/coach/* routes (Ollama backend).
 */

export type CoachMode = 'chat' | 'training_plan' | 'technical' | 'tactical' | 'development'

export interface CoachChatRequest {
  message: string
  mode?: CoachMode
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export interface CoachGenerateRequest {
  mode: Exclude<CoachMode, 'chat'>
}

export interface CoachResponse {
  reply: string
  meta: {
    mode: CoachMode
    memoriesUsed: number
    searchUsed: boolean
    model: string
    contextSummary: {
      sessions: number
      matches: number
      weaknesses: number
      strengths: number
      goals: number
    }
  }
}

export class CoachApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = 'CoachApiError'
  }
}

export async function sendCoachMessage(
  accessToken: string,
  request: CoachChatRequest,
): Promise<CoachResponse> {
  const response = await fetch('/api/soccer/coach/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  })

  const body = (await response.json().catch(() => ({}))) as {
    error?: string
    hint?: string
    reply?: string
    meta?: CoachResponse['meta']
  }

  if (!response.ok) {
    throw new CoachApiError(
      [body.error, body.hint].filter(Boolean).join(' — ') || `Coach API error (${response.status})`,
      response.status,
    )
  }

  if (!body.reply) {
    throw new CoachApiError('Empty response from coach', 500)
  }

  return {
    reply: body.reply,
    meta: body.meta ?? {
      mode: request.mode ?? 'chat',
      memoriesUsed: 0,
      searchUsed: false,
      model: 'unknown',
      contextSummary: { sessions: 0, matches: 0, weaknesses: 0, strengths: 0, goals: 0 },
    },
  }
}

export async function generateCoachPlan(
  accessToken: string,
  request: CoachGenerateRequest,
): Promise<CoachResponse> {
  const response = await fetch('/api/soccer/coach/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  })

  const body = (await response.json().catch(() => ({}))) as {
    error?: string
    hint?: string
    reply?: string
    meta?: CoachResponse['meta']
  }

  if (!response.ok) {
    throw new CoachApiError(
      [body.error, body.hint].filter(Boolean).join(' — ') || `Coach API error (${response.status})`,
      response.status,
    )
  }

  if (!body.reply) {
    throw new CoachApiError('Empty response from coach', 500)
  }

  return { reply: body.reply, meta: body.meta! }
}

export async function fetchCoachSuggestions(
  accessToken: string,
): Promise<{ suggestions: string[]; welcome?: string }> {
  const response = await fetch('/api/soccer/coach/chat', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  const body = (await response.json().catch(() => ({}))) as {
    suggestions?: string[]
    welcome?: string
    error?: string
  }
  if (!response.ok) {
    throw new CoachApiError(body.error ?? 'Failed to load suggestions', response.status)
  }

  return {
    suggestions: body.suggestions ?? [],
    welcome: body.welcome,
  }
}
