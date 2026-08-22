import { useEffect, useRef, type FormEvent } from 'react'
import { Button } from '@components/ui/Button'
import { Panel } from '@components/ui/Panel'
import { IconSparkles } from '@components/ui/icons'
import { MarkdownContent } from '@features/assistant/components/MarkdownContent'
import { cn } from '@lib/utils'
import type { OnboardingConfig } from './types'
import { useOnboardingChat } from '@hooks/useOnboardingChat'

interface OnboardingChatPanelProps {
  config: OnboardingConfig
  onComplete: (answers: Record<string, unknown>) => Promise<void>
  onFinished?: () => void
  /** Render without outer Panel wrapper (e.g. inside a modal) */
  embedded?: boolean
  /** Shorter transcript area for inline tab intros */
  compact?: boolean
  /** Hide the progress bar (e.g. welcome-only intros) */
  showProgress?: boolean
  progressLabel?: string
}

export function OnboardingChatPanel({
  config,
  onComplete,
  onFinished,
  embedded = false,
  compact = false,
  showProgress = true,
  progressLabel = 'Setup progress',
}: OnboardingChatPanelProps) {
  const {
    messages,
    input,
    setInput,
    choiceOptions,
    progress,
    progressCaption,
    isSubmitting,
    isComplete,
    submitAnswer,
    hasQuestionSteps,
    welcomeAcknowledged,
    continueFromWelcome,
    acknowledgeWelcome,
    currentStep,
  } = useOnboardingChat({ config, onComplete })

  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  useEffect(() => {
    if (isComplete) onFinished?.()
  }, [isComplete, onFinished])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    void submitAnswer(input)
  }

  const showProgressBar = showProgress && (hasQuestionSteps || isComplete)

  const chatBody = (
    <>
      {showProgressBar && (
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs text-[var(--color-text-tertiary)]">
            <span>{progressLabel}</span>
            <span>{progressCaption ?? `${progress}%`}</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-overlay)]">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-500 ease-out"
              style={{ width: `${Math.max(progress, welcomeAcknowledged ? 8 : 4)}%` }}
            />
          </div>
        </div>
      )}

      <div className={cn('flex flex-col', compact ? 'max-h-40' : 'h-[26rem]')}>
        <ul ref={listRef} className="flex-1 space-y-3 overflow-y-auto pr-1" aria-live="polite">
          {messages.map((msg) => (
            <li
              key={msg.id}
              className={cn(
                'max-w-[92%] rounded-[var(--radius-md)] px-3 py-2.5 text-xs leading-relaxed transition-all duration-200',
                msg.role === 'user'
                  ? 'ml-auto bg-[var(--color-accent-subtle)] text-[var(--color-text-primary)]'
                  : 'mr-auto border border-[var(--color-border)] bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)]',
              )}
            >
              {msg.role === 'assistant' ? (
                <div>
                  <IconSparkles
                    width={12}
                    height={12}
                    className="mb-1 inline text-[var(--color-accent-muted)]"
                  />
                  <MarkdownContent content={msg.content} className="prose-xs max-w-none [&_*]:text-xs" />
                </div>
              ) : (
                msg.content
              )}
            </li>
          ))}
        </ul>

        {!isComplete && hasQuestionSteps && !welcomeAcknowledged && (
          <div className="mt-3 border-t border-[var(--color-border)] pt-3">
            <Button type="button" size="sm" onClick={continueFromWelcome}>
              Continue
            </Button>
          </div>
        )}

        {!isComplete && hasQuestionSteps && welcomeAcknowledged && (
          <>
            {choiceOptions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {choiceOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => void submitAnswer(option)}
                    className="rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)]/40 hover:text-[var(--color-accent-muted)] disabled:opacity-50"
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-3 flex gap-2 border-t border-[var(--color-border)] pt-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={currentStep?.placeholder ?? 'Type your answer…'}
                disabled={isSubmitting}
                aria-label="Your answer"
                className="flex-1 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2 text-xs focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)] disabled:opacity-60"
              />
              <Button type="submit" size="sm" disabled={!input.trim() || isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Send'}
              </Button>
            </form>
          </>
        )}

        {!isComplete && !hasQuestionSteps && (
          <div className="mt-3 border-t border-[var(--color-border)] pt-3">
            <Button type="button" size="sm" disabled={isSubmitting} onClick={() => void acknowledgeWelcome()}>
              {isSubmitting ? 'Saving…' : 'Got it'}
            </Button>
          </div>
        )}
      </div>
    </>
  )

  if (embedded) return chatBody

  return (
    <Panel title={config.title} subtitle={config.subtitle} fullWidth>
      {chatBody}
    </Panel>
  )
}
