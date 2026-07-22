import { Panel, PanelDivider } from '@components/ui/Panel'
import { MiniBarChart, MetricTile } from '@components/ui/MiniBarChart'
import { ProgressBar } from '@components/ui/ProgressBar'
import { ratingTrends, weeklyLoad, trainingSessions, matches } from '../../data/mockData'
import { avgMatchRating, avgTrainingRating } from '../../utils'

export function ProgressChartsPage() {
  return (
    <div className="dashboard-grid grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel title="Weekly Training Load" subtitle="Minutes per week" fullWidth className="lg:col-span-2">
        <MiniBarChart
          data={weeklyLoad.map((w) => w.minutes)}
          labels={weeklyLoad.map((w) => w.week)}
          height={120}
        />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {weeklyLoad.slice(-4).map((w) => (
            <MetricTile
              key={w.week}
              label={w.week}
              value={w.minutes}
              unit="min"
              trend={w.avgRpe >= 7 ? 'up' : 'neutral'}
            />
          ))}
        </div>
      </Panel>

      <Panel title="Match Rating Trend" subtitle="Weekly average / 10">
        <MiniBarChart
          data={ratingTrends.map((r) => r.matchRating * 10)}
          labels={ratingTrends.map((r) => r.week)}
          height={80}
          color="var(--color-success)"
        />
        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
          Season avg: {avgMatchRating(matches)} · Last 4 weeks trending up
        </p>
      </Panel>

      <Panel title="Training Rating Trend" subtitle="Weekly average / 10">
        <MiniBarChart
          data={ratingTrends.map((r) => r.trainingRating * 10)}
          labels={ratingTrends.map((r) => r.week)}
          height={80}
        />
        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
          Session avg: {avgTrainingRating(trainingSessions)}
        </p>
      </Panel>

      <Panel title="RPE Trend" subtitle="Session intensity" fullWidth className="lg:col-span-2">
        <div className="space-y-3">
          {weeklyLoad.map((w) => (
            <div key={w.week}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-[var(--color-text-secondary)]">{w.week}</span>
                <span className="tabular-nums text-[var(--color-text-tertiary)]">
                  RPE {w.avgRpe} · {w.sessions} sessions
                </span>
              </div>
              <ProgressBar
                value={(w.avgRpe / 10) * 100}
                showValue={false}
                variant={w.avgRpe >= 7 ? 'warning' : 'accent'}
                size="sm"
              />
            </div>
          ))}
        </div>
        <PanelDivider />
        <p className="text-[10px] text-[var(--color-text-tertiary)]">
          Target: maintain avg RPE 6.5–7.2 during build phase
        </p>
      </Panel>
    </div>
  )
}
