import { Link } from 'react-router-dom'
import { EmptyState } from '@components/ui/EmptyState'
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
  const { sessions, loading: sessionsLoading } = useTrainingSessions()
  const { runs, loading: runsLoading } = useRunLogs()
  const { formatDistance } = useDistanceUnit()

  const loading = sessionsLoading || runsLoading
  const hasLoggedData = sessions.length > 0 || runs.length > 0
  const latestSession = sessions[0]
  const runDistanceM = runs.reduce((s, r) => s + r.distance_m, 0)

  if (loading) {
    return (
      <Panel title={hobbyTabLabel} subtitle="Loading…">
        <p className="py-2 text-center text-[11px] text-[var(--color-text-tertiary)]">Loading…</p>
      </Panel>
    )
  }

  return (
    <Panel
      title={hobbyTabLabel}
      subtitle={latestSession ? sessionTagline(latestSession) : 'No sessions yet'}
      action={<PanelActionLink to="/soccer/overview">Log</PanelActionLink>}
    >
      {!hasLoggedData ? (
        <EmptyState
          title="Nothing logged"
          description={`Log in ${hobbyTabLabel} → Overview.`}
          action={
            <Link
              to="/soccer/overview"
              className="text-xs font-medium text-[var(--color-accent-muted)] hover:underline"
            >
              Open overview
            </Link>
          }
        />
      ) : (
        <div className="space-y-2 text-[11px]">
          {latestSession && (
            <p className="font-medium text-[var(--color-text-primary)]">
              {sessionHeadline(latestSession, development.customTabs)}
              <span className="font-normal text-[var(--color-text-tertiary)]">
                {' '}
                · RPE {latestSession.intensity}/10
              </span>
            </p>
          )}
          {runs.length > 0 && (
            <p className="text-[var(--color-text-secondary)]">
              {runs.length} run{runs.length === 1 ? '' : 's'} · {formatDistance(runDistanceM)} total
            </p>
          )}
        </div>
      )}
    </Panel>
  )
}
