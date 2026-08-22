/**
 * Dashboard — week-at-a-glance overview (calendar-centric).
 */
import { ErrorBoundary } from '@components/ui/ErrorBoundary'
import { OverviewCollegePromptBanner } from './OverviewCollegePromptBanner'
import { HomeTopRowPanel } from './panels/HomeTopRowPanel'
import { HomeWeekCalendarPanel } from './panels/HomeWeekCalendarPanel'
import { OverviewInsightPanel } from './panels/OverviewInsightPanel'
import { HomePerformancePreviewPanel } from './panels/HomePerformancePreviewPanel'

export function HomePage() {
  return (
    <div className="home-overview mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col overflow-hidden">
      <OverviewCollegePromptBanner />
      <div className="home-overview-grid min-h-0 flex-1">
        <ErrorBoundary title="Couldn't load tasks and goals">
          <HomeTopRowPanel />
        </ErrorBoundary>
        <ErrorBoundary title="Couldn't load your week">
          <HomeWeekCalendarPanel />
        </ErrorBoundary>
        <div className="home-overview-row-bottom grid min-h-0 grid-cols-1 gap-2.5 lg:grid-cols-2">
          <ErrorBoundary title="Couldn't load insight">
            <OverviewInsightPanel />
          </ErrorBoundary>
          <ErrorBoundary title="Couldn't load performance">
            <HomePerformancePreviewPanel />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
