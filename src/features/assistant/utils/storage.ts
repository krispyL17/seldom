import type { AssistantState, Conversation } from '../types'
import { ASSISTANT_STORAGE_KEY } from '../types'

export function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(ASSISTANT_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as AssistantState
    return parsed.conversations ?? []
  } catch {
    return []
  }
}

export function saveConversations(conversations: Conversation[], activeId: string | null) {
  const state: AssistantState = { conversations, activeConversationId: activeId }
  localStorage.setItem(ASSISTANT_STORAGE_KEY, JSON.stringify(state))
}

export function loadActiveId(): string | null {
  try {
    const raw = localStorage.getItem(ASSISTANT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as AssistantState
    return parsed.activeConversationId
  } catch {
    return null
  }
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function conversationTitleFromMessage(content: string): string {
  const trimmed = content.trim().replace(/\s+/g, ' ')
  if (trimmed.length <= 48) return trimmed || 'New chat'
  return `${trimmed.slice(0, 48)}…`
}
