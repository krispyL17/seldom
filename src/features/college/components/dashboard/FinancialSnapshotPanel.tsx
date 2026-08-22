import { Badge } from '@components/ui/Badge'
import { ProgressBar } from '@components/ui/ProgressBar'
import { Panel } from '@components/ui/Panel'
import { MetricCard } from '../shared/MetricCard'
import { useCollege } from '../../hooks/useCollege'
import {
  computeFinancialPlanningStats,
  formatCurrency,
  formatShortDate,
  progressVariant,
} from '../../utils'

export function FinancialSnapshotPanel() {
  const { userData, colleges, isSeniorMode } = useCollege()
  const financialAid = userData?.financialAid ?? []
  const scholarships = userData?.scholarships ?? []
  const stats = computeFinancialPlanningStats(financialAid, scholarships, colleges)

  const hasData = financialAid.length > 0 || scholarships.length > 0 || colleges.some((c) => c.tuition)

  return (
    <Panel
      fillHeight
      title={isSeniorMode ? 'Financial snapshot' : 'Aid & cost overview'}
      subtitle={
        hasData
          ? `${stats.aidCompleted}/${stats.aidTotal} aid steps · ${stats.scholarshipActiveCount} active opportunities`
          : 'Load checklists below to start tracking'
      }
      badge={
        stats.overdueAidCount > 0 ? (
          <Badge variant="danger">{stats.overdueAidCount} overdue</Badge>
        ) : undefined
      }
    >
      {!hasData ? (
        <p className="text-xs text-[var(--color-text-tertiary)]">
          Add colleges with tuition on your list, load the financial aid checklist, and track
          scholarships to see cost estimates and progress here.
        </p>
      ) : (
        <div className="space-y-4">
          <ProgressBar
            value={stats.aidChecklistProgress}
            label="Financial aid checklist"
            variant={progressVariant(stats.aidChecklistProgress)}
            size="sm"
          />

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricCard
              label={isSeniorMode ? 'Awarded' : 'Secured aid'}
              value={stats.scholarshipAwardedTotal > 0 ? formatCurrency(stats.scholarshipAwardedTotal) : '—'}
              subValue={
                stats.scholarshipAwardedTotal > 0
                  ? 'scholarships marked awarded'
                  : 'Mark scholarships awarded'
              }
              variant="success"
            />
            <MetricCard
              label="In progress"
              value={
                stats.scholarshipPendingTotal > 0
                  ? formatCurrency(stats.scholarshipPendingTotal)
                  : stats.scholarshipActiveCount
              }
              subValue={
                stats.scholarshipPendingTotal > 0
                  ? `${stats.scholarshipActiveCount} applications`
                  : 'potential $ if awarded'
              }
              variant="accent"
            />
            <MetricCard
              label="List tuition"
              value={stats.listTuitionTotal > 0 ? formatCurrency(stats.listTuitionTotal) : '—'}
              subValue={
                stats.listTuitionTotal > 0
                  ? `across ${colleges.filter((c) => c.tuition).length} schools`
                  : 'Add tuition on college profiles'
              }
              variant="default"
            />
            <MetricCard
              label="Gap estimate"
              value={stats.listTuitionTotal > 0 ? formatCurrency(stats.netGapEstimate) : '—'}
              subValue="list tuition minus awarded aid"
              variant={stats.netGapEstimate > 0 ? 'warning' : 'success'}
            />
          </div>

          {(stats.nextAidDueDate || stats.nextScholarshipDueDate) && (
            <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)]/50 px-3 py-2 text-xs text-[var(--color-text-secondary)]">
              {stats.nextAidDueDate && stats.nextAidLabel && (
                <p>
                  <span className="font-medium text-[var(--color-text-primary)]">Next aid step:</span>{' '}
                  {stats.nextAidLabel} · {formatShortDate(stats.nextAidDueDate)}
                </p>
              )}
              {stats.nextScholarshipDueDate && stats.nextScholarshipName && (
                <p className={stats.nextAidDueDate ? 'mt-1' : undefined}>
                  <span className="font-medium text-[var(--color-text-primary)]">Next deadline:</span>{' '}
                  {stats.nextScholarshipName} · {formatShortDate(stats.nextScholarshipDueDate)}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </Panel>
  )
}
