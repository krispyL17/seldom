import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Panel } from '@components/ui/Panel'
import { ProgressBar } from '@components/ui/ProgressBar'
import { useParams } from 'react-router-dom'
import { useAthleteDevelopment } from '../../hooks/useAthleteDevelopment'
import { useTrainingSessions } from '../../training/hooks/useTrainingSessions'
import { sessionBelongsToTab } from '../../utils/sessionTabCategory'
import { formatShortDate } from '../../utils'
import { formatMinutesDuration } from '@lib/formatDuration'

export function CustomSportTabPage() {
  const { tabSlug } = useParams<{ tabSlug: string }>()
  const { development } = useAthleteDevelopment()
  const { sessions, loading } = useTrainingSessions()
  const tab = development.customTabs.find((t) => t.slug === tabSlug)

  const relatedSessions = useMemo(() => {
    if (!tab) return []
    return sessions
      .filter((s) => sessionBelongsToTab(s.position_played, tab, development.customTabs))
      .sort((a, b) => b.session_date.localeCompare(a.session_date))
  }, [sessions, tab, development.customTabs])

  const stats = useMemo(() => {
    const totalMin = relatedSessions.reduce((sum, s) => sum + s.duration_min, 0)
    const lastDate = relatedSessions[0]?.session_date ?? null
    const avgIntensity =
      relatedSessions.length > 0
        ? Math.round(
            relatedSessions.reduce((sum, s) => sum + s.intensity, 0) / relatedSessions.length,
          )
        : 0
    return { totalMin, lastDate, avgIntensity, count: relatedSessions.length }
  }, [relatedSessions])

  if (!tab) {
    return (
      <div className="perf-page-fit flex h-full min-h-0 flex-col overflow-hidden">
        <Panel fillHeight title="Tab not found" className="min-h-0">
          <p className="text-xs text-[var(--color-text-secondary)]">This focus tab was removed or renamed.</p>
          <Link to="/soccer/overview" className="mt-2 inline-block text-xs text-[var(--color-accent-muted)] hover:underline">
            Back to overview
          </Link>
        </Panel>
      </div>
    )
  }

  return (
    <div className="perf-page-fit grid h-full min-h-0 grid-cols-1 gap-2 overflow-hidden lg:grid-cols-2">
      <Panel fillHeight title={tab.label} subtitle="Focus area" className="min-h-0">
        <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">{tab.focusHint}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
          <div>
            <dt className="text-[var(--color-text-tertiary)]">Sessions logged</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums text-[var(--color-text-primary)]">
              {stats.count}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-tertiary)]">Total time</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums text-[var(--color-text-primary)]">
              {formatMinutesDuration(stats.totalMin)}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-tertiary)]">Avg intensity</dt>
            <dd className="mt-0.5 font-medium text-[var(--color-text-primary)]">
              {stats.count > 0 ? `${stats.avgIntensity}/10` : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-tertiary)]">Last session</dt>
            <dd className="mt-0.5 font-medium text-[var(--color-text-primary)]">
              {stats.lastDate ? formatShortDate(stats.lastDate) : '—'}
            </dd>
          </div>
        </dl>
        {stats.count > 0 && (
          <div className="mt-4">
            <p className="mb-1 text-[10px] text-[var(--color-text-tertiary)]">Recent activity (last 30 days target)</p>
            <ProgressBar value={Math.min(100, (stats.count / 8) * 100)} size="sm" showValue={false} />
          </div>
        )}
        <p className="mt-4 text-[11px] text-[var(--color-text-tertiary)]">
          Log on{' '}
          <Link to="/soccer/overview" className="text-[var(--color-accent-muted)] hover:underline">
            Overview
          </Link>{' '}
          and pick <strong>{tab.label}</strong> as the session category.
        </p>
      </Panel>

      <Panel fillHeight title="Recent sessions" subtitle={`${relatedSessions.length} tagged`} className="min-h-0">
        {loading ? (
          <p className="text-xs text-[var(--color-text-tertiary)]">Loading…</p>
        ) : relatedSessions.length === 0 ? (
          <p className="text-xs text-[var(--color-text-tertiary)]">
            No sessions tagged with this focus yet.{' '}
            <Link to="/soccer/overview" className="text-[var(--color-accent-muted)] hover:underline">
              Log your first
            </Link>
          </p>
        ) : (
          <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
            {relatedSessions.slice(0, 12).map((s) => (
              <li key={s.id} className="flex justify-between gap-2 border-b border-[var(--color-border)] pb-2 last:border-0">
                <span>
                  {formatMinutesDuration(s.duration_min)} · intensity {s.intensity}/10
                </span>
                <span className="shrink-0 text-[var(--color-text-tertiary)]">
                  {formatShortDate(s.session_date)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
