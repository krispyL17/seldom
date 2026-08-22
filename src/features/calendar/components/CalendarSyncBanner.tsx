import { useState } from 'react'
import { Button } from '@components/ui/Button'
import { useUserPreferences } from '@features/preferences'
import {
  getBrowserNotificationPermission,
  isBrowserNotificationSupported,
  requestBrowserNotificationPermission,
} from '@lib/notifications/browserNotifications'
import type { CalendarEvent } from '../utils/calendarEvents'
import { downloadIcsCalendar } from '../utils/calendarEvents'

interface CalendarSyncBannerProps {
  events: CalendarEvent[]
}

export function CalendarSyncBanner({ events }: CalendarSyncBannerProps) {
  const { updatePreferences } = useUserPreferences()
  const [permission, setPermission] = useState(getBrowserNotificationPermission())
  const [message, setMessage] = useState<string | null>(null)

  async function enableDeviceReminders() {
    setMessage(null)
    if (!isBrowserNotificationSupported()) {
      setMessage('This browser does not support desktop notifications.')
      return
    }
    const result = await requestBrowserNotificationPermission()
    setPermission(result)
    if (result === 'granted') {
      await updatePreferences({
        browser_notifications_enabled: true,
        calendar_sync_prompted_at: new Date().toISOString(),
      })
      setMessage('Desktop reminders enabled. Seldom will notify you before task deadlines.')
    } else if (result === 'denied') {
      setMessage('Notifications blocked. Enable them in your browser or system settings.')
    }
  }

  function exportToDeviceCalendar() {
    if (events.length === 0) {
      setMessage('Add tasks or goals with dates first, then export again.')
      return
    }
    downloadIcsCalendar(events)
    void updatePreferences({ calendar_sync_prompted_at: new Date().toISOString() })
    setMessage(
      'Calendar file downloaded. Open it to add events to Apple Calendar, Google Calendar, or Outlook.',
    )
  }

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 animate-fade-in">
      <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
        Sync with your device
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-secondary)]">
        Seldom cannot read your phone calendar directly from the browser. For time-sensitive
        reminders, enable desktop notifications or export an .ics file to your calendar app.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => void enableDeviceReminders()}>
          {permission === 'granted' ? 'Reminders enabled' : 'Enable desktop reminders'}
        </Button>
        <Button size="sm" variant="secondary" onClick={exportToDeviceCalendar}>
          Export to calendar app
        </Button>
      </div>
      {message && (
        <p className="mt-3 text-xs text-[var(--color-text-tertiary)]" role="status">
          {message}
        </p>
      )}
    </div>
  )
}
