import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { getAuthErrorMessage } from '@lib/authErrors'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { AuthLayout } from './AuthLayout'
import { AuthCard } from './AuthCard'

export function ForgotPasswordPage() {
  const { resetPassword, isConfigured } = useAuth()

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setSubmitting(true)

    try {
      await resetPassword(email.trim())
      setSuccess(true)
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Reset password"
        subtitle="We'll send a recovery link to your email"
        footer={
          <Link
            to="/login"
            className="font-medium text-[var(--color-accent-muted)] hover:underline"
          >
            Back to sign in
          </Link>
        }
      >
        {success ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-[var(--color-text-secondary)]">
              If an account exists for <strong className="text-[var(--color-text-primary)]">{email}</strong>, you will receive a password reset link shortly.
            </p>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Check your spam folder if you don&apos;t see it within a few minutes.
            </p>
          </div>
        ) : (
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

            {error && (
              <p className="rounded-[var(--radius-md)] bg-[var(--color-danger)]/10 px-3 py-2 text-xs text-[var(--color-danger)]" role="alert">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={submitting || !isConfigured}>
              {submitting ? 'Sending…' : 'Send reset link'}
            </Button>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  )
}
