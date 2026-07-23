import { ProgressBar } from '@components/ui/ProgressBar'
import { MiniBarChart } from '@components/ui/MiniBarChart'
import { Panel } from '@components/ui/Panel'
import type { SkillTrendSeries } from '@analytics/types'

interface SkillTrendGridProps {
  skills: SkillTrendSeries[]
  title?: string
  subtitle?: string
}

export function SkillTrendGrid({
  skills,
  title = 'Technical Skill Progression',
  subtitle = 'Per-session ratings (1–10)',
}: SkillTrendGridProps) {
  if (skills.length === 0) {
    return (
      <Panel title={title} subtitle={subtitle} fullWidth>
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Log training sessions with technical ratings to see skill trends.
        </p>
      </Panel>
    )
  }

  const sortedSkills = [...skills]
    .filter((s) => s.latest > 0)
    .sort((a, b) => b.latest - a.latest)

  return (
    <Panel title={title} subtitle={subtitle} fullWidth>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedSkills.map((skill) => (
          <div
            key={skill.skill}
            className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-medium text-[var(--color-text-secondary)]">
                {skill.skill}
              </span>
              <span className="text-xs font-semibold tabular-nums text-[var(--color-text-primary)]">
                {skill.latest}
              </span>
            </div>
            <MiniBarChart
              data={skill.data}
              labels={skill.labels}
              height={40}
              color="var(--color-success)"
            />
            <ProgressBar
              value={skill.latest * 10}
              showValue={false}
              variant="accent"
              size="sm"
              className="mt-2"
            />
          </div>
        ))}
      </div>
    </Panel>
  )
}
