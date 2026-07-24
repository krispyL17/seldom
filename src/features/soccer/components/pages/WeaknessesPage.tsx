import { EmptyState } from '@components/ui/EmptyState'
import { Panel } from '@components/ui/Panel'

export function WeaknessesPage() {
  return (
    <Panel title="Development Areas" subtitle="What you're working on" fullWidth>
      <EmptyState
        title="No development areas yet"
        description="Track weaknesses and priorities you want to improve — add them yourself or ask Seldom OS once you have some logs."
        className="py-12"
      />
    </Panel>
  )
}
