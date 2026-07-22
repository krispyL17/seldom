import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '@components/ui/Button'
import { Panel } from '@components/ui/Panel'
import { IconSparkles } from '@components/ui/icons'
import { coachMessages, aiCoachTips } from '../../data/mockData'
import type { CoachMessage } from '../../types'
import { cn } from '@lib/utils'

const SUGGESTIONS = [
  'Analyze my last match',
  'Plan this week training load',
  'How do I improve weak foot?',
  'Am I overtraining?',
] as const

export function AiCoachPage() {
  const [messages, setMessages] = useState<CoachMessage[]>(coachMessages)
  const [input, setInput] = useState('')
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    const now = Date.now()
    setMessages((prev) => [
      ...prev,
      { id: `u-${now}`, role: 'user', content: trimmed, timestamp: new Date(now).toISOString() },
      {
        id: `a-${now}`,
        role: 'assistant',
        content: 'AI Coach is coming soon. I will analyze sessions, build periodization plans, and give match feedback.',
        timestamp: new Date(now + 1).toISOString(),
      },
    ])
    setInput('')
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel
        title="AI Coach"
        subtitle="Session analysis · load management"
        badge={
          <span className="rounded-full bg-[var(--color-accent)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--color-accent-muted)]">
            Preview
          </span>
        }
        fullWidth
        className="lg:col-span-2"
      >
        <div className="flex h-80 flex-col">
          <ul ref={listRef} className="flex-1 space-y-3 overflow-y-auto pr-1" aria-live="polite">
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
                  <IconSparkles width={12} height={12} className="mb-1 inline text-[var(--color-accent-muted)]" />
                )}{' '}
                {msg.content}
              </li>
            ))}
          </ul>
          <form onSubmit={handleSubmit} className="mt-3 flex gap-2 border-t border-[var(--color-border)] pt-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about training, matches, recovery…"
              className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2 text-xs focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
            <Button type="submit" size="sm" disabled={!input.trim()}>Send</Button>
          </form>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setInput(s)}
              className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[10px] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent-muted)]"
            >
              {s}
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Insights" subtitle="Placeholder recommendations">
        <ul className="space-y-2">
          {aiCoachTips.map((tip) => (
            <li
              key={tip}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2 text-xs text-[var(--color-text-secondary)]"
            >
              {tip}
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
