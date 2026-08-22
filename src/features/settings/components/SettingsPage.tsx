import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@hooks/useAuth'
import { useUserPreferences } from '@features/preferences'
import { getAuthErrorMessage } from '@lib/authErrors'
import { formatUserError } from '@lib/userFacingError'
import {
  getBrowserNotificationPermission,
  isBrowserNotificationSupported,
  requestBrowserNotificationPermission,
} from '@lib/notifications/browserNotifications'
import { applyThemeFromPreferences } from '@lib/theme'
import { resetWorkspaceForUser } from '@services/workspace/resetWorkspace'
import { SIDEBAR_NAV } from '@config/navigation'
import type { NavTabColors, OverviewInsightMode, ThemeAppearance, ThemePalette, CustomThemes } from '@/types/userPreferences'
import { authService } from '@services/auth'
import { Button } from '@components/ui/Button'
import { Card, CardHeader } from '@components/ui/Card'
import { ThemeSettingsSection } from './ThemeSettingsSection'
import { DataSettingsSection } from './DataSettingsSection'
import { ConfirmActionModal } from './ConfirmActionModal'
import {
  clampReminderMinutes,
  DISPLAY_NAME_MAX,
  PASSION_MAX,
  reminderMinutesInvalid,
  SETTINGS_CHECKBOX_CLASS,
  SETTINGS_INPUT_CLASS,
  settingsFormDirty,
  TAB_LABEL_MAX,
} from './settingsFormUtils'

type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

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
    overviewInsightMode,
    updatePreferences,
    openTutorial,
    reload: reloadPreferences,
  } = useUserPreferences()
  const navigate = useNavigate()

  const savedDisplayName =
    user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? ''

  const [displayName, setDisplayName] = useState(savedDisplayName)
  const [lastSavedDisplayName, setLastSavedDisplayName] = useState(savedDisplayName)
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
      ? (String(reminderLeadMinutes) as '60' | '1440' | '10080')
      : 'custom',
  )
  const [customReminderMinutes, setCustomReminderMinutes] = useState(
    () => String(reminderLeadMinutes || 60),
  )
  const [collegeTabEnabled, setCollegeTabEnabled] = useState(collegeEnabled)
  const [overviewInsight, setOverviewInsight] = useState<OverviewInsightMode>(overviewInsightMode)
  const [resetting, setResetting] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)

  const [signingOut, setSigningOut] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ displayName?: string; reminder?: string }>({})
  const [notificationHint, setNotificationHint] = useState<string | null>(null)

  const saveInFlightRef = useRef(false)
  const autosaveTimerRef = useRef<number | null>(null)

  const leadMinutes = useMemo(
    () =>
      reminderPreset === 'custom'
        ? clampReminderMinutes(customReminderMinutes)
        : Number(reminderPreset),
    [reminderPreset, customReminderMinutes],
  )

  const formSnapshot = useMemo(
    () => ({
      displayName,
      tabLabel,
      passion,
      selectedAppearance,
      selectedPalette,
      selectedCustomThemes,
      selectedNavTabColors,
      animations,
      reminderEnabled,
      leadMinutes,
      collegeTabEnabled,
      overviewInsight,
    }),
    [
      displayName,
      tabLabel,
      passion,
      selectedAppearance,
      selectedPalette,
      selectedCustomThemes,
      selectedNavTabColors,
      animations,
      reminderEnabled,
      leadMinutes,
      collegeTabEnabled,
      overviewInsight,
    ],
  )

  const isDirty = useMemo(
    () =>
      settingsFormDirty(formSnapshot, {
        displayName: lastSavedDisplayName,
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
        overviewInsightMode,
      }),
    [
      formSnapshot,
      lastSavedDisplayName,
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
      overviewInsightMode,
    ],
  )

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
    setOverviewInsight(overviewInsightMode)
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
    overviewInsightMode,
  ])

  useEffect(() => {
    setDisplayName(savedDisplayName)
    setLastSavedDisplayName(savedDisplayName)
  }, [savedDisplayName])

  const validateForm = useCallback((): boolean => {
    const nextErrors: { displayName?: string; reminder?: string } = {}

    if (displayName.trim().length > DISPLAY_NAME_MAX) {
      nextErrors.displayName = `Keep your name to ${DISPLAY_NAME_MAX} characters or fewer.`
    }
    if (reminderEnabled && reminderPreset === 'custom' && reminderMinutesInvalid(customReminderMinutes)) {
      nextErrors.reminder = 'Lead time must be between 5 minutes and 1 week.'
    }

    setFieldErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }, [displayName, reminderEnabled, reminderPreset, customReminderMinutes])

  const persistPreferences = useCallback(async () => {
    if (saveInFlightRef.current) return
    if (!validateForm()) {
      setSaveStatus('error')
      setError('Fix the highlighted fields before saving.')
      return
    }

    saveInFlightRef.current = true
    setError(null)
    setSaveStatus('saving')

    try {
      const trimmedName = displayName.trim().slice(0, DISPLAY_NAME_MAX)
      if (trimmedName && trimmedName !== lastSavedDisplayName.trim()) {
        try {
          await authService.updateDisplayName(trimmedName)
          setLastSavedDisplayName(trimmedName)
          setDisplayName(trimmedName)
        } catch (nameErr) {
          setError(formatUserError(nameErr, 'Could not update your display name. Try again.'))
        }
      }

      await updatePreferences({
        hobby_tab_label: tabLabel.trim().slice(0, TAB_LABEL_MAX) || 'Performance',
        hobby_passion: passion.trim().slice(0, PASSION_MAX),
        theme: selectedAppearance,
        theme_palette: selectedPalette,
        custom_themes: selectedCustomThemes,
        nav_tab_colors: selectedNavTabColors,
        animations_enabled: animations,
        browser_notifications_enabled: reminderEnabled,
        email_notifications_enabled: false,
        reminder_lead_minutes: leadMinutes,
        college_enabled: collegeTabEnabled,
        overview_insight_mode: overviewInsight,
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

      setSaveStatus('saved')
      window.setTimeout(() => setSaveStatus((current) => (current === 'saved' ? 'idle' : current)), 2000)
    } catch (err) {
      setSaveStatus('error')
      setError(formatUserError(err, 'Could not save your settings. Check your connection and try again.'))
    } finally {
      saveInFlightRef.current = false
    }
  }, [
    validateForm,
    displayName,
    lastSavedDisplayName,
    tabLabel,
    passion,
    selectedAppearance,
    selectedPalette,
    selectedCustomThemes,
    selectedNavTabColors,
    animations,
    reminderEnabled,
    leadMinutes,
    collegeTabEnabled,
    overviewInsight,
    updatePreferences,
  ])

  useEffect(() => {
    if (!isDirty) {
      setSaveStatus((current) => (current === 'pending' ? 'idle' : current))
      return
    }

    setSaveStatus('pending')
    if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = window.setTimeout(() => {
      void persistPreferences()
    }, 900)

    return () => {
      if (autosaveTimerRef.current) window.clearTimeout(autosaveTimerRef.current)
    }
  }, [isDirty, persistPreferences])

  useEffect(() => {
    if (!isDirty && saveStatus !== 'saving') return

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty, saveStatus])

  async function handleReminderToggle(enabled: boolean) {
    setNotificationHint(null)
    setReminderEnabled(enabled)

    if (!enabled) return

    if (!isBrowserNotificationSupported()) {
      setNotificationHint('This browser does not support notifications. Reminders will stay in-app only.')
      return
    }

    const permission = getBrowserNotificationPermission()
    if (permission === 'granted') return

    if (permission === 'denied') {
      setNotificationHint('Notifications are blocked in your browser settings. Enable them there to get alerts.')
      return
    }

    const result = await requestBrowserNotificationPermission()
    if (result === 'denied') {
      setNotificationHint('Notifications were not allowed. You can turn them on later in browser settings.')
    }
  }

  async function handleResetWorkspace() {
    if (!user?.id) return
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
      setError(formatUserError(err, 'Reset failed. Try again in a moment.'))
    } finally {
      setResetting(false)
      setResetModalOpen(false)
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

  const saveStatusLabel =
    saveStatus === 'pending'
      ? 'Unsaved changes…'
      : saveStatus === 'saving'
        ? 'Saving…'
        : saveStatus === 'saved'
          ? 'Saved'
          : saveStatus === 'error'
            ? 'Save failed'
            : null

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in pb-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
            Settings
          </h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Account, workspace, and preferences
          </p>
        </div>
        {saveStatusLabel && (
          <p
            className="text-xs font-medium text-[var(--color-text-tertiary)]"
            role="status"
            aria-live="polite"
          >
            {saveStatusLabel}
          </p>
        )}
      </header>

      <Card>
        <CardHeader title="Account" description="Profile and session" />
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">Display name</span>
            <input
              type="text"
              value={displayName}
              maxLength={DISPLAY_NAME_MAX}
              onChange={(e) => {
                setDisplayName(e.target.value)
                if (fieldErrors.displayName) setFieldErrors((prev) => ({ ...prev, displayName: undefined }))
              }}
              className={SETTINGS_INPUT_CLASS}
              aria-invalid={fieldErrors.displayName ? true : undefined}
              aria-describedby={fieldErrors.displayName ? 'display-name-error' : undefined}
            />
            {fieldErrors.displayName && (
              <p id="display-name-error" className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
                {fieldErrors.displayName}
              </p>
            )}
          </label>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-text-tertiary)]">Email</dt>
              <dd className="min-w-0 truncate font-medium text-[var(--color-text-primary)]">
                {user?.email ?? '—'}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--color-text-tertiary)]">Signed in</dt>
              <dd className="font-medium text-[var(--color-text-primary)]">
                {isConfigured ? 'Yes' : 'Local only'}
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
              maxLength={PASSION_MAX}
              onChange={(e) => setPassion(e.target.value)}
              placeholder="e.g. Soccer, Music, Climbing"
              className={SETTINGS_INPUT_CLASS}
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              Performance tab label
            </span>
            <input
              type="text"
              value={tabLabel}
              maxLength={TAB_LABEL_MAX}
              onChange={(e) => setTabLabel(e.target.value)}
              placeholder="e.g. Soccer, Music, Climbing"
              className={SETTINGS_INPUT_CLASS}
            />
          </label>
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-xs font-medium text-[var(--color-text-secondary)]">
                Show Junior Prep tab
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)]">
                Hidden by default — enable when you are a junior or senior exploring schools
              </span>
            </span>
            <input
              type="checkbox"
              checked={collegeTabEnabled}
              onChange={(e) => setCollegeTabEnabled(e.target.checked)}
              className={SETTINGS_CHECKBOX_CLASS}
            />
          </label>
          {collegeTabEnabled && (
            <label className="block">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                Today overview insight
              </span>
              <span className="mt-0.5 block text-xs text-[var(--color-text-tertiary)]">
                Choose whether the bottom-left insight on Today links to Analytics or Junior Prep
              </span>
              <select
                value={overviewInsight}
                onChange={(e) => setOverviewInsight(e.target.value as OverviewInsightMode)}
                className={SETTINGS_INPUT_CLASS}
              >
                <option value="analytics">Analytics insight</option>
                <option value="college">Junior Prep insight</option>
              </select>
            </label>
          )}
          <p className="text-xs leading-relaxed text-[var(--color-text-tertiary)]">
            Analytics has its own tab in the sidebar once you have tasks, sessions, journal entries, or runs logged.
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
        <CardHeader title="Danger zone" description="Reset app data — keeps your account and appearance" />
        <p className="text-xs text-[var(--color-text-secondary)]">
          Clears tasks, goals, sessions, runs, games, and college data. Theme, palette, bookmark colors,
          and distance unit stay saved.
        </p>
        {!isConfigured && (
          <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">
            Sign in with an account to reset synced workspace data.
          </p>
        )}
        <Button
          variant="secondary"
          size="sm"
          className="mt-3 border-[var(--color-danger)] text-[var(--color-danger)]"
          onClick={() => setResetModalOpen(true)}
          disabled={resetting || !isConfigured || !user}
        >
          {resetting ? 'Resetting…' : 'Reset workspace data'}
        </Button>
      </Card>

      <Card>
        <CardHeader title="Seldom AI" description="Assistant, college advisor, and training help" />
        <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
          AI reads your tasks, logs, and deadlines when the assistant backend is online. If features say AI
          is offline, your host may still be setting things up — check status below.
        </p>
        <Link
          to="/settings/ai"
          className="mt-3 inline-flex h-8 items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] px-3 text-xs font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)]"
        >
          Check AI status →
        </Link>
      </Card>

      <Card>
        <CardHeader title="Reminders" description="Tasks, goals, and college deadlines" />
        <div className="space-y-4">
          <label className="flex items-center justify-between gap-4">
            <span>
              <span className="block text-xs font-medium text-[var(--color-text-secondary)]">
                Remind me before deadlines
              </span>
              <span className="text-xs text-[var(--color-text-tertiary)]">
                Browser alerts at 7, 3, and 1 day out, plus your lead time before task due dates
              </span>
            </span>
            <input
              type="checkbox"
              checked={reminderEnabled}
              onChange={(e) => void handleReminderToggle(e.target.checked)}
              className={SETTINGS_CHECKBOX_CLASS}
            />
          </label>
          {notificationHint && (
            <p className="text-xs text-[var(--color-text-tertiary)]" role="status">
              {notificationHint}
            </p>
          )}
          {reminderEnabled && (
            <label className="block">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">Lead time</span>
              <select
                value={reminderPreset}
                onChange={(e) =>
                  setReminderPreset(e.target.value as '60' | '1440' | '10080' | 'custom')
                }
                className={`${SETTINGS_INPUT_CLASS} mt-1.5`}
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
                onChange={(e) => {
                  setCustomReminderMinutes(e.target.value)
                  if (fieldErrors.reminder) setFieldErrors((prev) => ({ ...prev, reminder: undefined }))
                }}
                className={SETTINGS_INPUT_CLASS}
                aria-invalid={fieldErrors.reminder ? true : undefined}
                aria-describedby={fieldErrors.reminder ? 'reminder-error' : undefined}
              />
              {fieldErrors.reminder && (
                <p id="reminder-error" className="mt-1 text-xs text-[var(--color-danger)]" role="alert">
                  {fieldErrors.reminder}
                </p>
              )}
            </label>
          )}
        </div>
      </Card>

      {error && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 bg-[var(--color-surface-overlay)] px-3 py-2"
          role="alert"
        >
          <p className="text-xs text-[var(--color-danger)]">{error}</p>
          {saveStatus === 'error' && (
            <Button size="sm" variant="secondary" onClick={() => void persistPreferences()}>
              Retry save
            </Button>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={handleSignOut} disabled={signingOut || !isConfigured}>
          {signingOut ? 'Signing out…' : 'Sign out'}
        </Button>
      </div>

      <ConfirmActionModal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset workspace data?"
        description={
          <>
            This removes all tasks, goals, training sessions, runs, games, and college data. Your login,
            theme, and appearance settings are kept.
          </>
        }
        confirmLabel="Reset everything"
        onConfirm={handleResetWorkspace}
        loading={resetting}
        destructive
      />
    </div>
  )
}
