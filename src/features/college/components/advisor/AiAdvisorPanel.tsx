import { useEffect, useRef, type FormEvent } from 'react'
import { Button } from '@components/ui/Button'
import { Panel } from '@components/ui/Panel'
import { IconSparkles } from '@components/ui/icons'
import { MarkdownContent } from '@features/assistant/components/MarkdownContent'
import { useCollege } from '../../hooks/useCollege'
import { useCollegeAdvisor } from '../../hooks/useCollegeAdvisor'
import { cn } from '@lib/utils'

const JUNIOR_SUGGESTIONS = [
  'Help me build a balanced college list',
  'What should I do this summer to prepare?',
  'How do I compare schools by fit and cost?',
  'Build my junior year testing plan',
] as const

const SENIOR_SUGGESTIONS = [
  'Help me prioritize application deadlines',
  'Review my personal statement outline',
  'Compare two schools on my list',
  'What should I finish this week?',
] as const

export function AiAdvisorPanel({ fullHeight = false }: { fullHeight?: boolean }) {
  const { isSeniorMode } = useCollege()
  const { messages, input, setInput, isTyping, sendMessage } = useCollegeAdvisor(isSeniorMode)
  const listRef = useRef<HTMLUListElement>(null)
  const suggestions = isSeniorMode ? SENIOR_SUGGESTIONS : JUNIOR_SUGGESTIONS

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <Panel title="AI College Advisor" subtitle="Powered by Seldom AI" className={cn(fullHeight && 'flex h-full min-h-0 flex-col')}>
      <div className={cn('flex min-h-0 flex-col', fullHeight ? 'h-full flex-1' : 'h-72')}>
        <ul
          ref={listRef}
          className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1"
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
              {msg.role === 'assistant' ? (
                <div>
                  <IconSparkles
                    width={12}
                    height={12}
                    className="mb-1 inline text-[var(--color-accent-muted)]"
                    aria-hidden
                  />
                  <MarkdownContent content={msg.content} className="prose-xs max-w-none [&_*]:text-xs" />
                </div>
              ) : (
                msg.content
              )}
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
            disabled={isTyping}
            placeholder={
              isSeniorMode
                ? 'Ask about essays, schools, deadlines…'
                : 'Ask about exploring schools, testing, summer plans…'
            }
            aria-label="Message to AI advisor"
            className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:opacity-60"
          />
          <Button type="submit" size="sm" disabled={!input.trim() || isTyping}>
            Send
          </Button>
        </form>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 border-t border-[var(--color-border)] pt-3">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            disabled={isTyping}
            onClick={() => sendMessage(suggestion)}
            className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2.5 py-1 text-[10px] text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent-muted)] disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </Panel>
  )
}
