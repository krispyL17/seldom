import { Badge } from '@components/ui/Badge'
import { Panel } from '@components/ui/Panel'
import { weaknesses } from '../../data/mockData'

const priorityVariant = {
  high: 'danger',
  medium: 'warning',
  low: 'muted',
} as const

export function WeaknessesPage() {
  return (
    <Panel title="Development Areas" subtitle="Priority weaknesses" fullWidth>
      <ul className="space-y-3">
        {weaknesses.map((item) => (
          <li
            key={item.id}
            className="rounded-[var(--radius-md)] border border-[var(--color-danger)]/20 bg-[var(--color-danger)]/5 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              {item.priority && (
                <Badge variant={priorityVariant[item.priority]}>{item.priority} priority</Badge>
              )}
              <Badge variant="muted">{item.category}</Badge>
            </div>
            <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">{item.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              {item.description}
            </p>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
