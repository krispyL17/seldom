import { EmptyState } from '@components/ui/EmptyState'
import { Panel, PanelGoToLink } from '@components/ui/Panel'
import { TabTintLink } from '@components/ui/TabTintLink'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { useDashboardInsights } from '@features/analytics/hooks/useDashboardInsights'
import { useUserPreferences } from '@features/preferences'
import { useAthleteDevelopment } from '@features/soccer/hooks/useAthleteDevelopment'
import { useTrainingSessions } from '@features/soccer/training/hooks/useTrainingSessions'
import { sessionHeadline, sessionTagline } from '@features/soccer/utils/sessionSummary'

export function HomePerformancePreviewPanel() {
  const { hobbyTabLabel } = useUserPreferences()
  const { development } = useAthleteDevelopment()
  const { sessions, loading } = useTrainingSessions()
  const { insights } = useDashboardInsights()

  const latest = sessions[0]
  const pr = insights?.personalRecords[0]

  return (
    <Panel
      title={hobbyTabLabel}
      accentNavId="soccer"
      fillHeight
      scrollCap
      subtitle={latest ? sessionTagline(latest) : 'Latest session'}
      action={<PanelGoToLink to="/soccer/overview" accentNavId="soccer" />}
    >
      {loading ? (
        <PanelSkeleton lines={2} />
      ) : !latest ? (
        <EmptyState
          compact
          title="No sessions yet"
          action={
            <TabTintLink to="/soccer/overview" accentNavId="soccer">
              Log session
            </TabTintLink>
          }
        />
      ) : (
        <div className="space-y-1.5 text-xs">
          <p className="font-medium leading-snug text-[var(--color-text-primary)]">
            {sessionHeadline(latest, development.skills)}
          </p>
          <p className="text-[var(--color-text-tertiary)]">RPE {latest.intensity}/10</p>
          {pr && (
            <p className="text-[var(--color-text-secondary)]">
              {pr.isRecent ? 'New PR · ' : 'PR · '}
              {pr.label} {pr.value}
            </p>
          )}
        </div>
      )}
    </Panel>
  )
}
