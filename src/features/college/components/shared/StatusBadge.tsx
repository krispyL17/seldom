import { Badge } from '@components/ui/Badge'
import type { ApplicationStatus } from '../../types'
import { statusBadgeVariant, statusLabel } from '../../utils'

interface StatusBadgeProps {
  status: ApplicationStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={statusBadgeVariant(status)}>{statusLabel(status)}</Badge>
}
