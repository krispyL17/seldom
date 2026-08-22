import { cn } from '@lib/utils'

interface ActivityHeatmapProps {
  /** 1 = active, 0 = inactive */
  data: number[]
  labels?: string[]
  className?: string
  activeColor?: string
}

/** Compact activity grid — journal consistency, habit tracking. */
export function ActivityHeatmap({
  data,
  labels,
  className,
  activeColor = 'var(--color-accent)',
}: ActivityHeatmapProps) {
  if (data.length === 0) return null

  const activeCount = data.filter((v) => v > 0).length

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-xs text-[var(--color-text-tertiary)]">
        {activeCount} of {data.length} days with entries
      </p>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${Math.min(data.length, 14)}, minmax(0, 1fr))` }}
        role="img"
        aria-label={`${activeCount} active days out of ${data.length}`}
      >
        {data.map((value, i) => (
          <div key={i} className="flex flex-col items-center gap-0.5">
            <div
              className={cn(
                'aspect-square w-full max-w-[1.25rem] rounded-[3px] border transition-colors',
                value > 0
                  ? 'border-transparent'
                  : 'border-[var(--color-border)] bg-[var(--color-surface-overlay)]',
              )}
              style={value > 0 ? { backgroundColor: activeColor, opacity: 0.85 } : undefined}
              title={labels?.[i] ?? `Day ${i + 1}`}
            />
            {labels && labels.length === data.length && data.length <= 14 && (
              <span className="hidden text-[9px] text-[var(--color-text-tertiary)] sm:block">
                {labels[i]?.slice(0, 1)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
