import { cn } from '@lib/utils'

interface MetricCardProps {
  label: string
  value: string | number
  subValue?: string
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger'
  className?: string
}

const valueColors = {
  default: 'text-[var(--color-text-primary)]',
  accent: 'text-[var(--color-accent-muted)]',
  success: 'text-[var(--color-success)]',
  warning: 'text-[var(--color-warning)]',
  danger: 'text-[var(--color-danger)]',
}

export function MetricCard({
  label,
  value,
  subValue,
  variant = 'default',
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3',
        className,
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className={cn('mt-1 text-xl font-semibold tabular-nums', valueColors[variant])}>
        {value}
      </p>
      {subValue && (
        <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">{subValue}</p>
      )}
    </div>
  )
}
