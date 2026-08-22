import { Badge } from '@components/ui/Badge'
import { Button } from '@components/ui/Button'
import { ProgressBar } from '@components/ui/ProgressBar'
import type { JournalEntry } from '../types'
import { ENERGY_LABELS } from '../types'
import {
  energyVariant,
  formatEntryDate,
  moodBadgeVariant,
  moodLabel,
} from '../utils'

interface JournalEntryCardProps {
  entry: JournalEntry
  onEdit: (entry: JournalEntry) => void
  onDelete: (id: string) => void
}

function Section({ label, content }: { label: string; content: string | null }) {
  if (!content?.trim()) return null
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-secondary)] whitespace-pre-wrap">
        {content}
      </p>
    </div>
  )
}

export function JournalEntryCard({ entry, onEdit, onDelete }: JournalEntryCardProps) {
  const energyPct = (entry.energy_level / 5) * 100

  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-5 shadow-[var(--shadow-panel)] transition-colors hover:border-[var(--color-border-strong)]">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <time
            dateTime={entry.entry_date}
            className="text-base font-semibold text-[var(--color-text-primary)]"
          >
            {formatEntryDate(entry.entry_date)}
          </time>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={moodBadgeVariant(entry.mood)}>{moodLabel(entry.mood)}</Badge>
            <span className="text-xs text-[var(--color-text-tertiary)]">
              Energy: {ENERGY_LABELS[entry.energy_level]}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(entry)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(entry.id)}>
            Delete
          </Button>
        </div>
      </header>

      <div className="mt-4 max-w-xs">
        <ProgressBar
          value={energyPct}
          label="Energy"
          variant={energyVariant(entry.energy_level)}
          size="sm"
        />
      </div>

      <div className="mt-4 space-y-4 border-t border-[var(--color-border)] pt-4">
        <Section label="Reflection" content={entry.reflection} />
        <Section label="Wins" content={entry.wins} />
        <Section label="Challenges" content={entry.challenges} />
        <Section label="Tomorrow's focus" content={entry.tomorrows_focus} />
      </div>
    </article>
  )
}
