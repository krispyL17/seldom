import { Panel, DataRow } from '@components/ui/Panel'
import { Badge } from '@components/ui/Badge'
import { useCollege } from '../../hooks/useCollege'

export function TestScoresPanel() {
  const { userData } = useCollege()
  const scores = userData?.testScores

  if (!scores) return null

  return (
    <Panel title="Test Scores" subtitle="SAT & ACT">
      <div className="space-y-3">
        <DataRow label="SAT" value={scores.sat.score ?? '—'} />
        <div className="flex items-center gap-2 pl-1">
          <Badge variant={scores.sat.status === 'sent' ? 'success' : 'muted'}>
            {scores.sat.status.replace('_', ' ')}
          </Badge>
          {scores.sat.date && (
            <span className="text-[10px] text-[var(--color-text-tertiary)]">{scores.sat.date}</span>
          )}
        </div>
        <DataRow label="ACT" value={scores.act.score ?? '—'} />
        <div className="flex items-center gap-2 pl-1">
          <Badge variant={scores.act.status === 'sent' ? 'success' : 'muted'}>
            {scores.act.status.replace('_', ' ')}
          </Badge>
          {scores.act.date && (
            <span className="text-[10px] text-[var(--color-text-tertiary)]">{scores.act.date}</span>
          )}
        </div>
      </div>
    </Panel>
  )
}
