import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { getAuthErrorMessage } from '@lib/authErrors'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { AuthLayout } from './AuthLayout'
import { AuthCard } from './AuthCard'

export function SignUpPage() {
  const { signUp, isConfigured } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setSubmitting(true)

    try {
      const result = await signUp({
        email: email.trim(),
        password,
        displayName: displayName.trim() || undefined,
      })

      if (result.needsEmailConfirmation) {
        setSuccess('Check your email to confirm your account, then sign in.')
      } else {
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Create account"
        subtitle="Start building your personal command center"
        footer={
          <>
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-[var(--color-accent-muted)] hover:underline"
            >
              Sign in
            </Link>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            type="text"
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Krist"
          />

          <Input
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />

          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && (
            <p className="rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 px-3 py-2 text-xs text-[var(--color-danger)]" role="alert">
              {error}
            </p>
          )}

          {success && (
            <p className="rounded-[var(--radius-md)] bg-[var(--color-success)]/10 px-3 py-2 text-xs text-[var(--color-success)]" role="status">
              {success}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={submitting || !isConfigured}>
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
