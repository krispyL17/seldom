import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { getAuthErrorMessage } from '@lib/authErrors'
import { Button } from '@components/ui/Button'
import { Card, CardHeader } from '@components/ui/Card'

export function SettingsPage() {
  const { user, signOut, isConfigured } = useAuth()
  const navigate = useNavigate()
  const [signingOut, setSigningOut] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignOut() {
    setError(null)
    setSigningOut(true)
    try {
      await signOut()
      navigate('/login', { replace: true })
    } catch (err) {
      setError(getAuthErrorMessage(err))
    } finally {
      setSigningOut(false)
    }
  }

  const displayName =
    user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? 'User'

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Settings
        </h2>
        <p className="mt-1 text-[var(--color-text-secondary)]">
          Manage your account and preferences
        </p>
      </header>

      <Card>
        <CardHeader title="Account" description="Your Seldom profile" />
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--color-text-tertiary)]">Name</dt>
            <dd className="font-medium text-[var(--color-text-primary)]">{displayName}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--color-text-tertiary)]">Email</dt>
            <dd className="font-medium text-[var(--color-text-primary)]">{user?.email ?? '—'}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[var(--color-text-tertiary)]">Supabase</dt>
            <dd className="font-medium text-[var(--color-text-primary)]">
              {isConfigured ? 'Connected' : 'Not configured'}
            </dd>
          </div>
        </dl>

        {error && (
          <p className="mt-4 text-xs text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}

        <div className="mt-6 border-t border-[var(--color-border)] pt-4">
          <Button
            variant="secondary"
            onClick={handleSignOut}
            disabled={signingOut || !isConfigured}
          >
            {signingOut ? 'Signing out…' : 'Sign out'}
          </Button>
        </div>
      </Card>
    </div>
  )
}
