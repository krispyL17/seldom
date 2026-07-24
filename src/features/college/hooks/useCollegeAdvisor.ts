import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { AssistantApiError, sendAssistantMessage } from '@services/assistant/assistantClient'
import type { AdvisorMessage } from '../types'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function buildWelcome(isSeniorMode: boolean, name?: string): string {
  const greeting = name ? `Hi ${name} — ` : ''
  return isSeniorMode
    ? `${greeting}I'm your **college advisor**. Ask about deadlines, essays, school comparisons, or what to prioritize this week.`
    : `${greeting}I'm your **college advisor**. Ask about building a list, testing plans, summer prep, or comparing schools.`
}

export function useCollegeAdvisor(isSeniorMode: boolean) {
  const { session, user } = useAuth()
  const displayName =
    typeof user?.user_metadata?.display_name === 'string' ? user.user_metadata.display_name : ''
  const [messages, setMessages] = useState<AdvisorMessage[]>(() => [
    {
      id: generateId(),
      role: 'assistant',
      content: buildWelcome(isSeniorMode, displayName),
      timestamp: new Date().toISOString(),
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const streamRef = useRef<number | null>(null)

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
        prev.map((m) => (m.id === messageId ? { ...m, content: partial } : m)),
      )
      if (index >= fullText.length) {
        if (streamRef.current) window.clearInterval(streamRef.current)
        streamRef.current = null
        setIsTyping(false)
      }
    }, 12)
  }, [])

  const sendMessage = useCallback(
    (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || isTyping) return

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
            streamReply(assistantMsg.id, result.reply)
            return
          } catch (err) {
            const message =
              err instanceof AssistantApiError
                ? err.message
                : 'Could not reach the advisor. Check your connection and try again.'
            streamReply(
              assistantMsg.id,
              `Sorry — ${message}. Add your OpenAI key in Settings if the server key is not configured.`,
            )
            return
          }
        }

        streamReply(
          assistantMsg.id,
          'Sign in and add your OpenAI key in Settings to use the college advisor.',
        )
      })()
    },
    [isTyping, messages, session?.access_token, streamReply],
  )

  return { messages, input, setInput, isTyping, sendMessage }
}
