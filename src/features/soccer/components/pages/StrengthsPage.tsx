import { Badge } from '@components/ui/Badge'
import { Panel } from '@components/ui/Panel'
import { strengths } from '../../data/mockData'

export function StrengthsPage() {
  return (
    <Panel title="Key Strengths" subtitle="Performance advantages" fullWidth>
      <ul className="space-y-3">
        {strengths.map((item) => (
          <li
            key={item.id}
            className="rounded-[var(--radius-md)] border border-[var(--color-success)]/20 bg-[var(--color-success)]/5 p-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="success">Strength</Badge>
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
