import { EmptyState } from '@components/ui/EmptyState'
import { Panel } from '@components/ui/Panel'

export function PhysicalMetricsPage() {
  return (
    <div className="space-y-4">
      <Panel title="Physical Profile" subtitle="Your benchmarks — relative to your goals" fullWidth>
        <EmptyState
          title="No physical metrics yet"
          description="Set baselines when you have numbers, or leave everything at zero and log as you go. All progress is measured against your own goals — nothing is pre-filled."
          className="py-12"
        />
      </Panel>
    </div>
  )
}
