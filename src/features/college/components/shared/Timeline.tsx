import { Badge } from '@components/ui/Badge'
import { cn } from '@lib/utils'
import { daysUntil, formatShortDate, deadlineUrgencyVariant } from '../../utils'

export interface TimelineItem {
  id: string
  label: string
  date: string
  subLabel?: string
  type?: string
}

interface TimelineProps {
  items: TimelineItem[]
  className?: string
}

export function Timeline({ items, className }: TimelineProps) {
  const sorted = [...items].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <ol className={cn('relative space-y-0', className)}>
      {sorted.map((item, index) => {
        const days = daysUntil(item.date)
        const isLast = index === sorted.length - 1

        return (
          <li key={item.id} className="relative flex gap-3 pb-4">
            {!isLast && (
              <span
                className="absolute left-[5px] top-3 h-full w-px bg-[var(--color-border)]"
                aria-hidden
              />
            )}
            <span
              className={cn(
                'relative z-10 mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2',
                days <= 7
                  ? 'border-[var(--color-danger)] bg-[var(--color-danger)]/30'
                  : days <= 30
                    ? 'border-[var(--color-warning)] bg-[var(--color-warning)]/30'
                    : 'border-[var(--color-accent)] bg-[var(--color-accent)]/30',
              )}
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-medium text-[var(--color-text-primary)]">{item.label}</p>
                <Badge variant={deadlineUrgencyVariant(days)}>
                  {days === 0 ? 'Today' : days < 0 ? 'Past due' : `${days}d`}
                </Badge>
              </div>
              {item.subLabel && (
                <p className="mt-0.5 text-[10px] text-[var(--color-text-tertiary)]">
                  {item.subLabel}
                </p>
              )}
              <p className="mt-0.5 text-[10px] tabular-nums text-[var(--color-text-secondary)]">
                {formatShortDate(item.date)}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
