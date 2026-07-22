import { ProgressOverviewPanel } from './dashboard/ProgressOverviewPanel'
import { CollegesListPanel } from './dashboard/CollegesListPanel'
import { UpcomingDeadlinesPanel } from './dashboard/UpcomingDeadlinesPanel'
import { EssaysProgressPanel } from './dashboard/EssaysProgressPanel'
import { RecommendationsPanel } from './dashboard/RecommendationsPanel'
import { TestScoresPanel } from './dashboard/TestScoresPanel'
import { FinancialAidPanel } from './dashboard/FinancialAidPanel'
import { DeadlineCalendarPanel } from './dashboard/DeadlineCalendarPanel'
import { ScholarshipTrackerPanel } from './dashboard/ScholarshipTrackerPanel'
import { CollegeAnalyticsPanel } from './dashboard/CollegeAnalyticsPanel'
import { AiRecommendationsPanel } from './dashboard/AiRecommendationsPanel'
import { AiAdvisorPanel } from './advisor/AiAdvisorPanel'
import { useCollege } from '../hooks/useCollege'
import { Button } from '@components/ui/Button'

export function CollegeDashboardPage() {
  const { loading, error, reload, isSeniorMode } = useCollege()

  if (loading) {
    return <p className="text-sm text-[var(--color-text-secondary)]">Loading college data…</p>
  }

  if (error) {
    return (
      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 text-center">
        <p className="text-sm text-[var(--color-danger)]">{error}</p>
        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
          Run migration 20260722100004_college_applications.sql if tables are missing.
        </p>
        <Button className="mt-4" variant="secondary" onClick={() => reload()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
      <div className="dashboard-grid min-w-0 flex-1 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProgressOverviewPanel />
        <CollegesListPanel />
        <UpcomingDeadlinesPanel />
        {isSeniorMode ? (
          <>
            <EssaysProgressPanel />
            <RecommendationsPanel />
          </>
        ) : (
          <>
            <TestScoresPanel />
            <RecommendationsPanel />
          </>
        )}
        <FinancialAidPanel />
        <DeadlineCalendarPanel />
        <ScholarshipTrackerPanel />
        {!isSeniorMode && <EssaysProgressPanel />}
        {isSeniorMode && <TestScoresPanel />}
        <CollegeAnalyticsPanel />
      </div>

      <aside className="flex shrink-0 flex-col gap-4 xl:sticky xl:top-4 xl:w-80">
        <AiRecommendationsPanel />
        <div id="college-advisor">
          <AiAdvisorPanel />
        </div>
      </aside>
    </div>
  )
}
