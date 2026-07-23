/**
 * Shared OpenAI chat completion — system prompt injected by caller.
 */

export interface ChatModelEnv {
  openaiApiKey: string
  chatModel: string
}

export async function generateChatReply(
  env: ChatModelEnv,
  systemPrompt: string,
  userMessage: string,
  options: {
    contextBlocks?: string[]
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
    temperature?: number
    maxTokens?: number
  } = {},
): Promise<string> {
  const contextParts = options.contextBlocks?.filter(Boolean) ?? []
  const systemContent =
    contextParts.length > 0
      ? `${systemPrompt}\n\n---\n\n${contextParts.join('\n\n---\n\n')}`
      : systemPrompt

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemContent },
  ]

  for (const msg of options.history ?? []) {
    messages.push({ role: msg.role, content: msg.content })
  }

  messages.push({ role: 'user', content: userMessage })

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.chatModel,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1800,
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`OpenAI chat failed (${response.status}): ${body}`)
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }

  const reply = data.choices?.[0]?.message?.content?.trim()
  if (!reply) throw new Error('OpenAI returned an empty response')
  return reply
}
