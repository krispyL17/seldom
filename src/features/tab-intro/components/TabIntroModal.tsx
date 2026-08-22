import { createPortal } from 'react-dom'
import { IconSparkles } from '@components/ui/icons'
import { OnboardingChatPanel } from '@features/onboarding/OnboardingChatPanel'
import type { OnboardingConfig } from '@features/onboarding/types'
import { cn } from '@lib/utils'

interface TabIntroPanelProps {
  open: boolean
  config: OnboardingConfig
  onComplete: (answers: Record<string, unknown>) => Promise<void>
  onDismiss: () => void
}

/** Floating first-visit intro — fixed overlay, does not shift page layout. */
export function TabIntroPanel({ open, config, onComplete, onDismiss }: TabIntroPanelProps) {
  if (!open || typeof document === 'undefined') return null

  const hasQuestions = config.steps.length > 0

  return createPortal(
    <div
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex justify-center p-3 sm:inset-x-auto sm:right-4 sm:bottom-4 sm:justify-end sm:p-0"
      aria-live="polite"
    >
      <section
        role="dialog"
        aria-labelledby="tab-intro-title"
        aria-modal="false"
        className={cn(
          'pointer-events-auto w-full max-w-sm overflow-hidden',
          'rounded-[var(--radius-lg)] border border-[var(--color-border)]',
          'bg-[var(--color-surface-raised)] shadow-[var(--shadow-elevated)]',
          'animate-slide-up',
        )}
      >
        <header className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-3.5 py-2.5">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent-subtle)]">
              <IconSparkles width={12} height={12} className="text-[var(--color-accent-muted)]" />
            </div>
            <div className="min-w-0">
              <h2 id="tab-intro-title" className="truncate text-xs font-semibold text-[var(--color-text-primary)]">
                {config.title}
              </h2>
              <p className="truncate text-xs text-[var(--color-text-tertiary)]">{config.subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="shrink-0 rounded-[var(--radius-sm)] px-1.5 py-0.5 text-xs text-[var(--color-text-tertiary)] transition-colors hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-secondary)]"
          >
            Close
          </button>
        </header>

        <div className="px-3.5 py-2.5">
          <OnboardingChatPanel
            config={config}
            onComplete={onComplete}
            embedded
            compact
            showProgress={hasQuestions}
            progressLabel="Intro progress"
          />
        </div>
      </section>
    </div>,
    document.body,
  )
}

/** @deprecated Use TabIntroPanel */
export const TabIntroModal = TabIntroPanel
