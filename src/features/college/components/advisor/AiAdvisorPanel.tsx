import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '@components/ui/Button'
import { Panel } from '@components/ui/Panel'
import { IconSparkles } from '@components/ui/icons'
import { PreviewBadge } from '../shared/PreviewBadge'
import { advisorMessagesData } from '../../data/mockData'
import type { AdvisorMessage } from '../../types'
import { cn } from '@lib/utils'

const SUGGESTIONS = [
  'Help me balance my college list',
  'Compare UNC vs Duke for me',
  'Build my junior year testing plan',
  'What should I do this summer?',
] as const

export function AiAdvisorPanel() {
  const [messages, setMessages] = useState<AdvisorMessage[]>(advisorMessagesData)
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    list.scrollTop = list.scrollHeight
  }, [messages])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return

    const now = Date.now()
    const userMsg: AdvisorMessage = {
      id: `msg-${now}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date(now).toISOString(),
    }

    const assistantMsg: AdvisorMessage = {
      id: `msg-${now}-reply`,
      role: 'assistant',
      content:
        'AI advisor is coming soon. I will be able to review essays, compare colleges, create application plans, track deadlines, and suggest schools.',
      timestamp: new Date(now + 1).toISOString(),
    }

    setMessages((prev) => [...prev, userMsg, assistantMsg])
    setInput('')
  }

  return (
    <Panel
      title="AI College Advisor"
      subtitle="Essay review · school comparison · planning"
      badge={<PreviewBadge />}
    >
      <div className="flex h-72 flex-col">
        <ul
          ref={listRef}
          className="flex-1 space-y-3 overflow-y-auto pr-1"
          aria-live="polite"
          aria-label="Advisor conversation"
        >
          {messages.map((msg) => (
            <li
              key={msg.id}
              className={cn(
                'max-w-[92%] rounded-[var(--radius-md)] px-3 py-2.5 text-xs leading-relaxed',
                msg.role === 'user'
                  ? 'ml-auto bg-[var(--color-accent)]/25 text-[var(--color-text-primary)]'
                  : 'mr-auto bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)]',
              )}
            >
              {msg.role === 'assistant' && (
                <IconSparkles
                  width={12}
                  height={12}
                  className="mb-1 inline text-[var(--color-accent-muted)]"
                  aria-hidden
                />
              )}{' '}
              {msg.content}
            </li>
          ))}
        </ul>

        <form
          onSubmit={handleSubmit}
          className="mt-3 flex gap-2 border-t border-[var(--color-border)] pt-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about essays, schools, deadlines…"
            aria-label="Message to AI advisor"
            className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
          <Button type="submit" size="sm" disabled={!input.trim()}>
            Send
          </Button>
        </form>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-3">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => setInput(suggestion)}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2.5 py-1 text-[10px] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent-muted)]"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </Panel>
  )
}
