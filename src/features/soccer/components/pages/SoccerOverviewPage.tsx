import { Link } from 'react-router-dom'
import { Badge } from '@components/ui/Badge'
import { EmptyState } from '@components/ui/EmptyState'
import { Panel, PanelDivider } from '@components/ui/Panel'
import { useTrainingSessions } from '../../training/hooks/useTrainingSessions'
import { useSoccer } from '../../hooks/useSoccerProfile'
import { formatShortDate } from '../../utils'

export function SoccerOverviewPage() {
  const { profile } = useSoccer()
  const { sessions, loading } = useTrainingSessions()

  const latestSession = sessions[0]

  if (loading) {
    return (
      <Panel title="Overview" subtitle="Loading…" fullWidth>
        <p className="py-8 text-center text-sm text-[var(--color-text-tertiary)]">Loading…</p>
      </Panel>
    )
  }

  const hasProfile = Boolean(profile?.name || profile?.currentFocus)
  const hasSessions = sessions.length > 0

  if (!hasProfile && !hasSessions) {
    return (
      <Panel title="Overview" subtitle="Your performance snapshot" fullWidth>
        <EmptyState
          title="Your overview is empty"
          description="Complete setup and log sessions — this page only shows your data, never sample content."
          className="py-12"
          action={
            <Link
              to="/soccer/training"
              className="inline-flex h-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-3 text-xs font-medium text-white hover:bg-[var(--color-accent-hover)]"
            >
              Log first session
            </Link>
          }
        />
      </Panel>
    )
  }

  return (
    <div className="dashboard-grid grid grid-cols-1 gap-4 lg:grid-cols-2">
      {hasProfile && profile && (
        <Panel title="Profile" subtitle="Your focus" className="lg:col-span-2">
          <div>
            {profile.name && (
              <p className="text-xl font-semibold text-[var(--color-text-primary)]">{profile.name}</p>
            )}
            {profile.currentFocus && (
              <Badge variant="accent" className="mt-2 normal-case tracking-normal">
                Focus: {profile.currentFocus}
              </Badge>
            )}
          </div>
        </Panel>
      )}

      <Panel title="Latest Session" subtitle={hasSessions ? 'From your log' : 'None yet'}>
        {latestSession ? (
          <>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">
              {latestSession.position_played?.trim() || 'Session'} · {latestSession.duration_min} min
            </p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              {formatShortDate(latestSession.session_date)} · Intensity {latestSession.intensity}/10
            </p>
            {latestSession.notes && (
              <>
                <PanelDivider label="Notes" />
                <p className="text-xs text-[var(--color-text-secondary)]">{latestSession.notes}</p>
              </>
            )}
            <Link
              to="/soccer/training"
              className="mt-3 inline-block text-xs text-[var(--color-accent-muted)] hover:underline"
            >
              View all sessions →
            </Link>
          </>
        ) : (
          <EmptyState title="No sessions yet" description="Log a session to see it here." />
        )}
      </Panel>

      <Panel title="AI Coach" subtitle="Seldom OS" fullWidth>
        <EmptyState
          title="Coach insights appear after you log"
          description="Generate advice and reviews once you have logged sessions."
          action={
            <Link
              to="/soccer/coach"
              className="inline-flex h-8 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-3 text-xs font-medium text-white hover:bg-[var(--color-accent-hover)]"
            >
              Open AI Coach
            </Link>
          }
        />
      </Panel>
    </div>
  )
}
