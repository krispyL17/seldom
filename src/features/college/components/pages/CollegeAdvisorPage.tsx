import { AiAdvisorPanel } from '../advisor/AiAdvisorPanel'
import { CollegePageShell } from '../CollegePageShell'

export function CollegeAdvisorPage() {
  return (
    <CollegePageShell className="min-h-0 flex-1">
      <div className="flex min-h-0 flex-1 flex-col" id="college-advisor">
        <AiAdvisorPanel fullHeight />
      </div>
    </CollegePageShell>
  )
}
