import { DeadlineCalendarPanel } from '../dashboard/DeadlineCalendarPanel'
import { UpcomingDeadlinesPanel } from '../dashboard/UpcomingDeadlinesPanel'
import { TimelineContent } from './TimelinePage'
import { CollegePageGrid, CollegePageShell } from '../CollegePageShell'

export function CollegeDeadlinesPage() {
  return (
    <CollegePageShell>
      <CollegePageGrid columns={2} rows={2}>
        <UpcomingDeadlinesPanel />
        <DeadlineCalendarPanel />
        <div className="college-page-span-2 min-h-0 overflow-hidden">
          <TimelineContent compact title="Admission timeline" />
        </div>
      </CollegePageGrid>
    </CollegePageShell>
  )
}
