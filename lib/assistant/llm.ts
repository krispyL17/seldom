import type { AssistantEnv } from './types'

const SYSTEM_PROMPT = `You are Seldom Assistant — a personal AI operating system for productivity, soccer, college prep, and life management.

You help the user with tasks, goals, journaling, training, running, and college applications.

Rules:
- Be concise, warm, and actionable.
- Use markdown when helpful (lists, bold, code blocks).
- When "Relevant memories" or "Web search results" are provided, use them — do not invent personal facts.
- If you lack context, say so honestly.
- Never claim to have access to data that wasn't provided in the context blocks.`

export async function generateReply(
  env: AssistantEnv,
  userMessage: string,
  context: {
    memoryBlock?: string
    searchBlock?: string
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  },
): Promise<string> {
  const contextParts: string[] = []
  if (context.memoryBlock) contextParts.push(context.memoryBlock)
  if (context.searchBlock) contextParts.push(context.searchBlock)

  const systemContent =
    contextParts.length > 0
      ? `${SYSTEM_PROMPT}\n\n---\n\n${contextParts.join('\n\n---\n\n')}`
      : SYSTEM_PROMPT

  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemContent },
  ]

  for (const msg of context.history ?? []) {
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
      temperature: 0.7,
      max_tokens: 1500,
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
