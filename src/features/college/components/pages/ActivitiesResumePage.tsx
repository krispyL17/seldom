import { Navigate, useSearchParams } from 'react-router-dom'

/** @deprecated Resume tab merged into Common App */
export function ActivitiesResumePage() {
  const [searchParams] = useSearchParams()
  const tab = searchParams.get('tab')
  const target = tab ? `/college/common-app?tab=${encodeURIComponent(tab)}` : '/college/common-app?tab=activities'
  return <Navigate to={target} replace />
}
