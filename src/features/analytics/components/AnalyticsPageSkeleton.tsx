import { Panel } from '@components/ui/Panel'

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] ${className ?? ''}`}
    />
  )
}

export function AnalyticsPageSkeleton() {
  return (
    <div className="mx-auto max-w-[1600px] animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonBar className="h-5 w-32" />
          <SkeletonBar className="h-3 w-64" />
        </div>
        <SkeletonBar className="h-6 w-28" />
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <SkeletonBar key={i} className="h-16" />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Panel key={i} title="Loading" subtitle="…">
            <SkeletonBar className="h-[72px] w-full" />
          </Panel>
        ))}
      </div>
    </div>
  )
}
