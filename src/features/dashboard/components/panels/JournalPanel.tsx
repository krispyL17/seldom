import { Link } from 'react-router-dom'
import { Badge } from '@components/ui/Badge'
import { EmptyState } from '@components/ui/EmptyState'
import { ErrorPanel } from '@components/ui/ErrorPanel'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { Panel, PanelActionLink } from '@components/ui/Panel'
import { MOOD_LABELS, type JournalMood } from '@features/journal/types'
import { useJournal } from '@features/journal/hooks/useJournal'

const moodVariant = (mood: JournalMood) => {
  if (mood === 'great' || mood === 'good') return 'success' as const
  if (mood === 'low' || mood === 'rough') return 'warning' as const
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
  const { entries, loading, error, reload } = useJournal()
  const recent = entries.slice(0, 4)

  if (error) {
    return <ErrorPanel message={error} onRetry={() => void reload()} title="Journal" />
  }

  return (
    <Panel
      title="Journal"
      subtitle="Recent entries"
      action={<PanelActionLink to="/journal?new=1">New entry</PanelActionLink>}
    >
      {loading ? (
        <PanelSkeleton lines={4} />
      ) : recent.length === 0 ? (
        <EmptyState
          title="No journal entries yet"
          description="Reflect on your day to build consistency."
          action={
            <Link
              to="/journal?new=1"
              className="text-xs font-medium text-[var(--color-accent-muted)] hover:underline"
            >
              Write an entry
            </Link>
          }
        />
      ) : (
        <ul className="space-y-3">
          {recent.map((entry) => (
            <li
              key={entry.id}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3 transition-colors hover:border-[var(--color-border-strong)]"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[10px] text-[var(--color-text-tertiary)]">
                  {new Date(`${entry.entry_date}T12:00:00`).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
                <Badge variant={moodVariant(entry.mood)}>{MOOD_LABELS[entry.mood]}</Badge>
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-[var(--color-text-secondary)]">
                {entry.reflection ?? entry.wins ?? entry.tomorrows_focus ?? 'No reflection text'}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-[var(--color-text-tertiary)]">Energy</span>
                <EnergyDots level={entry.energy_level} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}
