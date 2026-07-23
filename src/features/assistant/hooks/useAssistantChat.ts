import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import type { ChatMessage, Conversation } from '../types'
import {
  conversationTitleFromMessage,
  generateId,
  loadActiveId,
  loadConversations,
  saveConversations,
} from '../utils/storage'
import { getStubReply } from '../utils/stubResponses'
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
import {
  FALLBACK_MODULES,
  FALLBACK_SUGGESTIONS,
  FALLBACK_WELCOME,
} from '../data/capabilities'

const TYPING_INTERVAL_MS = 18

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

export function useAssistantChat() {
  const { session } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversations())
  const [activeId, setActiveId] = useState<string | null>(() => loadActiveId())
  const [isTyping, setIsTyping] = useState(false)
  const [activeMode, setActiveMode] = useState<AssistantMode>('chat')
  const [modules, setModules] = useState<AssistantModule[]>(FALLBACK_MODULES)
  const [suggestions, setSuggestions] = useState<string[]>([...FALLBACK_SUGGESTIONS])
  const [proactiveInsights, setProactiveInsights] = useState<ProactiveInsight[]>([])
  const [liveConnected, setLiveConnected] = useState(false)
  const [lastMode, setLastMode] = useState<AssistantMode | null>(null)
  const streamRef = useRef<number | null>(null)
  const welcomeRef = useRef(FALLBACK_WELCOME)

  const activeConversation = conversations.find((c) => c.id === activeId) ?? null

  useEffect(() => {
    if (!session?.access_token) {
      setLiveConnected(false)
      return
    }

    void fetchAssistantBootstrap(session.access_token)
      .then((bootstrap) => {
        welcomeRef.current = bootstrap.welcome
        setModules(bootstrap.modules)
        setSuggestions(bootstrap.suggestions)
        setProactiveInsights(bootstrap.proactiveInsights)
        setLiveConnected(true)
      })
      .catch(() => {
        setLiveConnected(false)
      })
  }, [session?.access_token])

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
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? updater(c) : c)),
    )
  }, [])

  const streamAssistantReply = useCallback(
    (conversationId: string, messageId: string, fullText: string) => {
      setIsTyping(true)
      let index = 0

      if (streamRef.current) window.clearInterval(streamRef.current)

      streamRef.current = window.setInterval(() => {
        index += 1
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
      }, TYPING_INTERVAL_MS)
    },
    [updateConversation],
  )

  const sendMessage = useCallback(
    (content: string, modeOverride?: AssistantMode) => {
      const trimmed = content.trim()
      if (!trimmed || isTyping) return

      const mode = modeOverride ?? activeMode

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
            streamAssistantReply(conversationId!, assistantMsg.id, result.reply)
            return
          } catch (err) {
            if (err instanceof AssistantApiError && err.status !== 503 && err.status !== 404) {
              streamAssistantReply(
                conversationId!,
                assistantMsg.id,
                `Sorry — the assistant hit an error: ${err.message}`,
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
    [activeId, activeConversation, activeMode, isTyping, session, streamAssistantReply, updateConversation],
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

  return {
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
    lastMode,
    sendMessage,
    newConversation,
    selectConversation,
    deleteConversation,
  }
}
