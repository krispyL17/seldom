import { ProgressBar } from '@components/ui/ProgressBar'
import { Panel } from '@components/ui/Panel'
import { ChecklistItemRow } from '../shared/ChecklistItemRow'
import type { College } from '../../types'
import { checklistProgress, progressVariant } from '../../utils'
import { useCollege } from '../../hooks/useCollege'
import { checklistForPhase } from '../../phaseUtils'

interface ChecklistSectionProps {
  college: College
  onToggle?: (key: string) => void
}

export function ChecklistSection({ college, onToggle }: ChecklistSectionProps) {
  const { applicationPhase } = useCollege()
  const displayChecklist = checklistForPhase(applicationPhase, college.checklist)
  const progress = checklistProgress(displayChecklist)

  return (
    <Panel
      fillHeight
      title={applicationPhase === 'senior' ? 'Application Checklist' : 'Prep Checklist'}
      subtitle={`${progress}% complete`}
    >
      <ProgressBar
        value={progress}
        label="Progress"
        variant={progressVariant(progress)}
        size="md"
      />
      <ul className="mt-4 space-y-1">
        {displayChecklist.map((item) => (
          <li key={item.key}>
            <ChecklistItemRow
              label={item.label}
              completed={item.completed}
              onToggle={onToggle ? () => onToggle(item.key) : undefined}
            />
          </li>
        ))}
      </ul>
    </Panel>
  )
}
