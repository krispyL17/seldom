import { Navigate } from 'react-router-dom'

/** @deprecated Essays merged into Common App */
export function CollegeEssaysPage() {
  return <Navigate to="/college/common-app?tab=essays" replace />
}
