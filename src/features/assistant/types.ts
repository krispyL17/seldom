export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  createdAt: string
  /** True while assistant message is still typing in */
  isStreaming?: boolean
}

export interface Conversation {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export interface AssistantState {
  conversations: Conversation[]
  activeConversationId: string | null
}

export const ASSISTANT_STORAGE_KEY = 'seldom-assistant-conversations'

export const DEFAULT_SUGGESTIONS = [
  'Summarize my week',
  'What is early action?',
  'How to improve first touch?',
  'Help me plan tomorrow',
] as const
