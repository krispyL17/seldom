import { useRunLogs } from '../../running/hooks/useRunLogs'
import { useSoccerMatches } from '../../matches/hooks/useSoccerMatches'
import { RESULT_LABELS } from '../../matches/types'
import { useSoccer } from '../../hooks/useSoccerProfile'
import { useAthleteDevelopment } from '../../hooks/useAthleteDevelopment'
import { useDistanceUnit } from '@hooks/useDistanceUnit'
import { formatShortDate } from '../../utils'
import { StreakFlame } from '../../athlete/components/StreakFlame'
import { CustomTabsPromptBanner } from '../../athlete/components/CustomTabsEditor'
import { PerformanceLogSection } from '../../components/PerformanceLogSection'
import { Panel } from '@components/ui/Panel'

export function SoccerOverviewPage() {
  const { profile } = useSoccer()
  const { runs, loading: runsLoading } = useRunLogs()
  const { matches, loading: matchesLoading } = useSoccerMatches()
  const { development } = useAthleteDevelopment()
  const { formatDistance } = useDistanceUnit()
  const { streak } = development

  const latestRun = runs[0]
  const latestGame = matches[0]

  return (
    <div className="perf-page-fit grid h-full min-h-0 grid-cols-1 gap-2 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <div className="flex min-h-0 flex-col gap-2 overflow-hidden">
        <CustomTabsPromptBanner />

        <Panel title="At a glance" subtitle="Focus and recent activity" className="shrink-0">
          {profile?.currentFocus && (
            <p className="text-xs font-medium text-[var(--color-text-primary)]">
              Focus: {profile.currentFocus}
            </p>
          )}
          {streak.current > 0 && (
            <div className={profile?.currentFocus ? 'mt-2' : undefined}>
              <StreakFlame
                current={streak.current}
                longest={streak.longest}
                frozen={streak.frozen}
                compact
              />
            </div>
          )}
          {!profile?.currentFocus && streak.current === 0 && !latestGame && (
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Log a session or game to start tracking.
            </p>
          )}
          {latestGame && (
            <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]">
              Latest game · {latestGame.competition ?? 'Game'} · {RESULT_LABELS[latestGame.result]} ·{' '}
              {formatShortDate(latestGame.match_date)}
            </p>
          )}
          {latestRun && (
            <p className="mt-2 text-[11px] text-[var(--color-text-secondary)]">
              Latest run · {formatDistance(latestRun.distance_m)} · {formatShortDate(latestRun.run_date)}
            </p>
          )}
          {(runsLoading || matchesLoading) && (
            <p className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">Loading activity…</p>
          )}
        </Panel>
      </div>

      <PerformanceLogSection compact className="min-h-0 flex-1" />
    </div>
  )
}
