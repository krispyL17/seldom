import { cn } from '@lib/utils'

interface PanelSkeletonProps {
  lines?: number
  className?: string
}

export function PanelSkeleton({ lines = 3, className }: PanelSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)} aria-hidden>
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="h-10 animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)]"
          style={{ width: i === lines - 1 ? '70%' : '100%' }}
        />
      ))}
    </div>
  )
}

export function PageSkeleton({ panels = 4 }: { panels?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: panels }, (_, i) => (
        <div
          key={i}
          className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
        >
          <div className="mb-4 h-4 w-32 animate-pulse rounded bg-[var(--color-surface-overlay)]" />
          <PanelSkeleton lines={3} />
        </div>
      ))}
    </div>
  )
}
