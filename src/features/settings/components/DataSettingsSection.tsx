import { useRef, useState } from 'react'
import { useAuth } from '@hooks/useAuth'
import { useUserPreferences } from '@features/preferences'
import { formatUserError } from '@lib/userFacingError'
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
import { Modal, ModalFooter } from '@components/ui/Modal'
import { ConfirmActionModal } from './ConfirmActionModal'

interface DataSettingsSectionProps {
  onError: (message: string | null) => void
}

type ImportStep = 'mode' | 'confirm-replace' | null

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
  const pendingFileRef = useRef<File | null>(null)
  const [exporting, setExporting] = useState(false)
  const [importing, setImporting] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [importStep, setImportStep] = useState<ImportStep>(null)
  const [selectedMode, setSelectedMode] = useState<ImportMode>('merge')

  async function handleExport() {
    if (!user?.id) return
    onError(null)
    setStatus(null)
    setExporting(true)
    try {
      const bundle = await exportWorkspaceData(user.id)
      downloadExportBundle(bundle)
      setStatus(`Downloaded backup with ${countExportItems(bundle)} items.`)
    } catch (err) {
      onError(formatUserError(err, 'Export failed. Try again in a moment.'))
    } finally {
      setExporting(false)
    }
  }

  function closeImportFlow() {
    if (importing) return
    setImportStep(null)
    pendingFileRef.current = null
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function runImport(mode: ImportMode) {
    const file = pendingFileRef.current
    if (!user?.id || !file) return

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
      setStatus(`Imported ${total} items. Reloading…`)
      closeImportFlow()
      window.setTimeout(() => {
        window.location.href = '/'
      }, 1200)
    } catch (err) {
      onError(formatUserError(err, 'Import failed. Check the file and try again.'))
      closeImportFlow()
    } finally {
      setImporting(false)
    }
  }

  function handleImportModeChoice(mode: ImportMode) {
    setSelectedMode(mode)
    if (mode === 'replace') {
      setImportStep('confirm-replace')
      return
    }
    setImportStep(null)
    void runImport('merge')
  }

  return (
    <>
      <Card>
        <CardHeader title="Data" description="Back up or move your workspace" />
        <p className="text-xs leading-relaxed text-[var(--color-text-secondary)]">
          Download a JSON backup with tasks, goals, sessions, college data, and preferences. Sign in on
          another device, then import the same file to pick up where you left off.
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
              if (!file) return
              pendingFileRef.current = file
              setSelectedMode('merge')
              setImportStep('mode')
            }}
          />
        </div>

        {status && (
          <p className="mt-3 text-xs text-[var(--color-success)]" role="status">
            {status}
          </p>
        )}
      </Card>

      <Modal open={importStep === 'mode'} onClose={closeImportFlow} title="Import backup" size="sm">
        <div className="space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)]">
            Choose how this backup should apply to your current workspace.
          </p>
          <div className="space-y-2">
            <button
              type="button"
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--color-surface-overlay)]"
              onClick={() => handleImportModeChoice('merge')}
              disabled={importing}
            >
              <span className="block font-medium text-[var(--color-text-primary)]">Merge</span>
              <span className="mt-0.5 block text-xs text-[var(--color-text-tertiary)]">
                Keep what you have and add or update items from the backup.
              </span>
            </button>
            <button
              type="button"
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-danger)]/40 px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--color-surface-overlay)]"
              onClick={() => handleImportModeChoice('replace')}
              disabled={importing}
            >
              <span className="block font-medium text-[var(--color-danger)]">Replace everything</span>
              <span className="mt-0.5 block text-xs text-[var(--color-text-tertiary)]">
                Wipe current tasks, goals, sessions, and college data, then import the backup.
              </span>
            </button>
          </div>
        </div>
        <ModalFooter>
          <Button type="button" variant="secondary" size="sm" onClick={closeImportFlow} disabled={importing}>
            Cancel
          </Button>
        </ModalFooter>
      </Modal>

      <ConfirmActionModal
        open={importStep === 'confirm-replace'}
        onClose={closeImportFlow}
        title="Replace all workspace data?"
        description={
          <>
            This permanently removes your current tasks, goals, sessions, runs, and college data before
            importing the backup. This cannot be undone.
          </>
        }
        confirmLabel="Replace and import"
        onConfirm={() => void runImport(selectedMode)}
        loading={importing}
        destructive
      />
    </>
  )
}
