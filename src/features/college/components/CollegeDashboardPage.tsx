import { Navigate } from 'react-router-dom'

/** @deprecated Use /college overview tab */
export function CollegeDashboardPage() {
  return <Navigate to="/college" replace />
}
