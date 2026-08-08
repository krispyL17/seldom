import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { AuthLayout } from './AuthLayout'
import { AuthCard } from './AuthCard'
import { Button } from '@components/ui/Button'

/** Handles Supabase email-confirmation and magic-link redirects. */
export function AuthCallbackPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (loading) return
    if (user) {
      navigate('/', { replace: true })
      return
    }
    const timer = window.setTimeout(() => setTimedOut(true), 8000)
    return () => window.clearTimeout(timer)
  }, [user, loading, navigate])

  return (
    <AuthLayout>
      <AuthCard
        title={user ? 'Signed in' : timedOut ? 'Link expired or invalid' : 'Confirming your email…'}
        subtitle={
          user
            ? 'Redirecting to your dashboard.'
            : timedOut
              ? 'Request a new confirmation email by signing up again or contact support.'
              : 'Hang on — finishing sign-in.'
        }
      >
        {!user && timedOut && (
          <div className="flex flex-col gap-2">
            <Link to="/login">
              <Button className="w-full">Go to sign in</Button>
            </Link>
            <Link to="/sign-up">
              <Button variant="secondary" className="w-full">
                Sign up again
              </Button>
            </Link>
          </div>
        )}
      </AuthCard>
    </AuthLayout>
  )
}
