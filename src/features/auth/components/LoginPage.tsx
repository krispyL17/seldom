import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { getAuthErrorMessage } from '@lib/authErrors'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { AuthLayout } from './AuthLayout'
import { AuthCard } from './AuthCard'

export function LoginPage() {
  const { signIn, isConfigured } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      await signIn({ email: email.trim(), password })
      navigate(from, { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to your personal control center"
        footer={
          <>
            Don&apos;t have an account?{' '}
            <Link
              to="/sign-up"
              className="font-medium text-[var(--color-accent-muted)] hover:underline"
            >
              Sign up
            </Link>
          </>
        }
      >
        {!isConfigured && (
          <p className="mb-4 rounded-[var(--radius-md)] border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-3 py-2 text-xs text-[var(--color-warning)]">
            Supabase is not configured. Add credentials to <code>.env.local</code>.
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <div>
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <div className="mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-xs text-[var(--color-accent-muted)] hover:underline"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          {error && (
            <p className="rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 px-3 py-2 text-xs text-[var(--color-danger)]" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={submitting || !isConfigured}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
