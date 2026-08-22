import { Navigate, useSearchParams } from 'react-router-dom'

/** @deprecated Resume tab merged into Common App */
export function ActivitiesResumePage() {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab')
  const legacyMap: Record<string, string> = {
    activities: 'experience',
    awards: 'experience',
    projects: 'experience',
  }
  const resolved = tab && legacyMap[tab] ? legacyMap[tab] : tab
  const target = resolved
    ? `/college/common-app?tab=${encodeURIComponent(resolved)}`
    : '/college/common-app?tab=experience'
  return <Navigate to={target} replace />
}
