import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { useUserPreferences } from '@features/preferences'
import { getAuthErrorMessage } from '@lib/authErrors'
import { authService } from '@services/auth'
import { Button } from '@components/ui/Button'
import { Card, CardHeader } from '@components/ui/Card'
import type { AppTheme } from '@/types/userPreferences'

export function SettingsPage() {
  const { user, signOut, isConfigured } = useAuth()
  const {
    hobbyTabLabel,
    hobbyPassion,
    theme,
    animationsEnabled,
    browserNotificationsEnabled,
    emailNotificationsEnabled,
    reminderLeadMinutes,
    updatePreferences,
    openTutorial,
  } = useUserPreferences()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(
    () => user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? '',
  )
  const [tabLabel, setTabLabel] = useState(hobbyTabLabel)
  const [passion, setPassion] = useState(hobbyPassion)
  const [selectedTheme, setSelectedTheme] = useState<AppTheme>(theme)
  const [animations, setAnimations] = useState(animationsEnabled)
  const [browserNotifs, setBrowserNotifs] = useState(browserNotificationsEnabled)
  const [emailNotifs, setEmailNotifs] = useState(emailNotificationsEnabled)
  const [reminderLead, setReminderLead] = useState(reminderLeadMinutes)

  const [signingOut, setSigningOut] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTabLabel(hobbyTabLabel)
    setPassion(hobbyPassion)
    setSelectedTheme(theme)
    setAnimations(animationsEnabled)
    setBrowserNotifs(browserNotificationsEnabled)
    setEmailNotifs(emailNotificationsEnabled)
    setReminderLead(reminderLeadMinutes)
  }, [hobbyTabLabel, hobbyPassion, theme, animationsEnabled, browserNotificationsEnabled, emailNotificationsEnabled, reminderLeadMinutes])

  useEffect(() => {
    const name = user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? ''
    setDisplayName(name)
  }, [user?.user_metadata?.display_name, user?.email])

  async function handleSavePreferences() {
    setError(null)
    setSaving(true)
    setSaved(false)
    try {
      const trimmedName = displayName.trim()
      if (trimmedName && trimmedName !== user?.user_metadata?.display_name) {
        await authService.updateDisplayName(trimmedName)
      }

      await updatePreferences({
        hobby_tab_label: tabLabel.trim() || 'Performance',
        hobby_passion: passion.trim(),
        theme: selectedTheme,
        animations_enabled: animations,
        browser_notifications_enabled: browserNotifs,
        email_notifications_enabled: emailNotifs,
        reminder_lead_minutes: reminderLead,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

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

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <header>
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Settings
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Account, appearance, and workspace personalization
        </p>
      </header>

      <Card>
        <CardHeader title="Personalization" description="Make Seldom yours" />
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              Display name
            </span>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1.5 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              Main passion / hobby
            </span>
            <input
              type="text"
              value={passion}
              onChange={(e) => setPassion(e.target.value)}
              placeholder="e.g. Soccer, Music, Climbing"
              className="mt-1.5 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              Performance tab label
            </span>
            <p className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
              Shown in the sidebar for your training & metrics workspace
            </p>
            <input
              type="text"
              value={tabLabel}
              onChange={(e) => setTabLabel(e.target.value)}
              placeholder="e.g. Soccer, Music, Climbing"
              className="mt-1.5 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader title="Notifications" description="Reminders and alerts" />
        <div className="space-y-4">
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-xs font-medium text-[var(--color-text-secondary)]">
                Desktop pop-ups
              </span>
              <span className="text-[11px] text-[var(--color-text-tertiary)]">
                Browser notifications when tasks are due
              </span>
            </span>
            <input
              type="checkbox"
              checked={browserNotifs}
              onChange={(e) => setBrowserNotifs(e.target.checked)}
              className="h-4 w-4 rounded accent-[var(--color-accent)]"
            />
          </label>

          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-xs font-medium text-[var(--color-text-secondary)]">
                Email reminders
              </span>
              <span className="text-[11px] text-[var(--color-text-tertiary)]">
                Sent to {user?.email ?? 'your account email'} (requires Resend on deploy)
              </span>
            </span>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="h-4 w-4 rounded accent-[var(--color-accent)]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              Remind me before deadline
            </span>
            <select
              value={reminderLead}
              onChange={(e) => setReminderLead(Number(e.target.value))}
              className="mt-1.5 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={120}>2 hours</option>
              <option value={1440}>1 day</option>
            </select>
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader title="Appearance" description="Theme and motion" />
        <div className="space-y-4">
          <fieldset>
            <legend className="text-xs font-medium text-[var(--color-text-secondary)]">Theme</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {(['dark', 'light', 'system'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedTheme(option)}
                  className={`rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs capitalize transition-colors ${
                    selectedTheme === option
                      ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-text-primary)]'
                      : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-xs font-medium text-[var(--color-text-secondary)]">
                Interface animations
              </span>
              <span className="text-[11px] text-[var(--color-text-tertiary)]">
                Panel transitions, page entrances, and tour effects
              </span>
            </span>
            <input
              type="checkbox"
              checked={animations}
              onChange={(e) => setAnimations(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent)]"
            />
          </label>
        </div>
      </Card>

      <Card>
        <CardHeader title="Tutorial" description="Learn the workspace" />
        <p className="text-sm text-[var(--color-text-secondary)]">
          Replay the welcome tour — Seldom OS intro, personalization, and a walkthrough of each
          module.
        </p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={openTutorial}>
          Replay welcome tour
        </Button>
      </Card>

      <Card>
        <CardHeader title="Account" description="Your Seldom profile" />
        <dl className="space-y-3 text-sm">
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

        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-4">
          <Button onClick={handleSavePreferences} disabled={saving}>
            {saving ? 'Saving…' : saved ? 'Saved' : 'Save preferences'}
          </Button>
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
