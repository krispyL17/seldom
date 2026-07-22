import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { getAuthErrorMessage } from '@lib/authErrors'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { AuthLayout } from './AuthLayout'
import { AuthCard } from './AuthCard'

/**
 * Shown when user clicks the password recovery link from their email.
 * Supabase establishes a recovery session via the URL hash automatically.
 */
export function ResetPasswordPage() {
  const { updatePassword, isAuthenticated, loading } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

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
      await updatePassword(password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AuthLayout>
        <AuthCard title="Reset password" subtitle="Verifying recovery link…">
          <p className="text-sm text-[var(--color-text-tertiary)]">Please wait…</p>
        </AuthCard>
      </AuthLayout>
    )
  }

  if (!isAuthenticated) {
    return (
      <AuthLayout>
        <AuthCard
          title="Link expired"
          subtitle="This password reset link is invalid or has expired"
          footer={
            <Link
              to="/forgot-password"
              className="font-medium text-[var(--color-accent-muted)] hover:underline"
            >
              Request a new link
            </Link>
          }
        >
          <p className="text-sm text-[var(--color-text-secondary)]">
            Password reset links expire after a short time. Request a new one to continue.
          </p>
        </AuthCard>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthCard title="Set new password" subtitle="Choose a strong password for your account">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />

          <Input
            label="Confirm new password"
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

          <Button type="submit" className="w-full" size="lg" disabled={submitting}>
            {submitting ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}
