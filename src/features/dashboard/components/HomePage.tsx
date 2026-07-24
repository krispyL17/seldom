/**

 * Home dashboard — athlete command center (trimmed essentials).

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

    <main className="mx-auto max-w-[1600px] animate-fade-in">

      <div className="mb-5">

        <h1 className="text-lg font-semibold tracking-tight text-[var(--color-text-primary)]">

          Command Center

        </h1>

        <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">

          Tasks, goals, and your week at a glance — open other tabs from the sidebar as you need them

        </p>

      </div>



      <div className="dashboard-grid grid grid-cols-1 gap-4 lg:grid-cols-2">

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

          <div className="lg:col-span-2">

            <CalendarPanel />

          </div>

        </ErrorBoundary>

        <ErrorBoundary title="Activity summary failed">

          <div className="lg:col-span-2">

            <PerformanceAnalyticsPanel />

          </div>

        </ErrorBoundary>

      </div>

    </main>

  )

}

