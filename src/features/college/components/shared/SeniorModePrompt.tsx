import { Button } from '@components/ui/Button'
import { Badge } from '@components/ui/Badge'
import { useCollege } from '../../hooks/useCollege'
import { cn } from '@lib/utils'

interface SeniorModePromptProps {
  variant?: 'banner' | 'card' | 'inline'
  className?: string
}

export function SeniorModePrompt({ variant = 'banner', className }: SeniorModePromptProps) {
  const { isSeniorMode, enterSeniorMode, enterJuniorMode } = useCollege()

  if (variant === 'inline') {
    if (isSeniorMode) {
      return (
        <button
          type="button"
          onClick={() => {
            if (confirm('Switch back to junior prep mode? Your application data is kept.')) {
              enterJuniorMode()
            }
          }}
          className={cn('text-[11px] text-[var(--color-text-tertiary)] hover:underline', className)}
        >
          ← Back to junior prep
        </button>
      )
    }
    return (
      <Button size="sm" onClick={() => enterSeniorMode()} className={className}>
        I'm a senior now
      </Button>
    )
  }

  if (isSeniorMode) {
    return (
      <div
        className={cn(
          'flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-success)]/30 bg-[var(--color-success)]/10 px-4 py-3',
          className,
        )}
      >
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="success">Senior mode</Badge>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              Application season is active
            </p>
          </div>
          <p className="mt-0.5 text-xs text-[var(--color-text-secondary)]">
            Full checklists, deadlines, essays & submission tracking are unlocked.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => enterJuniorMode()}>
          Junior prep view
        </Button>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <button
        type="button"
        onClick={() => enterSeniorMode()}
        className={cn(
          'w-full rounded-[var(--radius-md)] border border-dashed border-[var(--color-accent)]/40 bg-[var(--color-accent)]/5 p-4 text-left transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10',
          className,
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden>
            🎓
          </span>
          <p className="text-sm font-semibold text-[var(--color-text-primary)]">I'm a senior now</p>
        </div>
        <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
          Unlock application deadlines, submission checklists, supplemental essays, and full Common
          App tracking.
        </p>
      </button>
    )
  }

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-4 py-3',
        className,
      )}
    >
      <div>
        <p className="text-sm font-medium text-[var(--color-text-primary)]">
          Rising junior prep mode
        </p>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Research, list-building & testing — application tools unlock when senior year starts.
        </p>
      </div>
      <Button size="sm" onClick={() => enterSeniorMode()}>
        I'm a senior now
      </Button>
    </div>
  )
}
