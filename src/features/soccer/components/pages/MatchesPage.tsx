import { EmptyState } from '@components/ui/EmptyState'
import { Panel } from '@components/ui/Panel'

export function MatchesPage() {
  return (
    <div className="space-y-4">
      <Panel title="Event Log" subtitle="Facts only — no subjective ratings" fullWidth>
        <EmptyState
          title="No events logged yet"
          description="Record date, context, duration, and notes. We skip subjective ratings — focus on what you can measure."
          className="py-12"
        />
      </Panel>
    </div>
  )
}
