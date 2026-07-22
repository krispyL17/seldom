import { cn } from '@lib/utils'

interface MiniBarChartProps {
  data: number[]
  labels?: string[]
  height?: number
  color?: string
  className?: string
}

/**
 * Lightweight inline bar chart — no external chart library.
 * Used for performance analytics sparkline-style visuals.
 */
export function MiniBarChart({
  data,
  labels,
  height = 48,
  color = 'var(--color-accent)',
  className,
}: MiniBarChartProps) {
  const max = Math.max(...data, 1)

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className="flex items-end gap-1"
        style={{ height }}
        role="img"
        aria-label="Bar chart"
      >
        {data.map((value, i) => (
          <div
            key={i}
            className="flex flex-1 items-end rounded-sm bg-[var(--color-surface-elevated)] transition-all duration-300 hover:opacity-80"
            style={{ height: '100%' }}
          >
            <div
              className="w-full rounded-sm transition-all duration-500"
              style={{
                height: `${(value / max) * 100}%`,
                backgroundColor: color,
                opacity: 0.85,
              }}
            />
          </div>
        ))}
      </div>
      {labels && (
        <div className="flex gap-1">
          {labels.map((label, i) => (
            <span
              key={`${label}-${i}`}
              className="flex-1 text-center text-[9px] text-[var(--color-text-tertiary)]"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

interface MetricTileProps {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

/** Compact stat tile for analytics grid */
export function MetricTile({ label, value, unit, trend, className }: MetricTileProps) {
  const trendColor =
    trend === 'up'
      ? 'text-[var(--color-success)]'
      : trend === 'down'
        ? 'text-[var(--color-danger)]'
        : 'text-[var(--color-text-tertiary)]'

  return (
    <div
      className={cn(
        'rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3',
        className,
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--color-text-primary)]">
        {value}
        {unit && (
          <span className="ml-0.5 text-xs font-normal text-[var(--color-text-secondary)]">
            {unit}
          </span>
        )}
      </p>
      {trend && (
        <span className={cn('text-[10px]', trendColor)}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
        </span>
      )}
    </div>
  )
}
