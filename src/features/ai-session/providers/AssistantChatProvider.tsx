import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import type { ChatMessage, Conversation } from '@features/assistant/types'
import {
  conversationTitleFromMessage,
  generateId,
  loadActiveId,
  loadConversations,
  saveConversations,
  sanitizeConversationTitle,
} from '@features/assistant/utils/storage'
import { getStubReply } from '@features/assistant/utils/stubResponses'
import {
  sendAssistantMessage,
  fetchAssistantBootstrap,
  AssistantApiError,
  type AssistantMode,
  type AssistantModule,
  type ProactiveInsight,
} from '@services/assistant'
import { retrieveMemories } from '@services/memory'
import { queryNeedsWebSearch, searchWeb } from '@services/search'
import { formatUserError } from '@lib/userFacingError'
import {
  FALLBACK_MODULES,
  FALLBACK_SUGGESTIONS,
  FALLBACK_WELCOME,
  MODE_LABELS,
} from '@features/assistant/data/capabilities'
import { captureOrigin, isOnOrigin } from '../utils/sessionOrigin'
import { useAiFloatingSessionRegistry } from './AiFloatingSessionProvider'
import {
  REPLY_ANIMATION_INTERVAL_MS,
  shouldAnimateReply,
} from '../utils/replyDisplay'

function createWelcomeMessage(content: string): ChatMessage {
  return {
    id: generateId(),
    role: 'assistant',
    content,
    createdAt: new Date().toISOString(),
  }
}

function createConversation(welcome: string): Conversation {
  const now = new Date().toISOString()
  return {
    id: generateId(),
    title: 'New chat',
    messages: [createWelcomeMessage(welcome)],
    createdAt: now,
    updatedAt: now,
  }
}

function buildHistory(messages: ChatMessage[]): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content && !m.isStreaming)
    .slice(-10)
    .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }))
}

export interface AssistantChatContextValue {
  conversations: Conversation[]
  activeConversation: Conversation | null
  activeId: string | null
  isTyping: boolean
  activeMode: AssistantMode
  setActiveMode: (mode: AssistantMode) => void
  modules: AssistantModule[]
  suggestions: string[]
  proactiveInsights: ProactiveInsight[]
  liveConnected: boolean
  connectionHint: string | null
  lastMode: AssistantMode | null
  sendMessage: (content: string, modeOverride?: AssistantMode) => void
  newConversation: () => void
  selectConversation: (id: string) => void
  deleteConversation: (id: string) => void
  retryConnection: () => Promise<void>
}

const AssistantChatContext = createContext<AssistantChatContextValue | null>(null)

export function AssistantChatProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const location = useLocation()
  const { patchSession, clearSession } = useAiFloatingSessionRegistry()
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations())
  const [activeId, setActiveId] = useState<string | null>(() => loadActiveId())
  const [isTyping, setIsTyping] = useState(false)
  const [activeMode, setActiveMode] = useState<AssistantMode>('chat')
  const [modules, setModules] = useState<AssistantModule[]>(FALLBACK_MODULES)
  const [suggestions, setSuggestions] = useState<string[]>([...FALLBACK_SUGGESTIONS])
  const [proactiveInsights, setProactiveInsights] = useState<ProactiveInsight[]>([])
  const [liveConnected, setLiveConnected] = useState(false)
  const [connectionHint, setConnectionHint] = useState<string | null>(null)
  const [lastMode, setLastMode] = useState<AssistantMode | null>(null)
  const streamRef = useRef<number | null>(null)
  const welcomeRef = useRef(FALLBACK_WELCOME)
  const originRef = useRef(captureOrigin(location.pathname, location.search))

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null
  const hasStreaming = activeConversation?.messages.some((m) => m.isStreaming) ?? false
  const isBusy = isTyping || hasStreaming

  const syncFloatingSession = useCallback(
    (engaged?: boolean) => {
      patchSession('assistant', {
        origin: originRef.current,
        label: MODE_LABELS[lastMode ?? activeMode] ?? 'Seldom AI',
        isBusy,
        engaged: engaged ?? true,
      })
    },
    [activeMode, isBusy, lastMode, patchSession],
  )

  useEffect(() => {
    patchSession('assistant', { isBusy })
  }, [isBusy, patchSession])

  useEffect(() => {
    const sessionOrigin = originRef.current
    if (isOnOrigin(location.pathname, location.search, sessionOrigin) && !isBusy) {
      clearSession('assistant')
    }
  }, [location.pathname, location.search, isBusy, clearSession])

  const connectLive = useCallback(async () => {
    if (!session?.access_token) {
      setLiveConnected(false)
      setConnectionHint('Sign in to use live AI.')
      return
    }

    try {
      const bootstrap = await fetchAssistantBootstrap(session.access_token)
      welcomeRef.current = bootstrap.welcome
      setModules(bootstrap.modules)
      setSuggestions(bootstrap.suggestions)
      setProactiveInsights(bootstrap.proactiveInsights)
      setLiveConnected(true)
      setConnectionHint(null)
    } catch (err) {
      setLiveConnected(false)
      if (err instanceof AssistantApiError) {
        setConnectionHint(err.message)
        return
      }
      try {
        const res = await fetch('/api/health')
        const data = (await res.json()) as { hint?: string }
        setConnectionHint(data.hint ?? 'Could not reach Seldom AI. Try again in a moment.')
      } catch {
        setConnectionHint('Could not reach Seldom AI. Try again in a moment.')
      }
    }
  }, [session?.access_token])

  useEffect(() => {
    void connectLive()
  }, [connectLive])

  useEffect(() => {
    if (conversations.length === 0) {
      const first = createConversation(welcomeRef.current)
      setConversations([first])
      setActiveId(first.id)
      return
    }
    if (!activeId || !conversations.some((c) => c.id === activeId)) {
      setActiveId(conversations[0]?.id ?? null)
    }
  }, [conversations, activeId])

  useEffect(() => {
    saveConversations(conversations, activeId)
  }, [conversations, activeId])

  useEffect(() => {
    return () => {
      if (streamRef.current) window.clearInterval(streamRef.current)
    }
  }, [])

  const updateConversation = useCallback((id: string, updater: (c: Conversation) => Conversation) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)))
  }, [])

  const streamAssistantReply = useCallback(
    (conversationId: string, messageId: string, fullText: string) => {
      if (!shouldAnimateReply(fullText)) {
        setIsTyping(false)
        updateConversation(conversationId, (c) => ({
          ...c,
          updatedAt: new Date().toISOString(),
          messages: c.messages.map((m) =>
            m.id === messageId ? { ...m, content: fullText, isStreaming: false } : m,
          ),
        }))
        return
      }

      setIsTyping(true)
      let index = 0

      if (streamRef.current) window.clearInterval(streamRef.current)

      streamRef.current = window.setInterval(() => {
        index += Math.max(1, Math.floor(fullText.length / 120))
        const partial = fullText.slice(0, index)

        updateConversation(conversationId, (c) => ({
          ...c,
          updatedAt: new Date().toISOString(),
          messages: c.messages.map((m) =>
            m.id === messageId ? { ...m, content: partial, isStreaming: index < fullText.length } : m,
          ),
        }))

        if (index >= fullText.length) {
          if (streamRef.current) window.clearInterval(streamRef.current)
          streamRef.current = null
          setIsTyping(false)
          updateConversation(conversationId, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === messageId ? { ...m, isStreaming: false } : m,
            ),
          }))
        }
      }, REPLY_ANIMATION_INTERVAL_MS)
    },
    [updateConversation],
  )

  const applySuggestedTitle = useCallback(
    (conversationId: string, title: string | undefined) => {
      if (!title) return
      const next = sanitizeConversationTitle(title)
      updateConversation(conversationId, (c) => ({ ...c, title: next }))
    },
    [updateConversation],
  )

  const sendMessage = useCallback(
    (content: string, modeOverride?: AssistantMode) => {
      const trimmed = content.trim()
      if (!trimmed || isTyping) return

      const mode = modeOverride ?? activeMode
      originRef.current = captureOrigin(location.pathname, location.search)
      syncFloatingSession(true)

      let conversationId = activeId
      let conversationSnapshot = activeConversation

      if (!conversationId || !conversationSnapshot) {
        const created = createConversation(welcomeRef.current)
        conversationId = created.id
        conversationSnapshot = created
        setConversations((prev) => [created, ...prev])
        setActiveId(created.id)
      }

      const userMsg: ChatMessage = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        createdAt: new Date().toISOString(),
      }

      const assistantMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        isStreaming: true,
      }

      updateConversation(conversationId, (c) => {
        const isFirstUserMsg = c.messages.filter((m) => m.role === 'user').length === 0
        return {
          ...c,
          title: isFirstUserMsg ? conversationTitleFromMessage(trimmed) : c.title,
          updatedAt: new Date().toISOString(),
          messages: [...c.messages, userMsg, assistantMsg],
        }
      })

      void (async () => {
        const history = buildHistory(conversationSnapshot!.messages)

        if (session?.access_token) {
          try {
            const result = await sendAssistantMessage(session.access_token, {
              message: trimmed,
              mode: mode === 'chat' ? undefined : mode,
              history,
            })
            setLastMode(result.meta.mode)
            if (result.meta.proactiveInsights.length > 0) {
              setProactiveInsights(result.meta.proactiveInsights)
            }
            setLiveConnected(true)
            setConnectionHint(null)
            applySuggestedTitle(conversationId!, result.meta.suggestedTitle)
            streamAssistantReply(conversationId!, assistantMsg.id, result.reply)
            return
          } catch (err) {
            if (err instanceof AssistantApiError && err.status === 503) {
              setLiveConnected(false)
              setConnectionHint('AI is offline. The host may need to start Ollama or refresh the tunnel URL.')
              streamAssistantReply(
                conversationId!,
                assistantMsg.id,
                `**AI is offline**\n\n${formatUserError(err, 'Seldom AI could not respond.')}\n\nTry again in a few minutes. If you host this app, check **Settings → AI status**.`,
              )
              return
            }
            if (err instanceof AssistantApiError && err.status !== 503 && err.status !== 404) {
              streamAssistantReply(
                conversationId!,
                assistantMsg.id,
                `Sorry — that did not work.\n\n${formatUserError(err, 'Seldom AI could not complete that request.')}\n\nTry again, or start a new message if the problem continues.`,
              )
              return
            }
          }
        }

        const [memorySettled, searchSettled] = await Promise.allSettled([
          retrieveMemories(trimmed, { limit: 8 }),
          queryNeedsWebSearch(trimmed) ? searchWeb(trimmed, { limit: 5 }) : Promise.resolve(null),
        ])

        const reply = getStubReply(trimmed, {
          memories: memorySettled.status === 'fulfilled' ? memorySettled.value.memories : [],
          memoryContext:
            memorySettled.status === 'fulfilled' ? memorySettled.value.contextBlock : undefined,
          search:
            searchSettled.status === 'fulfilled' && searchSettled.value
              ? searchSettled.value
              : undefined,
          mode,
        })

        streamAssistantReply(conversationId!, assistantMsg.id, reply)
      })()
    },
    [
      activeId,
      activeConversation,
      activeMode,
      isTyping,
      location.pathname,
      location.search,
      session,
      streamAssistantReply,
      syncFloatingSession,
      applySuggestedTitle,
      updateConversation,
    ],
  )

  const newConversation = useCallback(() => {
    const conv = createConversation(welcomeRef.current)
    setConversations((prev) => [conv, ...prev])
    setActiveId(conv.id)
  }, [])

  const selectConversation = useCallback((id: string) => {
    if (streamRef.current) {
      window.clearInterval(streamRef.current)
      streamRef.current = null
      setIsTyping(false)
    }
    setActiveId(id)
  }, [])

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id)
        if (activeId === id) {
          setActiveId(next[0]?.id ?? null)
        }
        if (next.length === 0) {
          const fresh = createConversation(welcomeRef.current)
          setActiveId(fresh.id)
          return [fresh]
        }
        return next
      })
    },
    [activeId],
  )

  const value = useMemo<AssistantChatContextValue>(
    () => ({
      conversations,
      activeConversation,
      activeId,
      isTyping,
      activeMode,
      setActiveMode,
      modules,
      suggestions,
      proactiveInsights,
      liveConnected,
      connectionHint,
      lastMode,
      sendMessage,
      newConversation,
      selectConversation,
      deleteConversation,
      retryConnection: connectLive,
    }),
    [
      conversations,
      activeConversation,
      activeId,
      isTyping,
      activeMode,
      modules,
      suggestions,
      proactiveInsights,
      liveConnected,
      connectionHint,
      lastMode,
      sendMessage,
      newConversation,
      selectConversation,
      deleteConversation,
      connectLive,
    ],
  )

  return <AssistantChatContext.Provider value={value}>{children}</AssistantChatContext.Provider>
}

export function useAssistantChatContext() {
  const ctx = useContext(AssistantChatContext)
  if (!ctx) throw new Error('useAssistantChatContext must be used within AssistantChatProvider')
  return ctx
}
