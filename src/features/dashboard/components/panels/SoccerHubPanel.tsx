import { Link } from 'react-router-dom'
import { EmptyState } from '@components/ui/EmptyState'
import { ErrorPanel } from '@components/ui/ErrorPanel'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { Panel, PanelActionLink } from '@components/ui/Panel'
import { useUserPreferences } from '@features/preferences'
import { useAthleteDevelopment } from '@features/soccer/hooks/useAthleteDevelopment'
import { useRunLogs } from '@features/soccer/running/hooks/useRunLogs'
import { useTrainingSessions } from '@features/soccer/training/hooks/useTrainingSessions'
import { sessionHeadline, sessionTagline } from '@features/soccer/utils/sessionSummary'
import { useDistanceUnit } from '@hooks/useDistanceUnit'

export function SoccerHubPanel() {
  const { hobbyTabLabel } = useUserPreferences()
  const { development } = useAthleteDevelopment()
  const {
    sessions,
    loading: sessionsLoading,
    error: sessionsError,
    reload: reloadSessions,
  } = useTrainingSessions()
  const { runs, loading: runsLoading, error: runsError, reload: reloadRuns } = useRunLogs()
  const { formatDistance } = useDistanceUnit()

  const loading = sessionsLoading || runsLoading
  const error = sessionsError ?? runsError
  const hasLoggedData = sessions.length > 0 || runs.length > 0
  const latestSession = sessions[0]
  const runDistanceM = runs.reduce((s, r) => s + r.distance_m, 0)

  if (error) {
    return (
      <ErrorPanel
        message={error}
        onRetry={() => {
          void reloadSessions()
          void reloadRuns()
        }}
        title={`Couldn't load ${hobbyTabLabel}`}
      />
    )
  }

  if (loading) {
    return (
      <Panel title={hobbyTabLabel} subtitle="Loading…" accentNavId="soccer">
        <PanelSkeleton lines={2} />
      </Panel>
    )
  }

  return (
    <Panel
      title={hobbyTabLabel}
      accentNavId="soccer"
      fillHeight
      scrollCap
      subtitle={latestSession ? sessionTagline(latestSession) : 'No sessions yet'}
      action={
        <PanelActionLink to="/soccer/overview">
          {hasLoggedData ? 'Overview' : 'Log session'}
        </PanelActionLink>
      }
    >
      {!hasLoggedData ? (
        <EmptyState
          compact
          title="Nothing logged yet"
          description={`Log a session or run to track progress in ${hobbyTabLabel}.`}
          action={
            <Link
              to="/soccer/overview"
              className="text-xs font-medium text-[var(--color-accent-muted)] hover:underline"
            >
              Log session
            </Link>
          }
        />
      ) : (
        <div className="space-y-1.5 text-xs leading-snug">
          {latestSession && (
            <p className="font-medium text-[var(--color-text-primary)]">
              {sessionHeadline(latestSession, development.skills)}
              <span className="font-normal text-[var(--color-text-tertiary)]">
                {' '}
                · RPE {latestSession.intensity}/10
              </span>
            </p>
          )}
          {runs.length > 0 && (
            <p className="text-[var(--color-text-secondary)]">
              {runs.length} run{runs.length === 1 ? '' : 's'} ·{' '}
              <span className="tabular-nums">{formatDistance(runDistanceM)}</span> total
            </p>
          )}
        </div>
      )}
    </Panel>
  )
}
