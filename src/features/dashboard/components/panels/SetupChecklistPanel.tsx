import { Link, useNavigate } from 'react-router-dom'
import { IconCheck } from '@components/ui/icons'
import { Panel } from '@components/ui/Panel'
import { ProgressBar } from '@components/ui/ProgressBar'
import {
  SETUP_CHECKLIST_TAB_KEY,
  type SetupStep,
} from '@features/onboarding/setupChecklist'
import { queueTabIntro } from '@features/onboarding/tabIntroQueue'
import { useSetupProgress } from '@features/onboarding/useSetupProgress'
import { useUserPreferences } from '@features/preferences'
import { cn } from '@lib/utils'

function StepAction({
  step,
  onWelcome,
}: {
  step: SetupStep
  onWelcome: () => void
}) {
  const navigate = useNavigate()

  if (step.done) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-[var(--color-success)]">
        <IconCheck className="h-3.5 w-3.5" aria-hidden />
        Done
      </span>
    )
  }

  function go() {
    if (step.action === 'welcome') {
      onWelcome()
      return
    }
    if (step.tabIntroId) queueTabIntro(step.tabIntroId)
    if (step.href) navigate(step.href)
  }

  return (
    <button
      type="button"
      onClick={go}
      className="text-xs font-medium text-[var(--color-accent-muted)] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
    >
      {step.action === 'welcome' ? 'Start' : 'Go'}
    </button>
  )
}

export function SetupChecklistPanel() {
  const { steps, showChecklist, progress } = useSetupProgress()
  const { openTutorial, markTabIntroComplete } = useUserPreferences()

  if (!showChecklist) return null

  const remaining = steps.filter((step) => !step.done).length

  return (
    <Panel
      title="Get started"
      accentNavId="home"
      subtitle={`${remaining} step${remaining === 1 ? '' : 's'} left — about 3 minutes`}
      className="panel--compact lg:col-span-3"
    >
      <ProgressBar value={progress} size="sm" variant="accent" className="mb-3" />
      <ol className="space-y-2">
        {steps.map((step, index) => (
          <li
            key={step.id}
            className={cn(
              'flex items-start justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2.5',
              step.done && 'border-[var(--color-success)]/20 bg-[var(--color-success)]/5',
            )}
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--color-text-primary)]">
                <span className="mr-2 tabular-nums text-[var(--color-text-tertiary)]">{index + 1}.</span>
                {step.label}
                {step.optional && (
                  <span className="ml-1.5 font-normal text-[var(--color-text-tertiary)]">(optional)</span>
                )}
              </p>
              <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">{step.hint}</p>
            </div>
            <div className="shrink-0 pt-0.5">
              <StepAction step={step} onWelcome={openTutorial} />
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-border)] pt-3">
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Tab tours appear when you choose a step — not on every visit.
        </p>
        <button
          type="button"
          onClick={() => void markTabIntroComplete(SETUP_CHECKLIST_TAB_KEY, 1)}
          className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)] hover:underline"
        >
          Hide checklist
        </button>
      </div>
      <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
        Finish anytime from{' '}
        <Link to="/settings" className="text-[var(--color-accent-muted)] hover:underline">
          Settings → Welcome tour
        </Link>
        .
      </p>
    </Panel>
  )
}
