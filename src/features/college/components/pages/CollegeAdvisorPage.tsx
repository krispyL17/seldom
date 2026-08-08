import { AiAdvisorPanel } from '../advisor/AiAdvisorPanel'
import { CollegePageShell } from '../CollegePageShell'

export function CollegeAdvisorPage() {
  return (
    <CollegePageShell>
      <div className="min-h-0 flex-1 overflow-hidden" id="college-advisor">
        <AiAdvisorPanel fullHeight />
      </div>
    </CollegePageShell>
  )
}
