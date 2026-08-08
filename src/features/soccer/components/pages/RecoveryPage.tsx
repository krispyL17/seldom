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
    <div className="perf-page-fit grid h-full min-h-0 grid-cols-1 gap-2 overflow-hidden lg:grid-cols-2">
      <Panel fillHeight title="Workload" subtitle="Last 7 days · load-based estimate" className="min-h-0">
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
        <p className="mt-2 text-[10px] text-[var(--color-text-tertiary)]">
          {formatMinutesDuration(snap?.minutesLast7Days ?? 0)} · {snap?.sessionsLast7Days ?? 0} sessions
          {breakdown && breakdown.runMinutesLast7 > 0 && ` · ${breakdown.runMinutesLast7} min runs`}
        </p>
        {breakdown && (
          <dl className="mt-4 space-y-1.5 text-[10px] text-[var(--color-text-secondary)]">
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
            <div className="flex justify-between gap-2 border-t border-[var(--color-border)] pt-1.5 font-medium">
              <dt>4-wk avg load</dt>
              <dd className="tabular-nums text-[var(--color-text-primary)]">
                {breakdown.chronicWeeklyLoad} / wk
              </dd>
            </div>
          </dl>
        )}
      </Panel>

      <Panel fillHeight title="Recovery score" subtitle="Readiness estimate" className="min-h-0">
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
        <p className="mt-2 text-[10px] text-[var(--color-text-tertiary)]">
          Not medical advice · avg energy {snap?.avgEnergyLast7Days ?? 0}/5
        </p>
        {breakdown && snap && (
          <dl className="mt-4 space-y-1.5 text-[10px] text-[var(--color-text-secondary)]">
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

      <Panel fillHeight title="Muscle stress" subtitle="Top areas from recent sessions" className="min-h-0">
        {snap?.muscleGroups.length ? (
          <ul className="space-y-2">
            {snap.muscleGroups.slice(0, 6).map((muscle) => (
              <li key={muscle.id}>
                <div className="mb-1 flex justify-between text-[10px]">
                  <span className="text-[var(--color-text-secondary)]">{muscle.label}</span>
                  <span className="tabular-nums text-[var(--color-text-tertiary)]">{muscle.stress}</span>
                </div>
                <ProgressBar
                  value={Math.min(100, muscle.stress * 12)}
                  showValue={false}
                  size="sm"
                  variant={muscle.stress >= 5 ? 'warning' : 'accent'}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-[var(--color-text-tertiary)]">Log sessions to estimate regional stress.</p>
        )}
      </Panel>

      <Panel fillHeight title="Recommendations" subtitle="Training balance" className="min-h-0">
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
        <p className="text-[10px] leading-relaxed text-[var(--color-text-tertiary)]">
          Workload combines 7-day volume (duration × intensity), average RPE, and acute:chronic ratio vs your
          last 4 weeks. Recovery starts from inverted workload, then adjusts for logged energy and recent rest.
        </p>
      </Panel>

      <Panel fillHeight title="Injury mode & profile" className="min-h-0 lg:col-span-2">
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <InjuryModeControls />
          </div>
          <AthleteSideProfileCard />
        </div>
        <p className="mt-3 text-[10px] text-[var(--color-text-tertiary)]">
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
  )
}
