import { Badge } from '@components/ui/Badge'
import { IconCheck } from '@components/ui/icons'
import { Panel, PanelDivider, PanelActionLink, DataRow } from '@components/ui/Panel'
import type { RecoveryStatus } from '@/types'
import { dailyBriefing } from '../../data/mockData'

const RECOVERY_VARIANTS: Record<RecoveryStatus, 'success' | 'warning' | 'danger'> = {
  Good: 'success',
  Moderate: 'warning',
  Poor: 'danger',
}

export function DailyBriefingPanel() {
  const recoveryVariant = RECOVERY_VARIANTS[dailyBriefing.recovery.status]

  return (
    <Panel
      title="Daily Briefing"
      subtitle="AI-generated overview"
      badge={<Badge variant="accent">Preview</Badge>}
      action={<PanelActionLink to="/assistant">Open Seldom OS</PanelActionLink>}
      fullWidth
    >
      <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {dailyBriefing.summary}
      </p>

      <PanelDivider label="Today's Priorities" />
      <ul className="space-y-2">
        {dailyBriefing.priorities.map((item) => (
          <li key={item.id} className="flex items-start gap-2.5">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                item.done
                  ? 'border-[var(--color-success)] bg-[var(--color-success)]/20 text-[var(--color-success)]'
                  : 'border-[var(--color-border-strong)]'
              }`}
              aria-hidden
            >
              {item.done && <IconCheck />}
            </span>
            <span
              className={`text-xs ${item.done ? 'text-[var(--color-text-tertiary)] line-through' : 'text-[var(--color-text-primary)]'}`}
            >
              {item.text}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
              Recovery
            </span>
            <Badge variant={recoveryVariant}>{dailyBriefing.recovery.status}</Badge>
          </div>
          <p className="text-2xl font-semibold tabular-nums text-[var(--color-text-primary)]">
            {dailyBriefing.recovery.score}
            <span className="text-sm font-normal text-[var(--color-text-tertiary)]"> / 100</span>
          </p>
          <div className="mt-2 space-y-1">
            <DataRow label="Sleep" value={dailyBriefing.recovery.sleep} />
            <DataRow label="HRV" value={`${dailyBriefing.recovery.hrv} ms`} />
            <DataRow label="Readiness" value={dailyBriefing.recovery.readiness} />
          </div>
        </div>

        <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3">
          <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
            Upcoming Deadlines
          </span>
          <ul className="mt-2 space-y-2">
            {dailyBriefing.deadlines.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 py-2"
              >
                <span className="text-xs text-[var(--color-text-primary)]">{d.title}</span>
                <div className="text-right">
                  <Badge variant={d.daysLeft <= 2 ? 'danger' : 'muted'}>
                    {d.daysLeft}d left
                  </Badge>
                  <p className="mt-0.5 text-[10px] text-[var(--color-text-tertiary)]">{d.date}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Panel>
  )
}
