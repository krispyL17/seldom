import { EmptyState } from '@components/ui/EmptyState'
import { Panel } from '@components/ui/Panel'

export function StrengthsPage() {
  return (
    <Panel title="Key Strengths" subtitle="What you do well" fullWidth>
      <EmptyState
        title="No strengths logged yet"
        description="Add strengths as you identify them, or ask Seldom OS for suggestions based on your training logs."
        className="py-12"
      />
    </Panel>
  )
}
