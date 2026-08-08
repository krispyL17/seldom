import { useEffect, useState } from 'react'
import { Button } from '@components/ui/Button'
import { Input } from '@components/ui/Input'
import { Modal } from '@components/ui/Modal'
import { useAuth } from '@hooks/useAuth'
import { useUserPreferences } from '@features/preferences'
import { readCustomTabsPromptDismissed } from '../promptDismiss'
import { useAthleteDevelopment } from '../../hooks/useAthleteDevelopment'
import { generateSportTabs, slugifyTabLabel } from '../../athlete/sportTabs'
import type { CustomPerformanceTab } from '../../athlete/types'

interface CustomTabsEditorProps {
  onClose?: () => void
}

function ensureUniqueSlugs(tabs: CustomPerformanceTab[]): CustomPerformanceTab[] {
  const used = new Set<string>()
  return tabs.map((tab) => {
    let slug = tab.slug || slugifyTabLabel(tab.label)
    let n = 2
    while (used.has(slug)) {
      slug = `${slugifyTabLabel(tab.label)}-${n++}`
    }
    used.add(slug)
    return { ...tab, slug }
  })
}

export function CustomTabsEditor({ onClose }: CustomTabsEditorProps) {
  const { development, updateCustomTabs, dismissCustomTabsPrompt } = useAthleteDevelopment()
  const { hobbyPassion } = useUserPreferences()
  const [tabs, setTabs] = useState<CustomPerformanceTab[]>(development.customTabs)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTabs(development.customTabs)
  }, [development.customTabs])

  function updateTab(index: number, patch: Partial<CustomPerformanceTab>) {
    setTabs((prev) =>
      prev.map((t, i) => {
        if (i !== index) return t
        const next = { ...t, ...patch }
        if (patch.label) next.slug = slugifyTabLabel(patch.label)
        return next
      }),
    )
  }

  function removeTab(index: number) {
    setTabs((prev) => prev.filter((_, i) => i !== index))
  }

  function restoreSuggestedTabs() {
    if (!hobbyPassion.trim()) return
    setTabs(generateSportTabs(hobbyPassion))
  }

  async function save() {
    setSaving(true)
    try {
      await updateCustomTabs(ensureUniqueSlugs(tabs))
      await dismissCustomTabsPrompt()
      onClose?.()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
        Optional focus areas for {hobbyPassion || 'your sport'} — each tab tracks sessions you tag with
        that focus. Remove all and save to hide them; everything still lives under{' '}
        <strong>Progression</strong> and Overview.
      </p>
      {tabs.length === 0 ? (
        <p className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-text-tertiary)]">
          No focus tabs — save to keep Performance nav minimal.
        </p>
      ) : (
        tabs.map((tab, index) => (
          <div
            key={tab.id}
            className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 sm:grid-cols-[1fr_1fr_auto]"
          >
            <Input
              label="Tab name"
              value={tab.label}
              onChange={(e) => updateTab(index, { label: e.target.value })}
            />
            <Input
              label="Focus hint"
              value={tab.focusHint}
              onChange={(e) => updateTab(index, { focusHint: e.target.value })}
            />
            <div className="flex items-end">
              <Button type="button" variant="secondary" size="sm" onClick={() => removeTab(index)}>
                Remove
              </Button>
            </div>
          </div>
        ))
      )}
      <div className="flex flex-wrap gap-2">
        {tabs.length < 4 && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() =>
              setTabs((prev) => [
                ...prev,
                {
                  id: `custom-${Date.now()}`,
                  label: 'New focus',
                  slug: 'new-focus',
                  focusHint: 'What you are working on',
                },
              ])
            }
          >
            Add focus tab
          </Button>
        )}
        {hobbyPassion.trim() && (
          <Button type="button" variant="secondary" size="sm" onClick={restoreSuggestedTabs}>
            Restore suggested tabs
          </Button>
        )}
      </div>
      <div className="flex justify-end gap-2">
        {onClose && (
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button disabled={saving} onClick={() => void save()}>
          Save tabs
        </Button>
      </div>
    </div>
  )
}

export function CustomTabsPromptBanner() {
  const { user } = useAuth()
  const { development, dismissCustomTabsPrompt, loading } = useAthleteDevelopment()
  const [editing, setEditing] = useState(false)

  const dismissedLocally = user ? readCustomTabsPromptDismissed(user.id) : false
  const hideBanner =
    loading ||
    development.customTabsDisabled ||
    development.customTabsPromptDismissed ||
    dismissedLocally ||
    development.customTabs.length === 0

  if (hideBanner) {
    return null
  }

  return (
    <>
      <div className="rounded-[var(--radius-md)] border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 p-3">
        <p className="text-xs text-[var(--color-text-secondary)]">
          We added optional focus tabs for your sport. Keep, rename, or remove them in Tab preferences.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setEditing(true)}>
            Customize tabs
          </Button>
          <Button size="sm" variant="secondary" onClick={() => void dismissCustomTabsPrompt()}>
            Looks good
          </Button>
        </div>
      </div>
      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Customize performance tabs"
        className="sm:max-w-2xl"
      >
        <CustomTabsEditor onClose={() => setEditing(false)} />
      </Modal>
    </>
  )
}
