import { generateChatReply, type ChatModelEnv } from './chat.js'

export function sanitizeConversationTitle(raw: string): string {
  const cleaned = raw
    .trim()
    .replace(/^title:\s*/i, '')
    .replace(/^["'`]+|["'`]+$/g, '')
    .replace(/\s+/g, ' ')
  if (!cleaned) return 'New chat'
  return cleaned.length <= 56 ? cleaned : `${cleaned.slice(0, 56)}…`
}

/** Short LLM call — run in parallel with the main reply on new conversations. */
export async function generateConversationTitle(
  env: ChatModelEnv,
  userMessage: string,
): Promise<string> {
  const raw = await generateChatReply(
    env,
    'Write a concise conversation title (3–6 words) for a chat that starts with the user message below. Reply with ONLY the title — no quotes or punctuation.',
    userMessage.slice(0, 400),
    { maxTokens: 20, temperature: 0.35, skipHealthCheck: true },
  )
  return sanitizeConversationTitle(raw)
}
