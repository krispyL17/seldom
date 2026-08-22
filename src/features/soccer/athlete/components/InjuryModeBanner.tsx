import { Link } from 'react-router-dom'
import { Button } from '@components/ui/Button'
import { useAthleteDevelopment } from '../../hooks/useAthleteDevelopment'

interface InjuryModeBannerProps {
  compact?: boolean
}

export function InjuryModeBanner({ compact }: InjuryModeBannerProps) {
  const { development, setInjuryMode } = useAthleteDevelopment()
  const { injuryMode, streak } = development

  if (!injuryMode.active) return null

  return (
    <div
      className={
        compact
          ? 'rounded-[var(--radius-sm)] border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 px-2 py-1.5 text-xs text-[var(--color-danger)]'
          : 'rounded-[var(--radius-md)] border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 p-3'
      }
      role="alert"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[var(--color-danger)]">Injury Mode active</p>
          {!compact && (
            <>
              <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                Your {streak.frozenAtStreak ?? streak.current}-day streak is frozen. Progression views are
                locked — focus on recovery instead.
                {injuryMode.reason ? ` Reason: ${injuryMode.reason}` : ''}
              </p>
              {injuryMode.aiSuggested && (
                <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                  Suggested by Seldom AI based on your message.
                </p>
              )}
            </>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {!compact && (
            <Link
              to="/soccer/recovery"
              className="inline-flex h-7 items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 text-xs text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)]"
            >
              Recovery
            </Link>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() => void setInjuryMode(false)}
          >
            End Injury Mode
          </Button>
        </div>
      </div>
    </div>
  )
}

export function InjuryModeOverlay() {
  const { development } = useAthleteDevelopment()
  if (!development.injuryMode.active) return null

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[90] bg-[var(--color-danger)]/[0.03] ring-1 ring-inset ring-[var(--color-danger)]/20"
      aria-hidden
    />
  )
}

interface InjuryModeLockProps {
  children: import('react').ReactNode
}

export function InjuryModeLock({ children }: InjuryModeLockProps) {
  const { development } = useAthleteDevelopment()
  if (!development.injuryMode.active) return <>{children}</>

  return (
    <div className="relative">
      <div className="pointer-events-none select-none opacity-40 blur-[1px]">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-base)]/60 p-4">
        <div className="max-w-xs text-center">
          <p className="text-sm font-medium text-[var(--color-danger)]">Progression locked</p>
          <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
            Injury Mode is on. Visit Recovery for workload guidance.
          </p>
          <Link
            to="/soccer/recovery"
            className="mt-2 inline-block text-xs text-[var(--color-accent-muted)] hover:underline"
          >
            Open Recovery →
          </Link>
        </div>
      </div>
    </div>
  )
}
