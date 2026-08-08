import { TestScoresPanel } from '../dashboard/TestScoresPanel'
import { FinancialAidPanel } from '../dashboard/FinancialAidPanel'
import { ScholarshipTrackerPanel } from '../dashboard/ScholarshipTrackerPanel'
import { StudentContextPanel } from '../dashboard/StudentContextPanel'
import { CollegePageGrid, CollegePageShell } from '../CollegePageShell'
import { useCollege } from '../../hooks/useCollege'
import { phaseDescription } from '../../phaseUtils'

export function CollegePlanningPage() {
  const { isSeniorMode } = useCollege()

  return (
    <CollegePageShell>
      <p className="shrink-0 text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        {isSeniorMode
          ? 'Update your profile and test scores, track financial aid steps, and manage scholarships — everything saves to your account.'
          : phaseDescription('junior')}{' '}
        Set your graduation year in your profile so checklist dates align with your timeline.
      </p>
      <CollegePageGrid columns={2} rows={3}>
        <div className="college-page-span-2 min-h-0">
          <StudentContextPanel />
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
