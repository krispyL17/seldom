import { Panel } from '@components/ui/Panel'
import { Timeline, type TimelineItem } from '../shared/Timeline'
import type { College } from '../../types'

interface DeadlinesSectionProps {
  college: College
}

export function DeadlinesSection({ college }: DeadlinesSectionProps) {
  const items: TimelineItem[] = college.deadlines.map((d) => ({
    id: d.id,
    label: d.label,
    date: d.date,
    subLabel: d.type.replace('_', ' '),
  }))

  return (
    <Panel title="Deadlines" subtitle="Important dates timeline">
      {items.length > 0 ? (
        <Timeline items={items} />
      ) : (
        <p className="text-xs text-[var(--color-text-tertiary)]">No deadlines recorded.</p>
      )}
    </Panel>
  )
}
