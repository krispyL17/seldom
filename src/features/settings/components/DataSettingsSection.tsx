import { useRef, useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { useUserPreferences } from '@features/preferences'
import { Button } from '@components/ui/Button'
import { Card, CardHeader } from '@components/ui/Card'
import {
  countExportItems,
  downloadExportBundle,
  exportWorkspaceData,
  importWorkspaceData,
  parseExportBundle,
} from '@services/workspace/exportImport'
import type { ImportMode } from '@/types/exportBundle'

interface DataSettingsSectionProps {
  onError: (message: string | null) => void
}

export function DataSettingsSection({ onError }: DataSettingsSectionProps) {
  const { user, isConfigured } = useAuth()
  const {
    theme,
    themePalette,
    customThemes,
    navTabColors,
    animationsEnabled,
    distanceUnit,
    reload: reloadPreferences,
  } = useUserPreferences()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  async function handleExport() {
    if (!user?.id) return
    onError(null)
    setStatus(null)
    setExporting(true)
    try {
      const bundle = await exportWorkspaceData(user.id)
      downloadExportBundle(bundle)
      setStatus(`Exported ${countExportItems(bundle)} items to seldom-backup-*.json`)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  async function handleImportFile(file: File) {
    if (!user?.id) return

    const replace = confirm(
      'Import data from backup?\n\n' +
        'OK = Replace existing data with the backup\n' +
        'Cancel = Merge (keep existing, add/update from backup)',
    )
    const mode: ImportMode = replace ? 'replace' : 'merge'

    if (
      mode === 'replace' &&
      !confirm(
        'This will wipe your current tasks, goals, sessions, and college data before importing. Continue?',
      )
    ) {
      return
    }

    onError(null)
    setStatus(null)
    setImporting(true)
    try {
      const text = await file.text()
      const bundle = parseExportBundle(text)
      const result = await importWorkspaceData(user.id, bundle, mode, {
        theme,
        theme_palette: themePalette,
        custom_themes: customThemes,
        nav_tab_colors: navTabColors,
        animations_enabled: animationsEnabled,
        distance_unit: distanceUnit,
      })

      await reloadPreferences()

      const total = Object.values(result.imported).reduce((sum, n) => sum + n, 0)
      setStatus(`Imported ${total} items (${mode} mode). Reloading…`)
      setTimeout(() => {
        window.location.href = '/'
      }, 1200)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <Card>
      <CardHeader
        title="Data"
        description="Export your workspace to move it between local dev and the deployed site"
      />
      <p className="text-[11px] leading-relaxed text-[var(--color-text-secondary)]">
        Downloads a JSON backup with tasks, goals, sessions, runs, college data, performance
        profile, custom themes, gym logs, and assistant chats. Sign in on the other environment,
        then import the same file.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => void handleExport()}
          disabled={exporting || importing || !isConfigured || !user}
        >
          {exporting ? 'Exporting…' : 'Export backup'}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={exporting || importing || !isConfigured || !user}
        >
          {importing ? 'Importing…' : 'Import backup'}
        </Button>

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleImportFile(file)
          }}
        />
      </div>

      {status && (
        <p className="mt-3 text-[11px] text-[var(--color-success)]" role="status">
          {status}
        </p>
      )}
    </Card>
  )
}
