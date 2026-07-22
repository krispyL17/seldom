import { Badge } from '@components/ui/Badge'
import { Panel, DataRow } from '@components/ui/Panel'
import { matches } from '../../data/mockData'
import { formatFullDate, resultLabel, resultVariant } from '../../utils'

export function MatchesPage() {
  const totals = matches.reduce(
    (acc, m) => ({
      goals: acc.goals + m.goals,
      assists: acc.assists + m.assists,
      minutes: acc.minutes + m.minutes,
    }),
    { goals: 0, assists: 0, minutes: 0 },
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Goals</p>
          <p className="text-2xl font-semibold tabular-nums text-[var(--color-text-primary)]">{totals.goals}</p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Assists</p>
          <p className="text-2xl font-semibold tabular-nums text-[var(--color-text-primary)]">{totals.assists}</p>
        </div>
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3 text-center">
          <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-tertiary)]">Minutes</p>
          <p className="text-2xl font-semibold tabular-nums text-[var(--color-text-primary)]">{totals.minutes}</p>
        </div>
      </div>

      <Panel title="Match Log" subtitle={`${matches.length} appearances`} fullWidth>
        <ul className="space-y-3">
          {matches.map((match) => (
            <li
              key={match.id}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant={resultVariant(match.result)}>{resultLabel(match.result)}</Badge>
                    <span className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
                      {match.score}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-text-primary)]">vs {match.opponent}</p>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    {formatFullDate(match.date)} · {match.competition}
                  </p>
                </div>
                <Badge variant={match.rating >= 7.5 ? 'success' : match.rating >= 7 ? 'accent' : 'warning'}>
                  {match.rating} rating
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-[var(--color-border)] pt-3">
                <DataRow label="Minutes" value={match.minutes} />
                <DataRow label="Goals" value={match.goals} />
                <DataRow label="Assists" value={match.assists} />
              </div>
              <p className="mt-2 text-xs text-[var(--color-text-secondary)]">{match.highlights}</p>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
