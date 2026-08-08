import { Badge } from '@components/ui/Badge'
import { DataRow, Panel } from '@components/ui/Panel'
import type { College } from '../../types'
import { formatCurrency, formatPercent } from '../../utils'

interface BasicInfoSectionProps {
  college: College
}

export function BasicInfoSection({ college }: BasicInfoSectionProps) {
  return (
    <Panel fillHeight title="Basic Information" subtitle={college.location}>
      <div className="space-y-1">
        <DataRow label="Name" value={college.name} />
        <DataRow label="Location" value={college.location} />
        <DataRow
          label="Acceptance rate"
          value={college.acceptanceRate != null ? formatPercent(college.acceptanceRate) : '—'}
        />
        <DataRow
          label="Tuition"
          value={college.tuition != null ? formatCurrency(college.tuition) : '—'}
        />
        <DataRow label="Application type" value={college.applicationType} />
      </div>
      <div className="mt-3">
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-[var(--color-text-tertiary)]">
          Major(s)
        </p>
        <div className="flex flex-wrap gap-1.5">
          {college.majors.map((major) => (
            <Badge key={major} variant="muted">
              {major}
            </Badge>
          ))}
        </div>
      </div>
    </Panel>
  )
}
