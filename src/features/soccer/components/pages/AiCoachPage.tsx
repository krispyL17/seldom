import { Navigate, useSearchParams } from 'react-router-dom'

/** Performance coach is unified under Seldom AI. */
export function AiCoachPage() {
  const [params] = useSearchParams()
  const mode = params.get('mode') ?? 'soccer_drills'
  return <Navigate to={`/assistant?mode=${mode}`} replace />
}
