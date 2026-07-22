import { cn } from '@lib/utils'

type ProgressVariant = 'default' | 'success' | 'warning' | 'danger' | 'accent'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  showValue?: boolean
  variant?: ProgressVariant
  size?: 'sm' | 'md'
  className?: string
}

const fillVariants: Record<ProgressVariant, string> = {
  default: 'bg-[var(--color-text-secondary)]',
  success: 'bg-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger)]',
  accent: 'bg-[var(--color-accent)]',
}

/**
 * Horizontal progress indicator — FM-style attribute bars for tasks and goals.
 */
export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  variant = 'accent',
  size = 'sm',
  className,
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100
  const pct = Math.min(100, Math.max(0, Math.round((value / safeMax) * 100)))

  return (
    <div className={cn('space-y-1', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-2 text-xs">
          {label && (
            <span className="truncate text-[var(--color-text-secondary)]">{label}</span>
          )}
          {showValue && (
            <span className="shrink-0 tabular-nums text-[var(--color-text-tertiary)]">
              {pct}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'overflow-hidden rounded-full bg-[var(--color-surface-elevated)]',
          size === 'sm' ? 'h-1.5' : 'h-2.5',
        )}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', fillVariants[variant])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
