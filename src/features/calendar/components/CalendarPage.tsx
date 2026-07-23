import { useMemo, useState } from 'react'
import { useGoals } from '@features/goals/hooks/useGoals'
import { useTasks } from '@features/tasks/hooks/useTasks'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { cn } from '@lib/utils'
import { CalendarSyncBanner } from './CalendarSyncBanner'
import { CalendarWeekView } from './CalendarWeekView'
import { CalendarMonthView } from './CalendarMonthView'
import { CalendarOverviewList } from './CalendarOverviewList'
import { buildCalendarEvents } from '../utils/calendarEvents'

type CalendarView = 'week' | 'month' | 'overview'

const VIEW_TABS: { id: CalendarView; label: string }[] = [
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'overview', label: 'Overview' },
]

export function CalendarPage() {
  const { tasks, loading: tasksLoading } = useTasks()
  const { goals, loading: goalsLoading } = useGoals()
  const [view, setView] = useState<CalendarView>('week')
  const [anchor] = useState(() => new Date())

  const events = useMemo(() => buildCalendarEvents(tasks, goals), [tasks, goals])
  const loading = tasksLoading || goalsLoading

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 animate-fade-in">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Calendar
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Tasks and goals with dates — week, month, or full list
        </p>
      </header>

      <CalendarSyncBanner events={events} />

      <div className="flex gap-1 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-1">
        {VIEW_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setView(tab.id)}
            className={cn(
              'flex-1 rounded-[var(--radius-sm)] px-3 py-2 text-xs font-medium transition-colors',
              view === tab.id
                ? 'bg-[var(--color-surface-raised)] text-[var(--color-text-primary)] shadow-sm'
                : 'text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <PanelSkeleton lines={6} />
      ) : (
        <>
          {view === 'week' && <CalendarWeekView anchor={anchor} events={events} />}
          {view === 'month' && <CalendarMonthView anchor={anchor} events={events} />}
          {view === 'overview' && <CalendarOverviewList events={events} />}
        </>
      )}
    </div>
  )
}
