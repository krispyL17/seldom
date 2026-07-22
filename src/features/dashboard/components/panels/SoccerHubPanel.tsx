import { Link } from 'react-router-dom'
import { Badge } from '@components/ui/Badge'
import { ProgressBar } from '@components/ui/ProgressBar'
import { Panel, PanelDivider, DataRow } from '@components/ui/Panel'
import { soccerHub } from '../../data/mockData'

export function SoccerHubPanel() {
  const loadPct = Math.round(
    (soccerHub.weeklyWorkload.totalMinutes / soccerHub.weeklyWorkload.target) * 100,
  )

  return (
    <Panel
      title="Soccer Hub"
      subtitle={soccerHub.currentFocus}
      badge={<Badge variant="accent">Focus</Badge>}
      action={
        <Link
          to="/soccer/overview"
          className="rounded-sm text-[10px] font-medium text-[var(--color-accent-muted)] hover:underline"
        >
          Full hub
        </Link>
      }
    >
      <div className="rounded-[var(--radius-md)] border border-[var(--color-accent)]/20 bg-[var(--color-accent)]/5 p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-accent-muted)]">
          Next Training
        </p>
        <p className="mt-1 text-sm font-semibold text-[var(--color-text-primary)]">
          {soccerHub.nextTraining.type}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)]">
          {soccerHub.nextTraining.time} · {soccerHub.nextTraining.duration}
        </p>
        <Badge variant="muted" className="mt-2">
          {soccerHub.nextTraining.intensity}
        </Badge>
      </div>

      <PanelDivider label="Technical Ratings" />
      <div className="space-y-2">
        {soccerHub.technicalRatings.map((rating) => (
          <ProgressBar
            key={rating.skill}
            label={rating.skill}
            value={rating.value}
            max={rating.max}
            variant="accent"
          />
        ))}
      </div>

      <PanelDivider label="Last Session" />
      <DataRow label="Date" value={soccerHub.lastSession.date} />
      <DataRow label="Type" value={soccerHub.lastSession.type} />
      <DataRow label="Rating" value={`${soccerHub.lastSession.rating} / 10`} />
      <p className="mt-2 text-[11px] leading-relaxed text-[var(--color-text-tertiary)]">
        {soccerHub.lastSession.notes}
      </p>

      <PanelDivider label="Weekly Workload" />
      <ProgressBar
        value={loadPct}
        label={`${soccerHub.weeklyWorkload.totalMinutes} / ${soccerHub.weeklyWorkload.target} min`}
        variant={loadPct > 95 ? 'warning' : 'success'}
        size="md"
      />
      <p className="mt-2 text-[10px] text-[var(--color-text-tertiary)]">
        {soccerHub.weeklyWorkload.sessions} sessions · {soccerHub.weeklyWorkload.loadStatus}
      </p>

      <div className="mt-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3">
        <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-accent-muted)]">
          AI Recommendation
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-[var(--color-text-secondary)]">
          {soccerHub.aiRecommendation}
        </p>
      </div>
    </Panel>
  )
}
