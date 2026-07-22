import { Badge } from '@components/ui/Badge'
import { ProgressBar } from '@components/ui/ProgressBar'
import { Panel, DataRow, PanelDivider } from '@components/ui/Panel'
import { MetricTile, MiniBarChart } from '@components/ui/MiniBarChart'
import { Link } from 'react-router-dom'
import {
  matches,
  playerProfile,
  technicalSkills,
  trainingSessions,
  weeklyLoad,
  weeklyWorkload,
  aiCoachTips,
} from '../../data/mockData'
import {
  avgMatchRating,
  avgTrainingRating,
  formatShortDate,
} from '../../utils'

export function SoccerOverviewPage() {
  const loadPct = Math.round((weeklyWorkload.totalMinutes / weeklyWorkload.target) * 100)
  const nextSession = trainingSessions[0]
  const lastMatch = matches[0]
  const topSkills = [...technicalSkills].sort((a, b) => b.value - a.value).slice(0, 5)

  return (
    <div className="dashboard-grid grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel title="Player Profile" subtitle={playerProfile.season} className="lg:col-span-2">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xl font-semibold text-[var(--color-text-primary)]">
              {playerProfile.name}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
              #{playerProfile.squadNumber} · {playerProfile.position} · {playerProfile.preferredFoot} foot
            </p>
            <Badge variant="accent" className="mt-2 normal-case tracking-normal">
              Focus: {playerProfile.currentFocus}
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricTile label="Match avg" value={avgMatchRating(matches)} trend="up" />
            <MetricTile label="Training avg" value={avgTrainingRating(trainingSessions)} trend="up" />
            <MetricTile label="Sessions" value={weeklyWorkload.sessions} unit="/wk" />
            <MetricTile label="Load" value={`${loadPct}%`} trend={loadPct > 95 ? 'down' : 'up'} />
          </div>
        </div>
      </Panel>

      <Panel title="Next Session" subtitle="Scheduled">
        {nextSession && (
          <>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{nextSession.type}</p>
            <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
              {formatShortDate(nextSession.date)} · {nextSession.durationMin} min · RPE {nextSession.rpe}
            </p>
            <Badge variant="muted" className="mt-2">{nextSession.intensity}</Badge>
            <PanelDivider label="Focus" />
            <div className="flex flex-wrap gap-1.5">
              {nextSession.focus.map((f) => (
                <Badge key={f} variant="muted" className="normal-case tracking-normal">{f}</Badge>
              ))}
            </div>
            <Link to="/soccer/training" className="mt-3 inline-block text-xs text-[var(--color-accent-muted)] hover:underline">
              View all sessions →
            </Link>
          </>
        )}
      </Panel>

      <Panel title="Last Match" subtitle={lastMatch?.competition ?? ''}>
        {lastMatch && (
          <>
            <div className="flex items-center gap-2">
              <Badge variant={lastMatch.result === 'W' ? 'success' : lastMatch.result === 'D' ? 'warning' : 'danger'}>
                {lastMatch.result} {lastMatch.score}
              </Badge>
              <span className="text-sm font-medium text-[var(--color-text-primary)]">vs {lastMatch.opponent}</span>
            </div>
            <div className="mt-3 space-y-1">
              <DataRow label="Rating" value={`${lastMatch.rating} / 10`} />
              <DataRow label="G / A" value={`${lastMatch.goals} / ${lastMatch.assists}`} />
              <DataRow label="Minutes" value={lastMatch.minutes} />
            </div>
            <p className="mt-2 text-[11px] text-[var(--color-text-tertiary)]">{lastMatch.highlights}</p>
            <Link to="/soccer/matches" className="mt-3 inline-block text-xs text-[var(--color-accent-muted)] hover:underline">
              Match log →
            </Link>
          </>
        )}
      </Panel>

      <Panel title="Top Attributes" subtitle="Technical — /20">
        <div className="space-y-2">
          {topSkills.map((s) => (
            <ProgressBar key={s.id} label={s.name} value={s.value} max={20} variant="accent" />
          ))}
        </div>
        <Link to="/soccer/technical" className="mt-3 inline-block text-xs text-[var(--color-accent-muted)] hover:underline">
          Full technical profile →
        </Link>
      </Panel>

      <Panel title="Weekly Load" subtitle={weeklyWorkload.loadStatus}>
        <ProgressBar
          value={loadPct}
          label={`${weeklyWorkload.totalMinutes} / ${weeklyWorkload.target} min`}
          variant={loadPct > 95 ? 'warning' : 'success'}
          size="md"
        />
        <div className="mt-4">
          <MiniBarChart
            data={weeklyLoad.map((w) => w.minutes)}
            labels={weeklyLoad.map((w) => w.week.replace(' ', '\n'))}
            height={56}
          />
        </div>
      </Panel>

      <Panel title="Coach Notes" subtitle="Preview" fullWidth className="lg:col-span-2">
        <ul className="grid gap-2 sm:grid-cols-2">
          {aiCoachTips.map((tip) => (
            <li
              key={tip}
              className="rounded-[var(--radius-sm)] border border-[var(--color-accent)]/15 bg-[var(--color-accent)]/5 px-3 py-2 text-xs text-[var(--color-text-secondary)]"
            >
              {tip}
            </li>
          ))}
        </ul>
        <Link to="/soccer/coach" className="mt-3 inline-block text-xs text-[var(--color-accent-muted)] hover:underline">
          Open AI Coach →
        </Link>
      </Panel>
    </div>
  )
}
