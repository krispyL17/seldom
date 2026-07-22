import { Panel, PanelActionLink } from '@components/ui/Panel'
import { calendarEvents } from '../../data/mockData'
import { cn } from '@lib/utils'
import type { CalendarEventType } from '@/types'

const typeColors: Record<CalendarEventType, string> = {
  training: 'border-l-[var(--color-accent)]',
  recovery: 'border-l-[var(--color-success)]',
  tactical: 'border-l-[var(--color-warning)]',
  match: 'border-l-[var(--color-danger)]',
}

function getTodayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function CalendarPanel() {
  const todayIso = getTodayIsoDate()

  return (
    <Panel
      title="Calendar"
      subtitle="This week"
      action={<PanelActionLink>Full calendar</PanelActionLink>}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {calendarEvents.map((event) => {
          const isToday = event.isoDate === todayIso
          return (
            <div
              key={event.id}
              className={cn(
                'rounded-[var(--radius-sm)] border border-[var(--color-border)] border-l-[3px] p-2 transition-colors',
                typeColors[event.type],
                isToday && 'bg-[var(--color-accent)]/10 ring-1 ring-[var(--color-accent)]/30',
              )}
            >
              <p className="text-[10px] font-medium text-[var(--color-text-tertiary)]">
                {event.day} {event.date}
              </p>
              <p className="mt-0.5 truncate text-[11px] font-medium text-[var(--color-text-primary)]">
                {event.title}
              </p>
              <p className="text-[10px] text-[var(--color-text-tertiary)]">{event.time}</p>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
