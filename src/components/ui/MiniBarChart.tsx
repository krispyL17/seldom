import { cn } from '@lib/utils'
import { Sparkline } from './Sparkline'

interface MiniBarChartProps {
  data: number[]
  labels?: string[]
  height?: number
  color?: string
  className?: string
  /** Show only the most recent N bars (keeps charts readable). */
  maxBars?: number
  /** Optional formatter for values in labels and axis (e.g. minutes → hours). */
  formatValue?: (value: number) => string
  /** Y-axis tick labels (default on when height ≥ 40px). */
  showAxis?: boolean
  /** Value label above each non-zero bar. */
  showValues?: boolean
}

function buildAxisTicks(max: number): number[] {
  if (max <= 0) return [0]
  if (max <= 4) return [max, 0]
  const mid = Math.round(max / 2)
  return [...new Set([max, mid, 0])]
}

/**
 * Lightweight inline bar chart with optional y-axis ticks and bar value labels.
 * Returns null when there is no non-zero data — parent should show an empty state.
 */
export function MiniBarChart({
  data,
  labels,
  height = 48,
  color = 'var(--color-accent)',
  className,
  maxBars = 10,
  formatValue,
  showAxis,
  showValues = true,
}: MiniBarChartProps) {
  const start = Math.max(0, data.length - maxBars)
  const chartData = data.slice(start)
  const chartLabels = labels?.slice(start)

  if (chartData.length === 0 || chartData.every((value) => value <= 0)) {
    return null
  }

  const max = Math.max(...chartData)
  const format = formatValue ?? ((value: number) => String(value))
  const ticks = buildAxisTicks(max)
  const useAxis = showAxis ?? height >= 40
  const chartLabel =
    chartLabels && chartLabels.length === chartData.length
      ? chartLabels.map((label, i) => `${label}: ${format(chartData[i]!)}`).join(', ')
      : chartData.map(format).join(', ')

  return (
    <div className={cn('flex gap-1.5', className)}>
      {useAxis && (
        <div
          className="flex w-9 shrink-0 flex-col justify-between py-0.5 text-right text-xs tabular-nums leading-none text-[var(--color-text-tertiary)]"
          style={{ height }}
          aria-hidden
        >
          {ticks.map((tick) => (
            <span key={tick}>{format(tick)}</span>
          ))}
        </div>
      )}

      <div className="min-w-0 flex-1 space-y-1">
        <div
          className="flex items-end gap-0.5"
          style={{ height }}
          role="img"
          aria-label={`Bar chart showing ${chartLabel}`}
        >
          {chartData.map((value, i) => (
            <div
              key={i}
              className="flex min-w-0 flex-1 flex-col items-center justify-end"
              style={{ height: '100%' }}
            >
              {showValues && value > 0 && (
                <span
                  className="mb-0.5 max-w-full truncate px-0.5 text-xs font-medium tabular-nums text-[var(--color-text-secondary)]"
                  title={format(value)}
                >
                  {format(value)}
                </span>
              )}
              <div className="flex w-full flex-1 items-end">
                {value > 0 ? (
                  <div
                    className="w-full rounded-sm transition-all duration-500"
                    style={{
                      height: `${Math.max(8, (value / max) * 100)}%`,
                      backgroundColor: color,
                      opacity: 0.85,
                    }}
                  />
                ) : (
                  <div className="h-0 w-full" aria-hidden />
                )}
              </div>
            </div>
          ))}
        </div>

        {chartLabels && (
          <div className="flex gap-0.5">
            {chartLabels.map((label, i) => (
              <span
                key={`${label}-${i}`}
                className="min-w-0 flex-1 truncate text-center text-xs text-[var(--color-text-tertiary)]"
                title={label}
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

interface MetricTileProps {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  deltaLabel?: string
  sparkline?: number[]
  sparklineColor?: string
  size?: 'sm' | 'md'
  className?: string
}

/** Compact stat tile for analytics grid */
export function MetricTile({
  label,
  value,
  unit,
  trend,
  deltaLabel,
  sparkline,
  sparklineColor,
  size = 'md',
  className,
}: MetricTileProps) {
  const trendColor =
    trend === 'up'
      ? 'text-[var(--color-success)]'
      : trend === 'down'
        ? 'text-[var(--color-danger)]'
        : 'text-[var(--color-text-tertiary)]'

  return (
    <div
      className={cn(
        'rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)]',
        size === 'sm' ? 'p-1.5' : 'p-3',
        className,
      )}
    >
      <p
        className={cn(
          'font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]',
          size === 'sm' ? 'text-xs leading-tight' : 'text-xs',
        )}
      >
        {label}
      </p>
      <div className="flex items-end justify-between gap-1">
        <p
          className={cn(
            'font-semibold tabular-nums text-[var(--color-text-primary)]',
            size === 'sm' ? 'mt-0.5 text-sm leading-none' : 'mt-1 text-lg',
          )}
        >
          {value}
          {unit && (
            <span
              className={cn(
                'ml-0.5 font-normal text-[var(--color-text-secondary)]',
                size === 'sm' ? 'text-xs' : 'text-xs',
              )}
            >
              {unit}
            </span>
          )}
        </p>
        {sparkline && sparkline.length > 0 && (
          <Sparkline data={sparkline} color={sparklineColor} height={size === 'sm' ? 16 : 20} />
        )}
      </div>
      {(trend || deltaLabel) && (
        <p className={cn('mt-0.5 text-xs tabular-nums', trendColor)}>
          {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '—'}
          {deltaLabel ? ` ${deltaLabel}` : ''}
        </p>
      )}
    </div>
  )
}
