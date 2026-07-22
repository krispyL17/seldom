import { Badge } from '@components/ui/Badge'
import { Panel, PanelActionLink } from '@components/ui/Panel'
import { journalEntries } from '../../data/mockData'

const moodVariant = (mood: string) => {
  if (mood === 'Focused' || mood === 'Calm') return 'success' as const
  if (mood === 'Tired') return 'warning' as const
  return 'muted' as const
}

function EnergyDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Energy level ${level} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 w-3 rounded-full ${
            i < level ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-surface-elevated)]'
          }`}
        />
      ))}
    </div>
  )
}

export function JournalPanel() {
  return (
    <Panel
      title="Journal"
      subtitle="Recent entries"
      action={<PanelActionLink>New entry</PanelActionLink>}
    >
      <ul className="space-y-3">
        {journalEntries.map((entry) => (
          <li
            key={entry.id}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3 transition-colors hover:border-[var(--color-border-strong)]"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[10px] text-[var(--color-text-tertiary)]">{entry.date}</span>
              <Badge variant={moodVariant(entry.mood)}>{entry.mood}</Badge>
            </div>
            <p className="line-clamp-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
              {entry.preview}
            </p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-[10px] text-[var(--color-text-tertiary)]">Energy</span>
              <EnergyDots level={entry.energy} />
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
