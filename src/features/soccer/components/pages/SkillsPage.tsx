import { useMemo, useState } from 'react'
import { Panel } from '@components/ui/Panel'
import { ProgressBar } from '@components/ui/ProgressBar'
import { useTrainingSessions } from '../../training/hooks/useTrainingSessions'
import { useSoccerMatches } from '../../matches/hooks/useSoccerMatches'
import { useAthleteDevelopment } from '../../hooks/useAthleteDevelopment'
import { computeSkillsIntelligence } from '../../athlete/skillsIntelligence'
import { MAX_SKILLS } from '../../athlete/sportSkills'
import { SkillsEditor } from '../../athlete/components/SkillsEditor'
import { cn } from '@lib/utils'

function heatColor(percent: number | null, maxPercent: number): string {
  if (percent == null || maxPercent <= 0 || percent <= 0) {
    return 'var(--color-surface-overlay)'
  }
  const t = percent / maxPercent
  if (t >= 0.75) return 'color-mix(in srgb, var(--color-accent) 55%, var(--color-surface-overlay))'
  if (t >= 0.4) return 'color-mix(in srgb, var(--color-accent) 30%, var(--color-surface-overlay))'
  return 'color-mix(in srgb, var(--color-warning) 25%, var(--color-surface-overlay))'
}

function heatGridClass(count: number): string {
  if (count <= 4) return 'grid-cols-2'
  if (count <= 6) return 'grid-cols-2 sm:grid-cols-3'
  return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
}

export function SkillsPage() {
  const { development, setGymEnabled } = useAthleteDevelopment()
  const { sessions } = useTrainingSessions()
  const { matches } = useSoccerMatches()
  const [editing, setEditing] = useState(false)

  const snapshot = useMemo(
    () => computeSkillsIntelligence(development.skills, sessions, matches),
    [development.skills, sessions, matches],
  )

  const usedPercents = snapshot.entries
    .map((e) => e.percent)
    .filter((p): p is number => p != null)
  const maxPercent = usedPercents.length > 0 ? Math.max(...usedPercents, 1) : 1
  const skillCount = development.skills.length
  const compactTiles = skillCount > 6

  return (
    <div className="perf-page-viewport perf-page-fit perf-page-grid grid grid-cols-1 gap-2 lg:grid-cols-2">
      <Panel title="Skills heatmap" subtitle="Last 4 weeks · training distribution" fillHeight scrollCap>
        {development.skills.length === 0 ? (
          <p className="text-xs text-[var(--color-text-tertiary)]">
            Save your skill list below to start tracking what you work on.
          </p>
        ) : (
          <div className="space-y-4">
            <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">{snapshot.insight}</p>

            <div className={cn('grid gap-2', heatGridClass(skillCount))}>
              {snapshot.entries.map((entry) => {
                const unused = entry.percent == null
                return (
                  <div
                    key={entry.skill.id}
                    className={cn(
                      'rounded-[var(--radius-md)] border border-[var(--color-border)]',
                      compactTiles ? 'p-2' : 'p-3',
                    )}
                    style={{ background: heatColor(entry.percent, maxPercent) }}
                  >
                    <p
                      className={cn(
                        'font-medium text-[var(--color-text-primary)]',
                        compactTiles ? 'text-xs leading-tight' : 'text-xs',
                      )}
                    >
                      {entry.skill.label}
                    </p>
                    <p
                      className={cn(
                        'font-semibold tabular-nums text-[var(--color-text-primary)]',
                        compactTiles ? 'mt-0.5 text-lg leading-none' : 'mt-1 text-2xl',
                        unused && 'text-[var(--color-text-tertiary)]',
                      )}
                    >
                      {unused ? '—' : `${entry.percent}%`}
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)]">
                      {unused
                        ? 'Not logged yet'
                        : `${entry.sessionCount} touch${entry.sessionCount === 1 ? '' : 'es'} · load ${entry.load}`}
                    </p>
                  </div>
                )
              })}
            </div>

            {usedPercents.length > 0 && (
              <ProgressBar
                value={snapshot.balanceScore}
                label="Balance score"
                variant={
                  snapshot.balanceScore >= 70
                    ? 'success'
                    : snapshot.balanceScore >= 45
                      ? 'accent'
                      : 'warning'
                }
                size="sm"
              />
            )}

            <dl className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] px-2 py-2">
                <dt className="text-[var(--color-text-tertiary)]">Working on</dt>
                <dd className="mt-0.5 font-medium text-[var(--color-text-primary)]">
                  {snapshot.dominant[0]?.label ?? '—'}
                </dd>
              </div>
              <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] px-2 py-2">
                <dt className="text-[var(--color-text-tertiary)]">Neglecting</dt>
                <dd className="mt-0.5 font-medium text-[var(--color-text-primary)]">
                  {snapshot.neglected[0]?.label ?? '—'}
                </dd>
              </div>
              <div className="rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] px-2 py-2">
                <dt className="text-[var(--color-text-tertiary)]">Total load</dt>
                <dd className="mt-0.5 font-medium tabular-nums text-[var(--color-text-primary)]">
                  {snapshot.totalLoad > 0 ? snapshot.totalLoad : '—'}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </Panel>

      <Panel
        title="Your skills"
        subtitle={`Up to ${MAX_SKILLS} skills · edit anytime`}
        fillHeight
        scrollCap
        action={
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="text-xs text-[var(--color-accent-muted)] hover:underline"
          >
            {editing ? 'Done' : 'Edit'}
          </button>
        }
      >
        {editing ? (
          <SkillsEditor compact />
        ) : (
          <ul className="space-y-2">
            {development.skills.map((skill) => {
              const entry = snapshot.entries.find((e) => e.skill.id === skill.id)
              const unused = entry?.percent == null
              return (
                <li
                  key={skill.id}
                  className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2"
                >
                  <span className="text-xs font-medium text-[var(--color-text-primary)]">{skill.label}</span>
                  <span
                    className={cn(
                      'text-xs tabular-nums',
                      !unused && (entry?.percent ?? 0) < 15
                        ? 'text-[var(--color-warning)]'
                        : 'text-[var(--color-text-tertiary)]',
                    )}
                  >
                    {unused ? '—' : `${entry.percent}%`}
                  </span>
                </li>
              )
            })}
            {development.skills.length === 0 && (
              <li>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-xs text-[var(--color-accent-muted)] hover:underline"
                >
                  Set up skills
                </button>
              </li>
            )}
          </ul>
        )}

        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3">
          <input
            type="checkbox"
            checked={development.gymEnabled}
            onChange={(e) => void setGymEnabled(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-[var(--color-border)]"
          />
          <span>
            <span className="block text-xs font-medium text-[var(--color-text-primary)]">Show Gym tab</span>
            <span className="mt-1 block text-xs leading-relaxed text-[var(--color-text-tertiary)]">
              Turn on if you lift or work out in the gym.
            </span>
          </span>
        </label>
      </Panel>
    </div>
  )
}
