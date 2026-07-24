import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import {
  CoachApiError,
  fetchCoachSuggestions,
  generateCoachPlan,
  sendCoachMessage,
} from '@services/soccer/coachClient'
import type { CoachInsight, CoachMessage } from '../types'
import { INSIGHT_MODES } from '../types'
import {
  DEFAULT_COACH_SUGGESTIONS,
  buildCoachWelcome,
  getStubCoachReply,
  getStubInsight,
} from '../utils/stubCoach'

const TYPING_INTERVAL_MS = 14

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function buildHistory(messages: CoachMessage[]): Array<{ role: 'user' | 'assistant'; content: string }> {
  return messages
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && m.content && !m.isStreaming)
    .slice(-10)
    .map((m) => ({ role: m.role, content: m.content }))
}

function createWelcomeMessage(displayName?: string | null): CoachMessage {
  return {
    id: generateId(),
    role: 'assistant',
    content: buildCoachWelcome(displayName),
    timestamp: new Date().toISOString(),
  }
}

function initialInsights(): CoachInsight[] {
  return INSIGHT_MODES.map(({ mode, title }) => ({
    mode,
    title,
    content: '',
    loading: false,
    error: null,
    updatedAt: null,
  }))
}

export function useSoccerCoach() {
  const { session, user } = useAuth()
  const displayName =
    typeof user?.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : null
  const [messages, setMessages] = useState<CoachMessage[]>(() => [createWelcomeMessage(displayName)])
  const [input, setInput] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([...DEFAULT_COACH_SUGGESTIONS])
  const [insights, setInsights] = useState<CoachInsight[]>(initialInsights)
  const [isTyping, setIsTyping] = useState(false)
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false)
  const streamRef = useRef<number | null>(null)

  useEffect(() => {
    setMessages([createWelcomeMessage(displayName)])
  }, [displayName])

  useEffect(() => {
    if (!session?.access_token) return

    void fetchCoachSuggestions(session.access_token)
      .then(({ suggestions: loaded, welcome }) => {
        if (loaded.length) setSuggestions(loaded)
        if (welcome) {
          setMessages((prev) => {
            if (prev.length !== 1 || prev[0]?.role !== 'assistant') return prev
            return [{ ...prev[0], content: welcome }]
          })
        }
      })
  }, [session?.access_token, displayName])

  useEffect(() => {
    return () => {
      if (streamRef.current) window.clearInterval(streamRef.current)
    }
  }, [])

  const streamReply = useCallback((messageId: string, fullText: string) => {
    setIsTyping(true)
    let index = 0

    if (streamRef.current) window.clearInterval(streamRef.current)

    streamRef.current = window.setInterval(() => {
      index += 1
      const partial = fullText.slice(0, index)

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, content: partial, isStreaming: index < fullText.length }
            : m,
        ),
      )

      if (index >= fullText.length) {
        if (streamRef.current) window.clearInterval(streamRef.current)
        streamRef.current = null
        setIsTyping(false)
        setMessages((prev) =>
          prev.map((m) => (m.id === messageId ? { ...m, isStreaming: false } : m)),
        )
      }
    }, TYPING_INTERVAL_MS)
  }, [])

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || isTyping) return

      const userMsg: CoachMessage = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      }

      const assistantMsg: CoachMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true,
      }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setInput('')

      void (async () => {
        const history = buildHistory(messages)

        if (session?.access_token) {
          try {
            const result = await sendCoachMessage(session.access_token, {
              message: trimmed,
              mode: 'chat',
              history,
            })
            streamReply(assistantMsg.id, result.reply)
            return
          } catch (err) {
            if (err instanceof CoachApiError && err.status !== 503 && err.status !== 404) {
              streamReply(assistantMsg.id, `Sorry — the coach hit an error: ${err.message}`)
              return
            }
          }
        }

        streamReply(assistantMsg.id, getStubCoachReply(trimmed))
      })()
    },
    [isTyping, messages, session, streamReply],
  )

  const generateInsights = useCallback(async () => {
    if (isGeneratingInsights) return
    setIsGeneratingInsights(true)

    setInsights((prev) =>
      prev.map((item) => ({ ...item, loading: true, error: null })),
    )

    await Promise.all(
      INSIGHT_MODES.map(async ({ mode }) => {
        try {
          let content: string

          if (session?.access_token) {
            try {
              const result = await generateCoachPlan(session.access_token, { mode })
              content = result.reply
            } catch (err) {
              if (err instanceof CoachApiError && err.status !== 503 && err.status !== 404) {
                throw err
              }
              content = getStubInsight(mode)
            }
          } else {
            content = getStubInsight(mode)
          }

          setInsights((prev) =>
            prev.map((item) =>
              item.mode === mode
                ? {
                    ...item,
                    content,
                    loading: false,
                    error: null,
                    updatedAt: new Date().toISOString(),
                  }
                : item,
            ),
          )
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Generation failed'
          setInsights((prev) =>
            prev.map((item) =>
              item.mode === mode ? { ...item, loading: false, error: message } : item,
            ),
          )
        }
      }),
    )

    setIsGeneratingInsights(false)
  }, [isGeneratingInsights, session?.access_token])

  return {
    messages,
    input,
    setInput,
    suggestions,
    insights,
    isTyping,
    isGeneratingInsights,
    sendMessage,
    generateInsights,
  }
}
