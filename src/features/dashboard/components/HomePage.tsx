import { DailyBriefingPanel } from './panels/DailyBriefingPanel'
import { TasksPanel } from './panels/TasksPanel'
import { SoccerHubPanel } from './panels/SoccerHubPanel'
import { GoalsPanel } from './panels/GoalsPanel'
import { CalendarPanel } from './panels/CalendarPanel'
import { JournalPanel } from './panels/JournalPanel'
import { PerformanceAnalyticsPanel } from './panels/PerformanceAnalyticsPanel'
import { InsightsPanel } from './panels/InsightsPanel'

/**
 * Home dashboard — athlete command center.
 *
 * Design philosophy (FM-inspired, not FM-branded):
 *   • Information-dense panel grid
 *   • Hierarchical data widgets with clear section rails
 *   • Professional dark surfaces with depth and subtle motion
 *   • Right insights rail on xl+; collapses below on smaller screens
 */
export function HomePage() {
  return (
    <div className="mx-auto max-w-[1600px]">
      {/* Page header */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">
          Command Center
        </h2>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Your daily overview — training, tasks, goals, and insights
        </p>
      </div>

      {/* Two-column layout: main panels + insights rail */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        {/* Main panel grid */}
        <div className="dashboard-grid min-w-0 flex-1 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <DailyBriefingPanel />
          <TasksPanel />
          <SoccerHubPanel />
          <GoalsPanel />
          <CalendarPanel />
          <JournalPanel />
          <PerformanceAnalyticsPanel />
        </div>

        {/* Insights — right rail on xl+, stacked below on smaller screens */}
        <InsightsPanel />
      </div>
    </div>
  )
}
