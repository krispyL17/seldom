/**
 * Production assistant client — calls Vercel serverless /api/assistant/chat.
 * No local sidecars required when deployed.
 */

export interface AssistantChatRequest {
  message: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export interface AssistantChatResponse {
  reply: string
  meta: {
    memoriesUsed: number
    searchUsed: boolean
    model: string
    mode: 'live' | 'fallback'
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

export async function sendAssistantMessage(
  accessToken: string,
  request: AssistantChatRequest,
): Promise<AssistantChatResponse> {
  const response = await fetch('/api/assistant/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(request),
  })

  const body = (await response.json().catch(() => ({}))) as {
    error?: string
    reply?: string
    meta?: AssistantChatResponse['meta']
  }

  if (!response.ok) {
    throw new AssistantApiError(body.error ?? `Assistant API error (${response.status})`, response.status)
  }

  if (!body.reply) {
    throw new AssistantApiError('Empty response from assistant', 500)
  }

  return {
    reply: body.reply,
    meta: body.meta ?? {
      memoriesUsed: 0,
      searchUsed: false,
      model: 'unknown',
      mode: 'live',
    },
  }
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
