/**
 * Dashboard — natural panel sizes; page does not scroll; long panels scroll inside.
 */
import { ErrorBoundary } from '@components/ui/ErrorBoundary'
import { DailyBriefingPanel } from './panels/DailyBriefingPanel'
import { TasksPanel } from './panels/TasksPanel'
import { SoccerHubPanel } from './panels/SoccerHubPanel'
import { GoalsPanel } from './panels/GoalsPanel'
import { CalendarPanel } from './panels/CalendarPanel'
import { PerformanceAnalyticsPanel } from './panels/PerformanceAnalyticsPanel'

export function HomePage() {
  return (
    <div className="home-dashboard mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col animate-fade-in">
      <div className="home-dashboard-grid dashboard-grid min-h-0 flex-1">
        <ErrorBoundary title="Daily briefing failed">
          <DailyBriefingPanel />
        </ErrorBoundary>
        <ErrorBoundary title="Tasks panel failed">
          <TasksPanel />
        </ErrorBoundary>
        <ErrorBoundary title="Goals panel failed">
          <GoalsPanel />
        </ErrorBoundary>
        <ErrorBoundary title="Performance panel failed">
          <SoccerHubPanel />
        </ErrorBoundary>
        <ErrorBoundary title="Calendar panel failed">
          <CalendarPanel />
        </ErrorBoundary>
        <ErrorBoundary title="Activity summary failed">
          <PerformanceAnalyticsPanel />
        </ErrorBoundary>
      </div>
    </div>
  )
}
