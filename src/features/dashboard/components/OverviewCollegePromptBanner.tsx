import { useEffect, useState } from 'react'
import { TabTintLink } from '@components/ui/TabTintLink'
import { useUserPreferences } from '@features/preferences'

/** One-time nudge after enabling Junior Prep to customize overview insight panel. */
export function OverviewCollegePromptBanner() {
  const { collegeEnabled, preferences, updatePreferences } = useUserPreferences()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (collegeEnabled && !preferences?.overview_college_prompt_dismissed_at) {
      setVisible(true)
    } else {
      setVisible(false)
    }
  }, [collegeEnabled, preferences?.overview_college_prompt_dismissed_at])

  if (!visible) return null

  async function dismiss() {
    await updatePreferences({
      overview_college_prompt_dismissed_at: new Date().toISOString(),
    })
    setVisible(false)
  }

  return (
    <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] px-3 py-2 ring-1 ring-[var(--color-border)]">
      <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
        Junior Prep is on — pick Analytics or College for the insight panel in Settings.
      </p>
      <div className="flex items-center gap-2">
        <TabTintLink
          to="/settings"
          accentNavId="college"
          onClick={() => {
            void dismiss()
          }}
        >
          Settings
        </TabTintLink>
        <button
          type="button"
          className="text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text-secondary)]"
          onClick={() => void dismiss()}
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}
