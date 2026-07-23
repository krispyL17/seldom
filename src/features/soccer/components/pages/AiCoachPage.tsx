import { useEffect, useRef, type FormEvent } from 'react'
import { Button } from '@components/ui/Button'
import { Panel } from '@components/ui/Panel'
import { IconSparkles } from '@components/ui/icons'
import { MarkdownContent } from '@features/assistant/components/MarkdownContent'
import { cn } from '@lib/utils'
import { CoachInsightsPanel } from '../../coach/components/CoachInsightsPanel'
import { useSoccerCoach } from '../../coach/hooks/useSoccerCoach'

export function AiCoachPage() {
  const {
    messages,
    input,
    setInput,
    suggestions,
    insights,
    isTyping,
    isGeneratingInsights,
    sendMessage,
    generateInsights,
  } = useSoccerCoach()

  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Panel
        title="AI Coach"
        subtitle="Session analysis · periodization · match feedback"
        badge={
          <span className="rounded-full bg-[var(--color-accent)]/15 px-2 py-0.5 text-[10px] font-medium text-[var(--color-accent-muted)]">
            Live
          </span>
        }
        fullWidth
        className="lg:col-span-2"
      >
        <div className="flex h-[28rem] flex-col">
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
                {msg.role === 'assistant' ? (
                  <div>
                    <IconSparkles
                      width={12}
                      height={12}
                      className="mb-1 inline text-[var(--color-accent-muted)]"
                    />
                    <MarkdownContent
                      content={msg.content || (msg.isStreaming ? '…' : '')}
                      className="prose-xs max-w-none [&_*]:text-xs"
                    />
                  </div>
                ) : (
                  msg.content
                )}
              </li>
            ))}
          </ul>
          <form onSubmit={handleSubmit} className="mt-3 flex gap-2 border-t border-[var(--color-border)] pt-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about training, matches, recovery…"
              disabled={isTyping}
              className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2 text-xs focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:opacity-60"
            />
            <Button type="submit" size="sm" disabled={!input.trim() || isTyping}>
              Send
            </Button>
          </form>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setInput(s)}
              disabled={isTyping}
              className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-[10px] text-[var(--color-text-secondary)] hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent-muted)] disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      </Panel>

      <CoachInsightsPanel
        insights={insights}
        isGenerating={isGeneratingInsights}
        onGenerate={() => void generateInsights()}
      />
    </div>
  )
}
