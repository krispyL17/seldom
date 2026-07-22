import { Badge } from '@components/ui/Badge'
import { ProgressBar } from '@components/ui/ProgressBar'
import { Panel } from '@components/ui/Panel'
import { technicalSkills } from '../../data/mockData'
import { ratingVariant, trendSymbol } from '../../utils'

export function TechnicalSkillsPage() {
  const avg = Math.round(
    (technicalSkills.reduce((s, sk) => s + sk.value, 0) / technicalSkills.length) * 10,
  ) / 10

  return (
    <div className="space-y-4">
      <Panel title="Technical Profile" subtitle={`Squad avg ${avg} / 20`} fullWidth>
        <div className="grid gap-4 lg:grid-cols-2">
          {technicalSkills.map((skill) => (
            <div
              key={skill.id}
              className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--color-text-primary)]">{skill.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[var(--color-text-tertiary)]">
                    {trendSymbol(skill.trend)}
                  </span>
                  <Badge variant="muted">{skill.value}/20</Badge>
                </div>
              </div>
              <ProgressBar
                value={skill.value}
                max={20}
                showValue={false}
                variant={ratingVariant(skill.value)}
                size="md"
              />
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
