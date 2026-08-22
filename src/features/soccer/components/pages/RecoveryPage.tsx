import { Link } from 'react-router-dom'
import { Badge } from '@components/ui/Badge'
import { Panel, PanelDivider } from '@components/ui/Panel'
import { ProgressBar } from '@components/ui/ProgressBar'
import { formatMinutesDuration } from '@lib/formatDuration'
import { useAthleteDevelopment } from '../../hooks/useAthleteDevelopment'
import { fatigueLabel } from '../../athlete/recovery'
import { AthleteSideProfileCard, InjuryModeControls } from '../../athlete/components/AthleteSideProfileCard'
import { cn } from '@lib/utils'

function scoreVariant(score: number): 'success' | 'accent' | 'warning' | 'danger' {
  if (score >= 70) return 'success'
  if (score >= 45) return 'accent'
  if (score >= 30) return 'warning'
  return 'danger'
}

function fatigueBadgeVariant(
  level: 'low' | 'moderate' | 'high' | 'very_high',
): 'success' | 'default' | 'warning' | 'danger' {
  switch (level) {
    case 'low':
      return 'success'
    case 'moderate':
      return 'default'
    case 'high':
      return 'warning'
    default:
      return 'danger'
  }
}

export function RecoveryPage() {
  const { recovery, loading } = useAthleteDevelopment()

  if (loading) {
    return <p className="py-4 text-center text-xs text-[var(--color-text-tertiary)]">Loading…</p>
  }

  const snap = recovery
  const breakdown = snap?.breakdown

  return (
    <div className="perf-tab-scroll">
      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
      <Panel
        title="Workload"
        subtitle={
          breakdown && !breakdown.acwrReady && breakdown.historyDaysAvailable > 0
            ? `Last ${Math.min(7, breakdown.historyDaysAvailable)} day${Math.min(7, breakdown.historyDaysAvailable) === 1 ? '' : 's'} · ACWR pending`
            : 'Last 7 days · load-based estimate'
        }
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-3xl font-semibold tabular-nums text-[var(--color-text-primary)]">
            {snap?.workloadScore ?? '—'}
          </p>
          {snap && (
            <Badge variant={fatigueBadgeVariant(snap.fatigueLevel)}>
              {fatigueLabel(snap.fatigueLevel)} fatigue
            </Badge>
          )}
        </div>
        {snap && (
          <ProgressBar
            value={snap.workloadScore}
            label="Workload index"
            variant={scoreVariant(100 - snap.workloadScore)}
            size="sm"
            className="mt-3"
          />
        )}
        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
          {formatMinutesDuration(snap?.minutesLast7Days ?? 0)} · {snap?.sessionsLast7Days ?? 0} sessions
          {breakdown && breakdown.runMinutesLast7 > 0 && ` · ${breakdown.runMinutesLast7} min runs`}
        </p>
        {breakdown && (
          <dl className="mt-4 space-y-1.5 text-xs text-[var(--color-text-secondary)]">
            <div className="flex justify-between gap-2">
              <dt>Volume load ({breakdown.acuteLoad} units)</dt>
              <dd className="tabular-nums text-[var(--color-text-primary)]">+{breakdown.volumePoints}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Intensity (avg {snap?.avgIntensityLast7Days ?? 0}/10)</dt>
              <dd className="tabular-nums text-[var(--color-text-primary)]">+{breakdown.intensityPoints}</dd>
            </div>
            {breakdown.acwrPenalty > 0 && (
              <div className="flex justify-between gap-2 text-[var(--color-warning)]">
                <dt>ACWR spike ({breakdown.acwr.toFixed(2)}×)</dt>
                <dd className="tabular-nums">+{breakdown.acwrPenalty}</dd>
              </div>
            )}
            {!breakdown.acwrReady && breakdown.trainingDaysLast28 > 0 && (
              <div className="flex justify-between gap-2 text-[var(--color-text-tertiary)]">
                <dt>
                  ACWR ({breakdown.trainingDaysLast28}/7 training days in last 28)
                </dt>
                <dd className="tabular-nums">Not active yet</dd>
              </div>
            )}
            {!breakdown.acwrReady && breakdown.trainingDaysLast28 === 0 && breakdown.historyDaysAvailable > 0 && (
              <div className="flex justify-between gap-2 text-[var(--color-text-tertiary)]">
                <dt>ACWR (log training to enable)</dt>
                <dd className="tabular-nums">Not active yet</dd>
              </div>
            )}
            <div className="flex justify-between gap-2 border-t border-[var(--color-border)] pt-1.5 font-medium">
              <dt>{breakdown.acwrReady ? '4-wk avg load' : 'Recent avg load'}</dt>
              <dd className="tabular-nums text-[var(--color-text-primary)]">
                {breakdown.chronicWeeklyLoad} / wk
              </dd>
            </div>
            {breakdown.acwrReady && breakdown.sampleConfidence < 1 && (
              <div className="flex justify-between gap-2 text-[var(--color-text-tertiary)]">
                <dt>
                  History ({breakdown.trainingDaysLast28} day
                  {breakdown.trainingDaysLast28 === 1 ? '' : 's'} ·{' '}
                  {Math.round(breakdown.sampleConfidence * 100)}% confidence)
                </dt>
                <dd className="tabular-nums">ACWR dampened</dd>
              </div>
            )}
          </dl>
        )}
      </Panel>

      <Panel title="Recovery score" subtitle="Readiness estimate">
        <p className="text-3xl font-semibold tabular-nums text-[var(--color-accent-muted)]">
          {snap?.recoveryScore ?? '—'}
        </p>
        {snap && (
          <ProgressBar
            value={snap.recoveryScore}
            label="Estimated readiness"
            variant={scoreVariant(snap.recoveryScore)}
            size="sm"
            className="mt-3"
          />
        )}
        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
          Not medical advice · avg energy {snap?.avgEnergyLast7Days ?? 0}/5
        </p>
        {breakdown && snap && (
          <dl className="mt-4 space-y-1.5 text-xs text-[var(--color-text-secondary)]">
            <div className="flex justify-between gap-2">
              <dt>Base (100 − workload × 0.82)</dt>
              <dd className="tabular-nums text-[var(--color-text-primary)]">
                {Math.round(100 - snap.workloadScore * 0.82)}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt>Energy adjustment</dt>
              <dd
                className={cn(
                  'tabular-nums',
                  breakdown.energyAdjustment >= 0
                    ? 'text-[var(--color-success)]'
                    : 'text-[var(--color-warning)]',
                )}
              >
                {breakdown.energyAdjustment >= 0 ? '+' : ''}
                {breakdown.energyAdjustment}
              </dd>
            </div>
            {breakdown.freshnessBonus > 0 && (
              <div className="flex justify-between gap-2">
                <dt>Rest-day freshness</dt>
                <dd className="tabular-nums text-[var(--color-success)]">+{breakdown.freshnessBonus}</dd>
              </div>
            )}
          </dl>
        )}
      </Panel>

      <Panel title="Regional load" subtitle="Last 7 days · from logged skills + cardio">
        {snap?.muscleGroups.length ? (
          <ul className="space-y-3">
            {snap.muscleGroups.map((region) => (
              <li key={region.id}>
                <div className="mb-1 flex justify-between gap-2 text-xs">
                  <span className="font-medium text-[var(--color-text-secondary)]">{region.label}</span>
                  <span className="shrink-0 tabular-nums text-[var(--color-text-tertiary)]">
                    {region.percent}%
                  </span>
                </div>
                <ProgressBar
                  value={region.percent}
                  showValue={false}
                  size="sm"
                  variant={region.percent >= 45 ? 'warning' : 'accent'}
                />
                <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
                  {region.sources.slice(0, 3).join(' · ')}
                  {region.sessionTouches > 0 && (
                    <span className="text-[var(--color-text-tertiary)]">
                      {' '}
                      · {region.sessionTouches} touch{region.sessionTouches === 1 ? '' : 'es'}
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        ) : snap && snap.sessionsLast7Days > 0 ? (
          <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
            Sessions logged, but no skills checked yet. Use the skill checklist when logging — regional
            load is derived from that, not session titles.
          </p>
        ) : (
          <p className="text-xs text-[var(--color-text-tertiary)]">
            Log sessions with skills checked, or log cardio runs, to see where load accumulated.
          </p>
        )}
      </Panel>

      <Panel title="Recommendations" subtitle="Training balance">
        {snap?.recommendations.length ? (
          <ul className="space-y-1.5 text-xs text-[var(--color-text-secondary)]">
            {snap.recommendations.slice(0, 8).map((rec, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-[var(--color-accent-muted)]">•</span>
                {rec}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-[var(--color-text-tertiary)]">Log sessions to see suggestions.</p>
        )}

        <PanelDivider label="How scores work" />
        <p className="text-xs leading-relaxed text-[var(--color-text-tertiary)]">
          Workload uses a rolling past 7 days (not calendar week). ACWR compares that window to your
          recent 28-day average once you have 7+ logged training days in the last 28; until then spike
          alerts stay off.
        </p>
      </Panel>

      <Panel title="Injury mode & profile" className="lg:col-span-2">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <InjuryModeControls />
          </div>
          <AthleteSideProfileCard />
        </div>
        <p className="mt-3 text-xs text-[var(--color-text-tertiary)]">
          <Link to="/assistant?mode=soccer_drills" className="text-[var(--color-accent-muted)] hover:underline">
            AI Coach
          </Link>
          {' · '}
          <Link to="/soccer/knowledge" className="text-[var(--color-accent-muted)] hover:underline">
            Import knowledge
          </Link>
        </p>
      </Panel>
      </div>
    </div>
  )
}
