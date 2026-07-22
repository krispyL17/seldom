import { ProgressBar } from '@components/ui/ProgressBar'
import { Panel } from '@components/ui/Panel'
import { MetricCard } from '../shared/MetricCard'
import { useCollege } from '../../hooks/useCollege'
import { progressVariant } from '../../utils'

export function ProgressOverviewPanel() {
  const { stats, isSeniorMode } = useCollege()

  return (
    <Panel
      title={isSeniorMode ? 'Application Progress' : 'Prep Progress'}
      subtitle={isSeniorMode ? 'Overall admissions readiness' : 'Junior year readiness'}
      fullWidth
    >
      <div className="space-y-4">
        <ProgressBar
          value={stats.overallProgress}
          label={isSeniorMode ? 'Overall completion' : 'List & prep completion'}
          variant={progressVariant(stats.overallProgress)}
          size="md"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricCard label="Colleges" value={stats.collegeCount} variant="accent" />
          <MetricCard
            label={isSeniorMode ? 'Submitted' : 'Lists started'}
            value={stats.applicationsCompleted}
            subValue={`of ${stats.collegeCount}`}
            variant="success"
          />
          <MetricCard
            label={isSeniorMode ? 'Essays in progress' : 'Themes & notes'}
            value={stats.essaysInProgress}
            variant="warning"
          />
          <MetricCard
            label="Deadlines"
            value={stats.upcomingDeadlineCount}
            subValue={isSeniorMode ? 'upcoming' : 'this year'}
            variant="danger"
          />
        </div>
      </div>
    </Panel>
  )
}
