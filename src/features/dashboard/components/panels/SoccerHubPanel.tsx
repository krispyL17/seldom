import { Link } from 'react-router-dom'
import { EmptyState } from '@components/ui/EmptyState'
import { Panel, PanelActionLink } from '@components/ui/Panel'
import { useUserPreferences } from '@features/preferences'
import { MileRunSnapshotList } from '@features/soccer/running/components/MileRunSnapshotList'
import { filterMileRuns } from '@features/soccer/running/utils'
import { useRunLogs } from '@features/soccer/running/hooks/useRunLogs'
import { useTrainingSessions } from '@features/soccer/training/hooks/useTrainingSessions'
import { formatMinutesDuration } from '@lib/formatDuration'

export function SoccerHubPanel() {
  const { hobbyTabLabel } = useUserPreferences()
  const { sessions, loading: sessionsLoading } = useTrainingSessions()
  const { runs, loading: runsLoading } = useRunLogs()

  const loading = sessionsLoading || runsLoading
  const mileRuns = filterMileRuns(runs)
  const hasLoggedData = sessions.length > 0 || runs.length > 0
  const latestSession = sessions[0]

  if (loading) {
    return (
      <Panel title={`${hobbyTabLabel} Hub`} subtitle="Loading…">
        <p className="py-6 text-center text-xs text-[var(--color-text-tertiary)]">Loading…</p>
      </Panel>
    )
  }

  return (
    <Panel
      title={`${hobbyTabLabel} Hub`}
      subtitle="Your performance snapshot"
      action={
        <PanelActionLink to="/soccer/overview">{`Open ${hobbyTabLabel}`}</PanelActionLink>
      }
    >
      {!hasLoggedData ? (
        <EmptyState
          title="Nothing logged yet"
          description={`This panel stays blank until you add data in your ${hobbyTabLabel} tab — sessions, runs, or other logs.`}
          action={
            <Link
              to="/soccer/overview"
              className="inline-flex h-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-3 text-xs font-medium text-white hover:bg-[var(--color-accent-hover)]"
            >
              {`Open ${hobbyTabLabel}`}
            </Link>
          }
        />
      ) : (
        <>
          {latestSession && (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3">
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Latest session
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
                {latestSession.position_played} · {formatMinutesDuration(latestSession.duration_min)}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                Intensity {latestSession.intensity}/10
              </p>
            </div>
          )}
          {(mileRuns.length > 0 || runs.length > 0) && (
            <div className={`${latestSession ? 'mt-3' : ''} rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3`}>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
                Mile runs
              </p>
              <div className="mt-2">
                <MileRunSnapshotList runs={runs} />
              </div>
            </div>
          )}
        </>
      )}
    </Panel>
  )
}
