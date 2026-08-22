import { TestScoresPanel } from '../dashboard/TestScoresPanel'
import { FinancialAidPanel } from '../dashboard/FinancialAidPanel'
import { FinancialSnapshotPanel } from '../dashboard/FinancialSnapshotPanel'
import { ScholarshipTrackerPanel } from '../dashboard/ScholarshipTrackerPanel'
import { StudentContextPanel } from '../dashboard/StudentContextPanel'
import { CollegePageGrid, CollegePageShell } from '../CollegePageShell'
import { useCollege } from '../../hooks/useCollege'
import { phaseDescription } from '../../phaseUtils'

export function CollegePlanningPage() {
  const { isSeniorMode } = useCollege()

  return (
    <CollegePageShell>
      <p className="shrink-0 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        {isSeniorMode
          ? 'Track aid progress, scholarship dollars, and cost gaps — push checklist items to Tasks when you are ready to act.'
          : phaseDescription('junior')}{' '}
        Set your graduation year in your profile so checklist dates align with your timeline.
      </p>
      <CollegePageGrid columns={2} rows={4}>
        <div className="college-page-span-2 min-h-0">
          <StudentContextPanel />
        </div>
        <div className="college-page-span-2 min-h-0">
          <FinancialSnapshotPanel />
        </div>
        <TestScoresPanel />
        <FinancialAidPanel />
        <div className="college-page-span-2 min-h-0">
          <ScholarshipTrackerPanel />
        </div>
      </CollegePageGrid>
    </CollegePageShell>
  )
}
