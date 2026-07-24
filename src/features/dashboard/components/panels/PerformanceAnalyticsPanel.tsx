import { useNavigate } from 'react-router-dom'
import { Panel, PanelActionLink, PanelDivider } from '@components/ui/Panel'
import { MiniBarChart, MetricTile } from '@components/ui/MiniBarChart'
import { Button } from '@components/ui/Button'
import { useUserProfile } from '@hooks/useUserProfile'
import { performanceAnalytics, soccerHub, tasksData } from '../../data/mockData'

export function PerformanceAnalyticsPanel() {
  const { profile, loading } = useUserProfile()
  const navigate = useNavigate()
  const { weekLabels } = performanceAnalytics

  // If no profile data is available (shouldn't happen with OnboardingGuard, but good to be safe)
  if (!loading && !profile) {
    return (
      <Panel
        title="Performance Analytics"
        subtitle="Setup required"
        fullWidth
      >
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[var(--color-warning)]/10 flex items-center justify-center">
              <span className="text-[var(--color-warning)] text-lg">⚠️</span>
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
              Profile Setup Required
            </h3>
            <p className="text-[var(--color-text-secondary)] text-sm mb-4">
              Complete your profile setup to unlock personalized performance analytics.
            </p>
          </div>
          <Button onClick={() => navigate('/onboarding')}>
            Complete Setup
          </Button>
        </div>
      </Panel>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <Panel
        title="Performance Analytics"
        subtitle="Loading..."
        fullWidth
      >
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      </Panel>
    )
  }

  // Normal analytics display
  const avgSleep =
    performanceAnalytics.sleepHours.reduce((a, b) => a + b, 0) /
    performanceAnalytics.sleepHours.length
  const latestTaskCompletion =
    performanceAnalytics.taskCompletion.at(-1) ?? tasksData.completionRate

  return (
    <Panel
      title="Performance Analytics"
      subtitle={`7-day overview for ${profile?.first_name || 'User'}`}
      fullWidth
      action={<PanelActionLink>Full analytics</PanelActionLink>}
    >
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MetricTile 
          label="Avg Sleep" 
          value={avgSleep.toFixed(1)} 
          unit="h" 
          trend="up" 
        />
        <MetricTile
          label="Recovery"
          value={performanceAnalytics.recoveryScores.at(-1) ?? 0}
          unit="/100"
          trend="up"
        />
        <MetricTile label="Tasks Done" value={latestTaskCompletion} unit="%" trend="neutral" />
        <MetricTile
          label="Sessions"
          value={soccerHub.weeklyWorkload.sessions}
          unit="/wk"
          trend="up"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <PanelDivider label="Training Frequency" />
          <MiniBarChart
            data={performanceAnalytics.trainingFrequency}
            labels={weekLabels}
            color="var(--color-accent)"
          />
        </div>
        <div>
          <PanelDivider label="Task Completion" />
          <MiniBarChart
            data={performanceAnalytics.taskCompletion}
            labels={weekLabels}
            color="var(--color-success)"
          />
        </div>
        <div>
          <PanelDivider label="Goal Progress" />
          <MiniBarChart
            data={performanceAnalytics.goalProgress}
            labels={weekLabels}
            color="var(--color-warning)"
          />
        </div>
        <div>
          <PanelDivider label={`Sleep (target: ${profile?.target_sleep_hours || 8}h)`} />
          <MiniBarChart
            data={performanceAnalytics.sleepHours}
            labels={weekLabels}
            color="#636366"
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <PanelDivider label="Recovery Score" />
          <MiniBarChart
            data={performanceAnalytics.recoveryScores}
            labels={weekLabels}
            color="var(--color-success)"
            height={64}
          />
        </div>
      </div>
    </Panel>
  )
}
