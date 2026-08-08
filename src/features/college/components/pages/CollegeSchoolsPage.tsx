import { CollegesListPanel } from '../dashboard/CollegesListPanel'
import { CollegeAnalyticsPanel } from '../dashboard/CollegeAnalyticsPanel'
import { CollegePageGrid, CollegePageShell } from '../CollegePageShell'

export function CollegeSchoolsPage() {
  return (
    <CollegePageShell>
      <CollegePageGrid columns={2} rows={1}>
        <CollegesListPanel />
        <CollegeAnalyticsPanel />
      </CollegePageGrid>
    </CollegePageShell>
  )
}
