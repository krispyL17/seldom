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
import { isSupabaseConfigured } from '@config/env'
import { collegeUserDataService } from '@services/database/collegeUserData'
import { AssistantApiError, sendAssistantMessage } from '@services/assistant/assistantClient'
import type { AdvisorMessage } from '@features/college/types'
import { captureOrigin, isOnOrigin } from '../utils/sessionOrigin'
import { useAiFloatingSessionRegistry } from './AiFloatingSessionProvider'
import {
  REPLY_ANIMATION_INTERVAL_MS,
  shouldAnimateReply,
} from '../utils/replyDisplay'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function buildWelcome(isSeniorMode: boolean, name?: string): string {
  const greeting = name ? `Hi ${name} — ` : ''
  return isSeniorMode
    ? `${greeting}I'm your **college advisor**. Ask about deadlines, essays, school comparisons, or what to prioritize this week.`
    : `${greeting}I'm your **college advisor**. Ask about building a list, testing plans, summer prep, or comparing schools.`
}

export interface CollegeAdvisorChatContextValue {
  messages: AdvisorMessage[]
  input: string
  setInput: (value: string) => void
  isTyping: boolean
  isSeniorMode: boolean
  setSeniorMode: (senior: boolean) => void
  sendMessage: (content: string) => void
}

const CollegeAdvisorChatContext = createContext<CollegeAdvisorChatContextValue | null>(null)

export function CollegeAdvisorChatProvider({ children }: { children: ReactNode }) {
  const { session, user } = useAuth()
  const location = useLocation()
  const { patchSession, clearSession } = useAiFloatingSessionRegistry()
  const displayName =
    typeof user?.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : ''
  const [isSeniorMode, setSeniorMode] = useState(false)
  const [messages, setMessages] = useState<AdvisorMessage[]>(() => [
    {
      id: generateId(),
      role: 'assistant',
      content: buildWelcome(false, displayName),
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const streamRef = useRef<number | null>(null)
  const originRef = useRef(captureOrigin(location.pathname, location.search))

  useEffect(() => {
    if (!user?.id || !isSupabaseConfigured()) return
    void collegeUserDataService.fetch(user.id).then((data) => {
      setSeniorMode(data.resumeSettings.applicationPhase === 'senior')
    })
  }, [user?.id])

  useEffect(() => {
    setMessages([
      {
        id: generateId(),
        role: 'assistant',
        content: buildWelcome(isSeniorMode, displayName),
        timestamp: new Date().toISOString(),
      },
    ])
  }, [isSeniorMode, displayName])

  useEffect(() => {
    patchSession('college-advisor', { isBusy: isTyping })
  }, [isTyping, patchSession])

  useEffect(() => {
    const sessionOrigin = originRef.current
    if (isOnOrigin(location.pathname, location.search, sessionOrigin) && !isTyping) {
      clearSession('college-advisor')
    }
  }, [location.pathname, location.search, isTyping, clearSession])

  useEffect(() => {
    return () => {
      if (streamRef.current) window.clearInterval(streamRef.current)
    }
  }, [])

  const streamReply = useCallback((messageId: string, fullText: string) => {
    if (!shouldAnimateReply(fullText)) {
      setIsTyping(false)
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, content: fullText } : m)))
      return
    }

    setIsTyping(true)
    let index = 0
    if (streamRef.current) window.clearInterval(streamRef.current)

    streamRef.current = window.setInterval(() => {
      index += Math.max(1, Math.floor(fullText.length / 120))
      const partial = fullText.slice(0, index)
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, content: partial } : m)))
      if (index >= fullText.length) {
        if (streamRef.current) window.clearInterval(streamRef.current)
        streamRef.current = null
        setIsTyping(false)
      }
    }, REPLY_ANIMATION_INTERVAL_MS)
  }, [])

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || isTyping) return

      originRef.current = captureOrigin(location.pathname, location.search)
      patchSession('college-advisor', {
        origin: originRef.current,
        label: 'AI College Coach',
        isBusy: true,
        engaged: true,
      })

      const userMsg: AdvisorMessage = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      }
      const assistantMsg: AdvisorMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setInput('')

      void (async () => {
        const history = messages
          .filter((m) => m.content)
          .slice(-8)
          .map((m) => ({ role: m.role, content: m.content }))

        if (session?.access_token) {
          try {
            const result = await sendAssistantMessage(session.access_token, {
              message: trimmed,
              mode: 'college_planning',
              history,
            })
            if (result.meta.actionsExecuted?.some((action) => action.success)) {
              window.dispatchEvent(new CustomEvent('seldom:college-data-changed'))
            }
            streamReply(assistantMsg.id, result.reply)
            return
          } catch (err) {
            if (err instanceof AssistantApiError && (err.status === 503 || err.status === 404)) {
              streamReply(
                assistantMsg.id,
                'Live AI needs Ollama and the API server. Start Ollama locally, set OLLAMA_MODEL in `.env.local`, run `npm run dev:vercel` (not plain `npm run dev`), then retry.',
              )
              return
            }
            const message =
              err instanceof AssistantApiError
                ? err.message
                : 'Could not reach the advisor. Check your connection and try again.'
            streamReply(assistantMsg.id, `Sorry — ${message}`)
            return
          }
        }

        streamReply(
          assistantMsg.id,
          'Sign in and start Ollama with OLLAMA_MODEL configured to use the college advisor.',
        )
      })()
    },
    [isTyping, location.pathname, location.search, messages, patchSession, session?.access_token, streamReply],
  )

  const value = useMemo<CollegeAdvisorChatContextValue>(
    () => ({
      messages,
      input,
      setInput,
      isTyping,
      isSeniorMode,
      setSeniorMode,
      sendMessage,
    }),
    [messages, input, isTyping, isSeniorMode, sendMessage],
  )

  return (
    <CollegeAdvisorChatContext.Provider value={value}>{children}</CollegeAdvisorChatContext.Provider>
  )
}

export function useCollegeAdvisorChatContext() {
  const ctx = useContext(CollegeAdvisorChatContext)
  if (!ctx) throw new Error('useCollegeAdvisorChatContext must be used within CollegeAdvisorChatProvider')
  return ctx
}
