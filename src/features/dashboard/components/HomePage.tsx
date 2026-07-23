/**
 * Home dashboard — athlete command center.
 */
import { ErrorBoundary } from '@components/ui/ErrorBoundary'
import { DailyBriefingPanel } from './panels/DailyBriefingPanel'
import { TasksPanel } from './panels/TasksPanel'
import { SoccerHubPanel } from './panels/SoccerHubPanel'
import { GoalsPanel } from './panels/GoalsPanel'
import { CalendarPanel } from './panels/CalendarPanel'
import { JournalPanel } from './panels/JournalPanel'
import { PerformanceAnalyticsPanel } from './panels/PerformanceAnalyticsPanel'
import { InsightsPanel } from './panels/InsightsPanel'

export function HomePage() {
  return (
    <main className="mx-auto max-w-[1600px] animate-fade-in">
      <div className="mb-5">
        <h1 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
          Command Center
        </h1>
        <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
          Your personal control center — tasks, goals, and schedule at a glance
        </p>
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="dashboard-grid min-w-0 flex-1 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ErrorBoundary title="Daily briefing failed">
            <DailyBriefingPanel />
          </ErrorBoundary>
          <ErrorBoundary title="Tasks panel failed">
            <TasksPanel />
          </ErrorBoundary>
          <ErrorBoundary title="Soccer panel failed">
            <SoccerHubPanel />
          </ErrorBoundary>
          <ErrorBoundary title="Goals panel failed">
            <GoalsPanel />
          </ErrorBoundary>
          <ErrorBoundary title="Calendar panel failed">
            <CalendarPanel />
          </ErrorBoundary>
          <ErrorBoundary title="Journal panel failed">
            <JournalPanel />
          </ErrorBoundary>
          <ErrorBoundary title="Analytics panel failed">
            <PerformanceAnalyticsPanel />
          </ErrorBoundary>
        </div>

        <ErrorBoundary title="Insights panel failed">
          <InsightsPanel />
        </ErrorBoundary>
      </div>
    </main>
  )
}
