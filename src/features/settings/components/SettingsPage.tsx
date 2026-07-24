import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { useUserPreferences } from '@features/preferences'
import { getAuthErrorMessage } from '@lib/authErrors'
import { getUserOpenAiKey, setUserOpenAiKey } from '@lib/userOpenAiKey'
import type { DistanceUnit } from '@lib/distanceUnits'
import { authService } from '@services/auth'
import { Button } from '@components/ui/Button'
import { Card, CardHeader } from '@components/ui/Card'
import type { NavTabColors, ThemeAppearance, ThemePalette } from '@/types/userPreferences'
import { DistanceUnitField, ThemeSettingsSection } from './ThemeSettingsSection'

export function SettingsPage() {
  const { user, signOut, isConfigured } = useAuth()
  const {
    hobbyTabLabel,
    hobbyPassion,
    theme,
    themePalette,
    navTabColors,
    animationsEnabled,
    browserNotificationsEnabled,
    distanceUnit,
    collegeEnabled,
    updatePreferences,
    openTutorial,
  } = useUserPreferences()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(
    () => user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? '',
  )
  const [tabLabel, setTabLabel] = useState(hobbyTabLabel)
  const [passion, setPassion] = useState(hobbyPassion)
  const [selectedAppearance, setSelectedAppearance] = useState<ThemeAppearance>(theme)
  const [selectedPalette, setSelectedPalette] = useState<ThemePalette>(themePalette)
  const [selectedNavTabColors, setSelectedNavTabColors] = useState<NavTabColors>(navTabColors)
  const [animations, setAnimations] = useState(animationsEnabled)
  const [reminderEnabled, setReminderEnabled] = useState(browserNotificationsEnabled)
  const [selectedDistanceUnit, setSelectedDistanceUnit] = useState<DistanceUnit>(distanceUnit)
  const [collegeTabEnabled, setCollegeTabEnabled] = useState(collegeEnabled)
  const [openAiKey, setOpenAiKey] = useState(() => getUserOpenAiKey() ?? '')

  const [signingOut, setSigningOut] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTabLabel(hobbyTabLabel)
    setPassion(hobbyPassion)
    setSelectedAppearance(theme)
    setSelectedPalette(themePalette)
    setSelectedNavTabColors(navTabColors)
    setAnimations(animationsEnabled)
    setReminderEnabled(browserNotificationsEnabled)
    setSelectedDistanceUnit(distanceUnit)
    setCollegeTabEnabled(collegeEnabled)
    setOpenAiKey(getUserOpenAiKey() ?? '')
  }, [
    hobbyTabLabel,
    hobbyPassion,
    theme,
    themePalette,
    navTabColors,
    animationsEnabled,
    browserNotificationsEnabled,
    distanceUnit,
    collegeEnabled,
  ])

  useEffect(() => {
    const name = user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? ''
    setDisplayName(name)
  }, [user?.user_metadata?.display_name, user?.email])

  async function handleSavePreferences() {
    setError(null)
    setSaving(true)
    setSaved(false)
    const appearanceChanged =
      selectedAppearance !== theme ||
      selectedPalette !== themePalette ||
      JSON.stringify(selectedNavTabColors) !== JSON.stringify(navTabColors) ||
      animations !== animationsEnabled
    try {
      const trimmedName = displayName.trim()
      if (trimmedName && trimmedName !== user?.user_metadata?.display_name) {
        await authService.updateDisplayName(trimmedName)
      }

      await updatePreferences({
        hobby_tab_label: tabLabel.trim() || 'Performance',
        hobby_passion: passion.trim(),
        theme: selectedAppearance,
        theme_palette: selectedPalette,
        nav_tab_colors: selectedNavTabColors,
        animations_enabled: animations,
        browser_notifications_enabled: reminderEnabled,
        email_notifications_enabled: false,
        reminder_lead_minutes: 60,
        distance_unit: selectedDistanceUnit,
        college_enabled: collegeTabEnabled,
      })
      setUserOpenAiKey(openAiKey.trim() || null)
      if (appearanceChanged) {
        window.location.reload()
        return
      }
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
          Account, workspace, and preferences
        </p>
      </header>

      <Card>
        <CardHeader title="Account" description="Profile and session" />
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">Display name</span>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1.5 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2 text-sm text-[var(--color-text-primary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
          </label>
          <dl className="space-y-2 text-sm">
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
          <Button variant="secondary" size="sm" onClick={openTutorial}>
            Replay welcome setup
          </Button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Workspace" description="Tabs and optional modules" />
        <div className="space-y-4">
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
            <input
              type="text"
              value={tabLabel}
              onChange={(e) => setTabLabel(e.target.value)}
              placeholder="e.g. Soccer, Music, Climbing"
              className="mt-1.5 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-xs font-medium text-[var(--color-text-secondary)]">
                Show Junior Prep tab
              </span>
              <span className="text-[11px] text-[var(--color-text-tertiary)]">
                Hidden by default — enable when you are a junior or senior exploring schools
              </span>
            </span>
            <input
              type="checkbox"
              checked={collegeTabEnabled}
              onChange={(e) => setCollegeTabEnabled(e.target.checked)}
              className="h-4 w-4 rounded accent-[var(--color-accent)]"
            />
          </label>
          <p className="text-[11px] leading-relaxed text-[var(--color-text-tertiary)]">
            The <strong>Analytics</strong> tab unlocks automatically in the sidebar once you log tasks,
            sessions, journal entries, or runs. Home shows a summary until then.
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader title="Appearance" description="Palette, brightness, sidebar bookmarks, and motion" />
        <ThemeSettingsSection
          themePalette={selectedPalette}
          themeAppearance={selectedAppearance}
          navTabColors={selectedNavTabColors}
          animationsEnabled={animations}
          onPaletteChange={setSelectedPalette}
          onAppearanceChange={setSelectedAppearance}
          onNavTabColorsChange={setSelectedNavTabColors}
          onAnimationsChange={setAnimations}
        />
        <div className="mt-5 border-t border-[var(--color-border)] pt-5">
          <DistanceUnitField value={selectedDistanceUnit} onChange={setSelectedDistanceUnit} />
        </div>
      </Card>

      <Card>
        <CardHeader title="Seldom AI" description="Optional OpenAI key" />
        <label className="block">
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
            OpenAI API key
          </span>
          <p className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
            Stored on this device only. Powers Seldom AI when the server key is not configured.
          </p>
          <input
            type="password"
            value={openAiKey}
            onChange={(e) => setOpenAiKey(e.target.value)}
            placeholder="sk-…"
            autoComplete="off"
            className="mt-1.5 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] focus:border-[var(--color-accent)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          />
        </label>
      </Card>

      <Card>
        <CardHeader title="Reminders" description="Task deadlines" />
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block text-xs font-medium text-[var(--color-text-secondary)]">
              Remind me before deadlines
            </span>
            <span className="text-[11px] text-[var(--color-text-tertiary)]">
              Desktop notification one hour before a task is due
            </span>
          </span>
          <input
            type="checkbox"
            checked={reminderEnabled}
            onChange={(e) => setReminderEnabled(e.target.checked)}
            className="h-4 w-4 rounded accent-[var(--color-accent)]"
          />
        </label>
      </Card>

      {error && (
        <p className="text-xs text-[var(--color-danger)]" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleSavePreferences} disabled={saving}>
          {saving ? 'Saving…' : saved ? 'Saved' : 'Save preferences'}
        </Button>
        <Button variant="secondary" onClick={handleSignOut} disabled={signingOut || !isConfigured}>
          {signingOut ? 'Signing out…' : 'Sign out'}
        </Button>
      </div>
    </div>
  )
}
