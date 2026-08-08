import { Navigate } from 'react-router-dom'

/** @deprecated Stats merged into Progression */
export function StatsPage() {
  return <Navigate to="/soccer/progression" replace />
}

/** @deprecated merged into Progression */
export const ProgressChartsPage = StatsPage
