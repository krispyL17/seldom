import { Panel, PanelGoToLink } from '@components/ui/Panel'
import { PanelSkeleton } from '@components/ui/PanelSkeleton'
import { useDashboardInsights } from '@features/analytics/hooks/useDashboardInsights'
import { useCollege } from '@features/college/hooks/useCollege'
import { daysUntil, getUnifiedPlanningDeadlines } from '@features/college/utils'
import { useUserPreferences } from '@features/preferences'
import type { OverviewInsightMode } from '@/types/userPreferences'

function resolveInsightMode(
  collegeEnabled: boolean,
  setting: OverviewInsightMode,
): OverviewInsightMode {
  if (!collegeEnabled) return 'analytics'
  return setting
}

export function OverviewInsightPanel() {
  const { collegeEnabled, preferences } = useUserPreferences()
  const { colleges, userData } = useCollege()
  const { insights, loading } = useDashboardInsights()

  const mode = resolveInsightMode(
    collegeEnabled,
    preferences?.overview_insight_mode ?? 'analytics',
  )

  if (loading) {
    return (
      <Panel title="Insight" accentNavId="analytics" fillHeight scrollCap>
        <PanelSkeleton lines={3} />
      </Panel>
    )
  }

  if (mode === 'college' && collegeEnabled) {
    const nearest = getUnifiedPlanningDeadlines(
      colleges,
      userData?.financialAid ?? [],
      userData?.scholarships ?? [],
      1,
    )[0]
    return (
      <Panel
        title="College prep"
        accentNavId="college"
        fillHeight
        scrollCap
        subtitle="From your application workspace"
        action={<PanelGoToLink to="/college/deadlines" accentNavId="college" />}
      >
        {nearest ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{nearest.label}</p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {nearest.subtitle} · {daysUntil(nearest.date)} days
            </p>
          </div>
        ) : (
          <p className="text-xs text-[var(--color-text-secondary)]">
            Add schools and track checklists in Junior Prep.
          </p>
        )}
      </Panel>
    )
  }

  const top = insights?.insights[0]
  const headline = insights?.weekHeadline

  return (
    <Panel
      title="Insight"
      accentNavId="analytics"
      fillHeight
      scrollCap
      subtitle={headline?.adjective ?? 'From your logs'}
      action={<PanelGoToLink to="/analytics" accentNavId="analytics" />}
    >
      {top ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold leading-snug text-[var(--color-text-primary)]">{top.title}</p>
          <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">{top.description}</p>
        </div>
      ) : (
        <p className="text-xs text-[var(--color-text-secondary)]">
          Log tasks, training, or journal entries to unlock personalized insights.
        </p>
      )}
    </Panel>
  )
}
