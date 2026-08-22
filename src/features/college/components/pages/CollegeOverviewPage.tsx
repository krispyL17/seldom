import { ProgressOverviewPanel } from '../dashboard/ProgressOverviewPanel'
import { UpcomingDeadlinesPanel } from '../dashboard/UpcomingDeadlinesPanel'
import { AiRecommendationsPanel } from '../dashboard/AiRecommendationsPanel'
import { CollegeFocusPanel } from '../dashboard/CollegeFocusPanel'
import { CollegePageGrid, CollegePageShell } from '../CollegePageShell'

export function CollegeOverviewPage() {
  return (
    <CollegePageShell>
      <CollegePageGrid columns={2} rows={2}>
        <ProgressOverviewPanel />
        <UpcomingDeadlinesPanel />
        <AiRecommendationsPanel />
        <CollegeFocusPanel />
      </CollegePageGrid>
    </CollegePageShell>
  )
}
