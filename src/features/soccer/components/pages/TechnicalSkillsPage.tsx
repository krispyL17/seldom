import { EmptyState } from '@components/ui/EmptyState'
import { Panel } from '@components/ui/Panel'

export function TechnicalSkillsPage() {
  return (
    <div className="space-y-4">
      <Panel title="Skills Profile" subtitle="Self-rated attributes — starts at zero" fullWidth>
        <EmptyState
          title="No skill ratings yet"
          description="Rate your attributes when you're ready, or let session logs build the picture over time."
          className="py-12"
        />
      </Panel>
    </div>
  )
}
