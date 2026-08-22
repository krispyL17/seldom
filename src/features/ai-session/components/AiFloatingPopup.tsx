import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router-dom'
import { useMemo, useRef, useEffect, type FormEvent } from 'react'
import { IconSparkles } from '@components/ui/icons'
import { Button } from '@components/ui/Button'
import { MarkdownContent } from '@features/assistant/components/MarkdownContent'
import { cn } from '@lib/utils'
import type { AiSessionKind } from '../types'
import { isOnOrigin, originToPath } from '../utils/sessionOrigin'
import { useAiFloatingSessionRegistry } from '../providers/AiFloatingSessionProvider'
import { useAssistantChatContext } from '../providers/AssistantChatProvider'
import { useCollegeAdvisorChatContext } from '../providers/CollegeAdvisorChatProvider'

function pickVisibleSession(
  sessions: Partial<Record<AiSessionKind, { engaged: boolean; origin: { pathname: string; search: string }; isBusy: boolean }>>,
  pathname: string,
  search: string,
): AiSessionKind | null {
  const candidates: AiSessionKind[] = []
  for (const kind of ['assistant', 'college-advisor'] as const) {
    const session = sessions[kind]
    if (!session?.engaged) continue
    if (isOnOrigin(pathname, search, session.origin)) continue
    candidates.push(kind)
  }
  if (candidates.length === 0) return null
  const busy = candidates.find((kind) => sessions[kind]?.isBusy)
  return busy ?? candidates[candidates.length - 1] ?? null
}

export function AiFloatingPopup() {
  const location = useLocation()
  const { sessions } = useAiFloatingSessionRegistry()
  const assistant = useAssistantChatContext()
  const collegeAdvisor = useCollegeAdvisorChatContext()
  const listRef = useRef<HTMLUListElement>(null)

  const activeKind = useMemo(
    () => pickVisibleSession(sessions, location.pathname, location.search),
    [sessions, location.pathname, location.search],
  )

  const session = activeKind ? sessions[activeKind] : null

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [activeKind, assistant.activeConversation?.messages, collegeAdvisor.messages, assistant.isTyping, collegeAdvisor.isTyping])

  if (!activeKind || !session) return null

  const returnPath = originToPath(session.origin)
  const isAssistant = activeKind === 'assistant'
  const isBusy = isAssistant ? assistant.isTyping : collegeAdvisor.isTyping

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (isAssistant) {
      const value = (e.currentTarget as HTMLFormElement).querySelector('textarea') as HTMLTextAreaElement
      assistant.sendMessage(value.value)
      value.value = ''
      return
    }
    collegeAdvisor.sendMessage(collegeAdvisor.input)
  }

  const popupMessages = isAssistant
    ? (assistant.activeConversation?.messages.filter((m) => m.role !== 'system').slice(-6) ?? [])
    : collegeAdvisor.messages.slice(-6)

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[95] flex justify-center p-3 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:justify-end sm:p-0"
      aria-live="polite"
    >
      <section
        role="dialog"
        aria-labelledby="ai-floating-title"
        className={cn(
          'pointer-events-auto flex w-full max-w-md flex-col overflow-hidden',
          'rounded-[var(--radius-lg)] border border-[var(--color-border)]',
          'bg-[var(--color-surface-raised)] shadow-[var(--shadow-elevated)]',
          'animate-slide-up',
          'max-h-[min(70dvh,520px)]',
        )}
      >
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] px-3.5 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent-subtle)]">
              <IconSparkles width={12} height={12} className="text-[var(--color-accent-muted)]" />
            </div>
            <div className="min-w-0">
              <h2 id="ai-floating-title" className="truncate text-xs font-semibold text-[var(--color-text-primary)]">
                {session.label}
              </h2>
              <p className="truncate text-xs text-[var(--color-text-tertiary)]">
                {isBusy ? 'Working on your request…' : 'Tap return to open the full view'}
              </p>
            </div>
          </div>
          <Link
            to={returnPath}
            className="shrink-0 rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-2 py-1 text-xs font-medium text-white hover:bg-[var(--color-accent-hover)]"
          >
            Return
          </Link>
        </header>

        <ul
          ref={listRef}
          className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3.5 py-2.5"
          aria-label="AI conversation preview"
        >
          {popupMessages.map((msg) => {
            const role = 'role' in msg ? msg.role : 'assistant'
            const content = 'content' in msg ? msg.content : ''
            const key = 'id' in msg ? msg.id : content.slice(0, 20)
            return (
              <li
                key={key}
                className={cn(
                  'max-w-[92%] rounded-[var(--radius-md)] px-2.5 py-2 text-xs leading-relaxed',
                  role === 'user'
                    ? 'ml-auto bg-[var(--color-accent)]/25 text-[var(--color-text-primary)]'
                    : 'mr-auto bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)]',
                )}
              >
                {role === 'assistant' ? <MarkdownContent content={content || '…'} /> : content}
              </li>
            )
          })}
          {isBusy && (
            <li className="mr-auto rounded-[var(--radius-md)] bg-[var(--color-surface-overlay)] px-2.5 py-2 text-xs text-[var(--color-text-tertiary)]">
              Seldom AI is typing…
            </li>
          )}
        </ul>

        <form onSubmit={handleSubmit} className="shrink-0 border-t border-[var(--color-border)] p-2.5">
          {isAssistant ? (
            <textarea
              rows={2}
              placeholder="Continue the conversation…"
              disabled={assistant.isTyping}
              className="w-full resize-none rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2.5 py-2 text-xs text-[var(--color-text-primary)] outline-none focus:border-[var(--color-accent)]"
            />
          ) : (
            <div className="flex gap-2">
              <input
                value={collegeAdvisor.input}
                onChange={(e) => collegeAdvisor.setInput(e.target.value)}
                placeholder="Ask your college coach…"
                disabled={collegeAdvisor.isTyping}
                className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2.5 py-2 text-xs outline-none focus:border-[var(--color-accent)]"
              />
              <Button type="submit" size="sm" disabled={collegeAdvisor.isTyping || !collegeAdvisor.input.trim()}>
                Send
              </Button>
            </div>
          )}
          {isAssistant && (
            <div className="mt-2 flex justify-end">
              <Button type="submit" size="sm" disabled={assistant.isTyping}>
                Send
              </Button>
            </div>
          )}
        </form>
      </section>
    </div>,
    document.body,
  )
}
