import { useState } from 'react'
import { Badge } from '@components/ui/Badge'
import { Panel, PanelDivider } from '@components/ui/Panel'
import { MiniBarChart, MetricTile } from '@components/ui/MiniBarChart'
import { ProgressBar } from '@components/ui/ProgressBar'
import { cn } from '@lib/utils'
import { ratingTrends, weeklyLoad, trainingSessions, matches, technicalSkills, physicalMetrics } from '../../data/mockData'
import { avgMatchRating, avgTrainingRating } from '../../utils'

type PerformanceTab = 'overview' | 'trends' | 'comparison' | 'insights' | 'goals'

const PERFORMANCE_TABS = [
  { id: 'overview' as const, label: 'Overview', description: 'Key metrics & progress summary' },
  { id: 'trends' as const, label: 'Trends', description: 'Performance over time' },
  { id: 'comparison' as const, label: 'Comparison', description: 'Benchmarks & standards' },
  { id: 'insights' as const, label: 'Insights', description: 'AI-powered analysis' },
  { id: 'goals' as const, label: 'Goals', description: 'Progress towards targets' },
] as const

export function PerformanceAnalysisPage() {
  const [activeTab, setActiveTab] = useState<PerformanceTab>('overview')

  return (
    <div className="space-y-4">
      {/* Performance Navigation */}
      <div className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)] pb-px">
        {PERFORMANCE_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'shrink-0 rounded-t-[var(--radius-sm)] px-3 py-2 text-[11px] font-medium transition-colors',
              activeTab === tab.id
                ? 'border border-b-0 border-[var(--color-border)] bg-[var(--color-surface-raised)] text-[var(--color-text-primary)]'
                : 'text-[var(--color-text-tertiary)] hover:bg-[var(--color-surface-overlay)] hover:text-[var(--color-text-secondary)]'
            )}
          >
            <div>{tab.label}</div>
            <div className="mt-0.5 text-[10px] text-[var(--color-text-tertiary)]">{tab.description}</div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-4">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'trends' && <TrendsTab />}
        {activeTab === 'comparison' && <ComparisonTab />}
        {activeTab === 'insights' && <InsightsTab />}
        {activeTab === 'goals' && <GoalsTab />}
      </div>
    </div>
  )
}

function OverviewTab() {
  const latestSession = trainingSessions[0]
  const latestMatch = matches[0]

  return (
    <div className="dashboard-grid grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel title="Performance Summary" subtitle="Last 30 days" fullWidth className="lg:col-span-2">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <MetricTile
            label="Avg Match Rating"
            value={avgMatchRating(matches)}
            unit="/10"
            trend="up"
          />
          <MetricTile
            label="Training Sessions"
            value={trainingSessions.length}
            unit="sessions"
            trend="neutral"
          />
          <MetricTile
            label="Total Minutes"
            value={weeklyLoad.reduce((sum, w) => sum + w.minutes, 0)}
            unit="min"
            trend="up"
          />
          <MetricTile
            label="Avg RPE"
            value={parseFloat((weeklyLoad.reduce((sum, w) => sum + w.avgRpe, 0) / weeklyLoad.length).toFixed(1))}
            unit="/10"
            trend="neutral"
          />
        </div>
      </Panel>

      <Panel title="Recent Match" subtitle={latestMatch.date}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">vs {latestMatch.opponent}</span>
            <Badge variant={latestMatch.result === 'W' ? 'success' : latestMatch.result === 'D' ? 'warning' : 'danger'}>
              {latestMatch.result} {latestMatch.score}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="text-[var(--color-text-tertiary)]">Rating</div>
              <div className="font-semibold">{latestMatch.rating}/10</div>
            </div>
            <div>
              <div className="text-[var(--color-text-tertiary)]">Goals</div>
              <div className="font-semibold">{latestMatch.goals}</div>
            </div>
            <div>
              <div className="text-[var(--color-text-tertiary)]">Assists</div>
              <div className="font-semibold">{latestMatch.assists}</div>
            </div>
          </div>
          <p className="text-xs text-[var(--color-text-secondary)]">{latestMatch.highlights}</p>
        </div>
      </Panel>

      <Panel title="Latest Training" subtitle={latestSession.date}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{latestSession.type}</span>
            <Badge variant="muted">{latestSession.intensity}</Badge>
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <div className="text-[var(--color-text-tertiary)]">Duration</div>
              <div className="font-semibold">{latestSession.durationMin}min</div>
            </div>
            <div>
              <div className="text-[var(--color-text-tertiary)]">RPE</div>
              <div className="font-semibold">{latestSession.rpe}/10</div>
            </div>
            <div>
              <div className="text-[var(--color-text-tertiary)]">Rating</div>
              <div className="font-semibold">{latestSession.rating}/10</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs text-[var(--color-text-tertiary)]">Focus Areas</div>
            <div className="flex flex-wrap gap-1">
              {latestSession.focus.map(area => (
                <Badge key={area} variant="muted">{area}</Badge>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}

function TrendsTab() {
  return (
    <div className="dashboard-grid grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel title="Weekly Training Load" subtitle="Minutes per week" fullWidth className="lg:col-span-2">
        <MiniBarChart
          data={weeklyLoad.map((w) => w.minutes)}
          labels={weeklyLoad.map((w) => w.week)}
          height={120}
        />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {weeklyLoad.slice(-4).map((w) => (
            <MetricTile
              key={w.week}
              label={w.week}
              value={w.minutes}
              unit="min"
              trend={w.avgRpe >= 7 ? 'up' : 'neutral'}
            />
          ))}
        </div>
      </Panel>

      <Panel title="Match Rating Trend" subtitle="Weekly average / 10">
        <MiniBarChart
          data={ratingTrends.map((r) => r.matchRating * 10)}
          labels={ratingTrends.map((r) => r.week)}
          height={80}
          color="var(--color-success)"
        />
        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
          Season avg: {avgMatchRating(matches)} · Last 4 weeks trending up
        </p>
      </Panel>

      <Panel title="Training Rating Trend" subtitle="Weekly average / 10">
        <MiniBarChart
          data={ratingTrends.map((r) => r.trainingRating * 10)}
          labels={ratingTrends.map((r) => r.week)}
          height={80}
        />
        <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
          Session avg: {avgTrainingRating(trainingSessions)}
        </p>
      </Panel>

      <Panel title="RPE Trend" subtitle="Session intensity" fullWidth className="lg:col-span-2">
        <div className="space-y-3">
          {weeklyLoad.map((w) => (
            <div key={w.week}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-[var(--color-text-secondary)]">{w.week}</span>
                <span className="tabular-nums text-[var(--color-text-tertiary)]">
                  RPE {w.avgRpe} · {w.sessions} sessions
                </span>
              </div>
              <ProgressBar
                value={(w.avgRpe / 10) * 100}
                showValue={false}
                variant={w.avgRpe >= 7 ? 'warning' : 'accent'}
                size="sm"
              />
            </div>
          ))}
        </div>
        <PanelDivider />
        <p className="text-[10px] text-[var(--color-text-tertiary)]">
          Target: maintain avg RPE 6.5–7.2 during build phase
        </p>
      </Panel>
    </div>
  )
}

function ComparisonTab() {
  return (
    <div className="dashboard-grid grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Panel title="Technical Skills vs Standards" subtitle="Current ratings vs position benchmarks">
        <div className="space-y-3">
          {technicalSkills.slice(0, 6).map((skill) => {
            const benchmarkValue = 14 // Standard CM benchmark
            const skillMax = skill.max || 20
            const percentage = (skill.value / skillMax) * 100
            const benchmarkPercentage = (benchmarkValue / skillMax) * 100
            
            return (
              <div key={skill.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-[var(--color-text-secondary)]">{skill.name}</span>
                  <span className="tabular-nums text-[var(--color-text-tertiary)]">
                    {skill.value}/{skillMax}
                  </span>
                </div>
                <div className="relative">
                  <ProgressBar
                    value={percentage}
                    showValue={false}
                    variant={skill.value >= benchmarkValue ? 'success' : 'accent'}
                    size="sm"
                  />
                  <div 
                    className="absolute top-0 h-full w-0.5 bg-[var(--color-warning)]"
                    style={{ left: `${benchmarkPercentage}%` }}
                    title={`Position benchmark: ${benchmarkValue}`}
                  />
                </div>
              </div>
            )
          })}
        </div>
        <PanelDivider />
        <p className="text-[10px] text-[var(--color-text-tertiary)]">
          Yellow line shows position benchmark (14/20 for CM). {technicalSkills.filter(s => s.value >= 14).length}/{technicalSkills.slice(0, 6).length} skills above standard.
        </p>
      </Panel>

      <Panel title="Physical Metrics vs Targets" subtitle="Current levels vs position requirements">
        <div className="space-y-3">
          {physicalMetrics.map((metric) => {
            const isAboveBenchmark = metric.value >= metric.benchmark
            const percentage = metric.unit === '%' 
              ? metric.value 
              : (metric.value / (metric.benchmark * 1.2)) * 100
            
            return (
              <div key={metric.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-[var(--color-text-secondary)]">{metric.name}</span>
                  <span className="tabular-nums text-[var(--color-text-tertiary)]">
                    {metric.value}{metric.unit}
                  </span>
                </div>
                <ProgressBar
                  value={Math.min(percentage, 100)}
                  showValue={false}
                  variant={isAboveBenchmark ? 'success' : 'warning'}
                  size="sm"
                />
                <div className="mt-1 text-[10px] text-[var(--color-text-tertiary)]">
                  Target: {metric.benchmark}{metric.unit} · 
                  <span className={isAboveBenchmark ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}>
                    {isAboveBenchmark ? ' Above target' : ' Below target'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </Panel>

      <Panel title="League Position Comparison" subtitle="Estimated percentile rankings" fullWidth className="lg:col-span-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h4 className="mb-3 text-sm font-medium">Technical Rankings</h4>
            <div className="space-y-2">
              {[
                { skill: 'Passing', percentile: 78 },
                { skill: 'First Touch', percentile: 85 },
                { skill: 'Vision', percentile: 72 },
                { skill: 'Work Rate', percentile: 92 },
              ].map((item) => (
                <div key={item.skill} className="flex justify-between text-xs">
                  <span>{item.skill}</span>
                  <span className="font-medium">{item.percentile}th percentile</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-medium">Physical Rankings</h4>
            <div className="space-y-2">
              {[
                { attribute: 'Stamina', percentile: 88 },
                { attribute: 'Pace', percentile: 65 },
                { attribute: 'Strength', percentile: 58 },
                { attribute: 'Agility', percentile: 70 },
              ].map((item) => (
                <div key={item.attribute} className="flex justify-between text-xs">
                  <span>{item.attribute}</span>
                  <span className="font-medium">{item.percentile}th percentile</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Panel>
    </div>
  )
}

function InsightsTab() {
  const performanceInsights = [
    {
      id: 'insight-1',
      title: 'Peak performance window identified',
      description: 'Your match ratings are 15% higher in evening games (after 6 PM) compared to afternoon matches.',
      category: 'Performance Timing',
      impact: 'High',
      actionable: 'Request evening fixtures when possible',
    },
    {
      id: 'insight-2', 
      title: 'Training load correlation',
      description: 'Sessions exceeding 7.5 RPE correlate with 0.3 point drop in next match rating.',
      category: 'Load Management',
      impact: 'Medium',
      actionable: 'Limit high-RPE sessions to 1 per week',
    },
    {
      id: 'insight-3',
      title: 'Weak foot progression',
      description: 'Left foot passing accuracy improved 12% over 6 weeks with targeted practice.',
      category: 'Skill Development',
      impact: 'High',
      actionable: 'Continue current weak-foot routine',
    },
    {
      id: 'insight-4',
      title: 'Fatigue pattern detected',
      description: 'Decision-making speed drops 18% after minute 75, especially in high-intensity matches.',
      category: 'Endurance',
      impact: 'Medium',
      actionable: 'Add mental fatigue drills to training',
    },
  ]

  return (
    <div className="space-y-4">
      <Panel title="AI Performance Insights" subtitle="Data-driven observations and recommendations" fullWidth>
        <div className="grid gap-4 sm:grid-cols-2">
          {performanceInsights.map((insight) => (
            <div
              key={insight.id}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
            >
              <div className="mb-2 flex items-center justify-between">
                <Badge variant={insight.impact === 'High' ? 'success' : 'warning'}>
                  {insight.impact} Impact
                </Badge>
                <Badge variant="muted">{insight.category}</Badge>
              </div>
              <h3 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
                {insight.title}
              </h3>
              <p className="mb-3 text-xs text-[var(--color-text-secondary)]">
                {insight.description}
              </p>
              <div className="rounded border-l-2 border-l-[var(--color-accent)] bg-[var(--color-accent)]/5 px-2 py-1">
                <div className="text-[10px] font-medium text-[var(--color-text-tertiary)]">RECOMMENDED ACTION</div>
                <div className="text-xs text-[var(--color-text-primary)]">{insight.actionable}</div>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Performance Patterns" subtitle="Weekly rhythm analysis">
          <div className="space-y-3">
            {[
              { day: 'Monday', avgRating: 7.2, sessions: 12, trend: 'stable' },
              { day: 'Tuesday', avgRating: 7.8, sessions: 15, trend: 'up' },
              { day: 'Wednesday', avgRating: 7.1, sessions: 8, trend: 'down' },
              { day: 'Thursday', avgRating: 7.6, sessions: 14, trend: 'up' },
              { day: 'Friday', avgRating: 6.9, sessions: 6, trend: 'down' },
              { day: 'Saturday', avgRating: 8.1, sessions: 10, trend: 'up' },
              { day: 'Sunday', avgRating: 7.4, sessions: 5, trend: 'stable' },
            ].map((day) => (
              <div key={day.day} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-20 text-xs font-medium">{day.day}</span>
                  <div className="text-xs text-[var(--color-text-tertiary)]">
                    {day.sessions} sessions
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{day.avgRating}</span>
                  <div className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    day.trend === 'up' ? 'bg-[var(--color-success)]' :
                    day.trend === 'down' ? 'bg-[var(--color-danger)]' :
                    'bg-[var(--color-text-tertiary)]'
                  )} />
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Injury Risk Factors" subtitle="Preventive monitoring">
          <div className="space-y-3">
            {[
              { factor: 'Weekly Load Spike', risk: 'Low', value: '+8%', status: 'normal' },
              { factor: 'Sleep Quality', risk: 'Medium', value: '6.2h avg', status: 'warning' },
              { factor: 'RPE Consistency', risk: 'Low', value: '±0.8', status: 'normal' },
              { factor: 'Recovery Score', risk: 'Low', value: '82 avg', status: 'good' },
              { factor: 'Training Monotony', risk: 'Medium', value: '1.4', status: 'warning' },
            ].map((item) => (
              <div key={item.factor} className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium">{item.factor}</div>
                  <div className="text-[10px] text-[var(--color-text-tertiary)]">{item.value}</div>
                </div>
                <Badge variant={
                  item.risk === 'High' ? 'danger' :
                  item.risk === 'Medium' ? 'warning' : 'success'
                }>
                  {item.risk}
                </Badge>
              </div>
            ))}
          </div>
          <PanelDivider />
          <p className="text-[10px] text-[var(--color-text-tertiary)]">
            Based on load monitoring and recovery metrics. Review with sports scientist if any high-risk factors develop.
          </p>
        </Panel>
      </div>
    </div>
  )
}

function GoalsTab() {
  const seasonGoals = [
    {
      id: 'goal-1',
      title: 'Improve weak-foot passing accuracy',
      target: '80% completion rate',
      current: '72%',
      progress: 72,
      deadline: 'End of Season',
      category: 'Technical',
      onTrack: true,
    },
    {
      id: 'goal-2',
      title: 'Increase match rating consistency',
      target: '7.5+ average',
      current: '7.2',
      progress: 85,
      deadline: 'Dec 2026',
      category: 'Performance',
      onTrack: true,
    },
    {
      id: 'goal-3',
      title: 'Reduce defensive errors',
      target: '<1 per match',
      current: '1.3',
      progress: 45,
      deadline: 'Nov 2026',
      category: 'Tactical',
      onTrack: false,
    },
    {
      id: 'goal-4',
      title: 'Complete full 90 minutes',
      target: '100% of matches',
      current: '85%',
      progress: 85,
      deadline: 'Season End',
      category: 'Physical',
      onTrack: true,
    },
  ]

  return (
    <div className="space-y-4">
      <Panel title="Season Goals Progress" subtitle="Performance targets and milestones" fullWidth>
        <div className="grid gap-4 sm:grid-cols-2">
          {seasonGoals.map((goal) => (
            <div
              key={goal.id}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <Badge variant="muted">{goal.category}</Badge>
                <Badge variant={goal.onTrack ? 'success' : 'warning'}>
                  {goal.onTrack ? 'On Track' : 'Needs Attention'}
                </Badge>
              </div>
              <h3 className="mb-2 text-sm font-semibold text-[var(--color-text-primary)]">
                {goal.title}
              </h3>
              <div className="mb-3 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-tertiary)]">Target:</span>
                  <span className="font-medium">{goal.target}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-tertiary)]">Current:</span>
                  <span className="font-medium">{goal.current}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-tertiary)]">Deadline:</span>
                  <span>{goal.deadline}</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span className="font-medium">{goal.progress}%</span>
                </div>
                <ProgressBar
                  value={goal.progress}
                  showValue={false}
                  variant={goal.progress >= 75 ? 'success' : goal.progress >= 50 ? 'warning' : 'danger'}
                  size="sm"
                />
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Monthly Targets" subtitle="Short-term milestones">
          <div className="space-y-3">
            {[
              { target: 'Complete 15 training sessions', progress: 12, total: 15 },
              { target: 'Maintain 7.0+ avg rating', progress: 3, total: 4 },
              { target: 'Score or assist in 3+ matches', progress: 2, total: 3 },
              { target: 'Log 360+ training minutes', progress: 285, total: 360 },
            ].map((item, index) => (
              <div key={index}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-[var(--color-text-secondary)]">{item.target}</span>
                  <span className="tabular-nums text-[var(--color-text-tertiary)]">
                    {item.progress}/{item.total}
                  </span>
                </div>
                <ProgressBar
                  value={(item.progress / item.total) * 100}
                  showValue={false}
                  variant={(item.progress / item.total) >= 0.8 ? 'success' : 'accent'}
                  size="sm"
                />
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Development Areas" subtitle="Focus points for improvement">
          <div className="space-y-3">
            {[
              {
                area: 'Decision Making Speed',
                priority: 'High',
                currentLevel: 'Developing',
                nextMilestone: 'Reduce hesitation by 20%'
              },
              {
                area: 'Aerial Ability',
                priority: 'Medium',
                currentLevel: 'Below Average',
                nextMilestone: 'Win 50% of duels'
              },
              {
                area: 'Long Range Shooting',
                priority: 'Low',
                currentLevel: 'Basic',
                nextMilestone: 'Hit target 60% of time'
              },
            ].map((area) => (
              <div key={area.area} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium">{area.area}</div>
                  <Badge variant={
                    area.priority === 'High' ? 'danger' :
                    area.priority === 'Medium' ? 'warning' : 'muted'
                  }>
                    {area.priority}
                  </Badge>
                </div>
                <div className="text-[10px] text-[var(--color-text-tertiary)]">
                  Current: {area.currentLevel} → Target: {area.nextMilestone}
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  )
}