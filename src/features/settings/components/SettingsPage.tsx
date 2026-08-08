import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { useUserPreferences } from '@features/preferences'
import { getAuthErrorMessage } from '@lib/authErrors'
import { applyThemeFromPreferences } from '@lib/theme'
import { resetWorkspaceForUser } from '@services/workspace/resetWorkspace'
import { SIDEBAR_NAV } from '@config/navigation'
import type { NavTabColors, ThemeAppearance, ThemePalette, CustomThemes } from '@/types/userPreferences'
import { authService } from '@services/auth'
import { Button } from '@components/ui/Button'
import { Card, CardHeader } from '@components/ui/Card'
import { ThemeSettingsSection } from './ThemeSettingsSection'
import { DataSettingsSection } from './DataSettingsSection'

export function SettingsPage() {
  const { user, signOut, isConfigured } = useAuth()
  const {
    hobbyTabLabel,
    hobbyPassion,
    theme,
    themePalette,
    customThemes,
    navTabColors,
    animationsEnabled,
    browserNotificationsEnabled,
    reminderLeadMinutes,
    distanceUnit,
    collegeEnabled,
    updatePreferences,
    openTutorial,
    reload: reloadPreferences,
  } = useUserPreferences()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState(
    () => user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? '',
  )
  const [tabLabel, setTabLabel] = useState(hobbyTabLabel)
  const [passion, setPassion] = useState(hobbyPassion)
  const [selectedAppearance, setSelectedAppearance] = useState<ThemeAppearance>(theme)
  const [selectedPalette, setSelectedPalette] = useState<ThemePalette>(themePalette)
  const [selectedCustomThemes, setSelectedCustomThemes] = useState<CustomThemes>(customThemes)
  const [selectedNavTabColors, setSelectedNavTabColors] = useState<NavTabColors>(navTabColors)
  const [animations, setAnimations] = useState(animationsEnabled)
  const [reminderEnabled, setReminderEnabled] = useState(browserNotificationsEnabled)
  const [reminderPreset, setReminderPreset] = useState<'60' | '1440' | '10080' | 'custom'>(() =>
    reminderLeadMinutes === 60 || reminderLeadMinutes === 1440 || reminderLeadMinutes === 10080
      ? String(reminderLeadMinutes) as '60' | '1440' | '10080'
      : 'custom',
  )
  const [customReminderMinutes, setCustomReminderMinutes] = useState(
    () => String(reminderLeadMinutes || 60),
  )
  const [collegeTabEnabled, setCollegeTabEnabled] = useState(collegeEnabled)
  const [resetting, setResetting] = useState(false)

  const [signingOut, setSigningOut] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTabLabel(hobbyTabLabel)
    setPassion(hobbyPassion)
    setSelectedAppearance(theme)
    setSelectedPalette(themePalette)
    setSelectedCustomThemes(customThemes)
    setSelectedNavTabColors(navTabColors)
    setAnimations(animationsEnabled)
    setReminderEnabled(browserNotificationsEnabled)
    const preset =
      reminderLeadMinutes === 60 || reminderLeadMinutes === 1440 || reminderLeadMinutes === 10080
        ? (String(reminderLeadMinutes) as '60' | '1440' | '10080')
        : 'custom'
    setReminderPreset(preset)
    setCustomReminderMinutes(String(reminderLeadMinutes || 60))
    setCollegeTabEnabled(collegeEnabled)
  }, [
    hobbyTabLabel,
    hobbyPassion,
    theme,
    themePalette,
    customThemes,
    navTabColors,
    animationsEnabled,
    browserNotificationsEnabled,
    reminderLeadMinutes,
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
    try {
      const trimmedName = displayName.trim()
      if (trimmedName && trimmedName !== user?.user_metadata?.display_name) {
        try {
          await authService.updateDisplayName(trimmedName)
        } catch (nameErr) {
          setError(
            nameErr instanceof Error
              ? `Display name not updated: ${nameErr.message}`
              : 'Display name not updated',
          )
        }
      }

      const leadMinutes =
        reminderPreset === 'custom'
          ? Math.max(5, Math.min(10_080, Number(customReminderMinutes) || 60))
          : Number(reminderPreset)

      await updatePreferences({
        hobby_tab_label: tabLabel.trim() || 'Performance',
        hobby_passion: passion.trim(),
        theme: selectedAppearance,
        theme_palette: selectedPalette,
        custom_themes: selectedCustomThemes,
        nav_tab_colors: selectedNavTabColors,
        animations_enabled: animations,
        browser_notifications_enabled: reminderEnabled,
        email_notifications_enabled: false,
        reminder_lead_minutes: leadMinutes,
        college_enabled: collegeTabEnabled,
      })
      const navIds = SIDEBAR_NAV.map((item) => item.id)
      applyThemeFromPreferences(
        selectedPalette,
        selectedAppearance,
        animations,
        selectedNavTabColors,
        navIds,
        selectedCustomThemes,
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  async function handleResetWorkspace() {
    if (!user?.id) return
    if (
      !confirm(
        'Reset all tasks, goals, sessions, runs, and college data?\n\nYour login and appearance settings (theme, bookmarks, km/mi) are kept.',
      )
    ) {
      return
    }
    setError(null)
    setResetting(true)
    try {
      await resetWorkspaceForUser(user.id, {
        theme: selectedAppearance,
        theme_palette: selectedPalette,
        custom_themes: selectedCustomThemes,
        nav_tab_colors: selectedNavTabColors,
        animations_enabled: animations,
        distance_unit: distanceUnit,
      })
      await reloadPreferences()
      window.location.href = '/'
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed')
    } finally {
      setResetting(false)
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
            The <strong>Analytics</strong> tab shows cross-app trends once you log tasks, sessions,
            journal entries, or runs. The dashboard summarizes progress until then.
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader title="Appearance" description="Palette, brightness, sidebar bookmarks, and motion" />
        <ThemeSettingsSection
          themePalette={selectedPalette}
          themeAppearance={selectedAppearance}
          customThemes={selectedCustomThemes}
          navTabColors={selectedNavTabColors}
          animationsEnabled={animations}
          onPaletteChange={setSelectedPalette}
          onAppearanceChange={setSelectedAppearance}
          onCustomThemesChange={setSelectedCustomThemes}
          onNavTabColorsChange={setSelectedNavTabColors}
          onAnimationsChange={setAnimations}
        />
      </Card>

      <DataSettingsSection onError={setError} />

      <Card>
        <CardHeader title="Danger zone" description="Reset app data — keeps your account & appearance" />
        <p className="text-[11px] text-[var(--color-text-secondary)]">
          Clears tasks, goals, sessions, runs, games, and college data. Theme, palette, bookmark colors, and distance unit stay saved.
        </p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => void handleResetWorkspace()} disabled={resetting || !isConfigured}>
          {resetting ? 'Resetting…' : 'Reset workspace data'}
        </Button>
      </Card>

      <Card>
        <CardHeader title="Seldom AI" description="Powered by local Ollama" />
        <p className="text-[11px] text-[var(--color-text-secondary)]">
          All AI features use Ollama on your machine. Configure <code className="text-[10px]">OLLAMA_MODEL</code>{' '}
          and <code className="text-[10px]">OLLAMA_BASE_URL</code> in <code className="text-[10px]">.env.local</code>,
          then run <code className="text-[10px]">npm run dev:vercel</code>.
        </p>
        <Link
          to="/settings/ai"
          className="mt-3 inline-flex h-8 items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-[11px] font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)]"
        >
          View AI status →
        </Link>
      </Card>

      <Card>
        <CardHeader title="Reminders" description="Task deadlines" />
        <div className="space-y-4">
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-xs font-medium text-[var(--color-text-secondary)]">
                Remind me before deadlines
              </span>
              <span className="text-[11px] text-[var(--color-text-tertiary)]">
                Desktop notification ahead of a task due date
              </span>
            </span>
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => setReminderEnabled(e.target.checked)}
              className="h-4 w-4 rounded accent-[var(--color-accent)]"
            />
          </label>
          {reminderEnabled && (
            <label className="block">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">Lead time</span>
              <select
                value={reminderPreset}
                onChange={(e) =>
                  setReminderPreset(e.target.value as '60' | '1440' | '10080' | 'custom')
                }
                className="mt-1.5 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
              >
                <option value="60">1 hour before</option>
                <option value="1440">1 day before</option>
                <option value="10080">1 week before</option>
                <option value="custom">Custom…</option>
              </select>
            </label>
          )}
          {reminderEnabled && reminderPreset === 'custom' && (
            <label className="block">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                Custom lead time (minutes)
              </span>
              <input
                type="number"
                min={5}
                max={10080}
                step={5}
                value={customReminderMinutes}
                onChange={(e) => setCustomReminderMinutes(e.target.value)}
                className="mt-1.5 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2 text-sm text-[var(--color-text-primary)]"
              />
            </label>
          )}
        </div>
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
