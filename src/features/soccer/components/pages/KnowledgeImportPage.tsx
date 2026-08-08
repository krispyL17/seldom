import { useRef, useState } from 'react'
import { Button } from '@components/ui/Button'
import { Panel } from '@components/ui/Panel'
import { useAthleteDevelopment } from '../../hooks/useAthleteDevelopment'
import { detectImportType } from '../../knowledge/importParser'

export function KnowledgeImportPage() {
  const { development, importKnowledgeFile } = useAthleteDevelopment()
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    setStatus(null)
    const warnings: string[] = []
    let total = 0

    try {
      for (const file of Array.from(files)) {
        const ext = detectImportType(file.name)
        if (!['markdown', 'text', 'json'].includes(ext)) {
          warnings.push(`${file.name}: unsupported type`)
          continue
        }
        const content = await file.text()
        const result = await importKnowledgeFile(content, file.name)
        total += result.count
        warnings.push(...result.warnings)
      }
      setStatus(`Imported ${total} chunk${total === 1 ? '' : 's'}.${warnings.length ? ` ${warnings.join(' ')}` : ''}`)
    } catch (err) {
      setStatus(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const recent = development.knowledgeImports.slice(-8).reverse()

  return (
    <div className="perf-page-fit grid h-full min-h-0 grid-cols-1 gap-2 overflow-hidden lg:grid-cols-2">
      <Panel fillHeight title="Import existing knowledge" subtitle="Markdown, TXT, or JSON" className="min-h-0">
        <p className="text-xs text-[var(--color-text-secondary)]">
          Upload notes or exports. Seldom parses sections, extracts facts, and categorizes chunks for future
          semantic memory. ChatGPT login is not required — structured files only for now.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".md,.markdown,.txt,.json"
          multiple
          className="mt-3 block w-full text-xs text-[var(--color-text-secondary)]"
          onChange={(e) => void handleFiles(e.target.files)}
        />
        <Button size="sm" className="mt-2" disabled={busy} onClick={() => inputRef.current?.click()}>
          Choose files
        </Button>
        {status && <p className="mt-2 text-xs text-[var(--color-text-tertiary)]">{status}</p>}
      </Panel>

      <Panel fillHeight title="Imported chunks" subtitle={`${development.knowledgeImports.length} stored (max 200)`} className="min-h-0">
        {recent.length === 0 ? (
          <p className="text-xs text-[var(--color-text-tertiary)]">No imports yet.</p>
        ) : (
          <ul className="space-y-2">
            {recent.map((chunk) => (
              <li
                key={chunk.id}
                className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-2"
              >
                <div className="flex flex-wrap items-center gap-2 text-[10px] text-[var(--color-text-tertiary)]">
                  <span className="rounded bg-[var(--color-surface-overlay)] px-1.5 py-0.5 uppercase">
                    {chunk.category}
                  </span>
                  <span>{chunk.sourceFile}</span>
                </div>
                <p className="mt-1 text-xs font-medium text-[var(--color-text-primary)]">{chunk.title}</p>
                <p className="mt-0.5 line-clamp-2 text-[11px] text-[var(--color-text-secondary)]">
                  {chunk.content}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}
