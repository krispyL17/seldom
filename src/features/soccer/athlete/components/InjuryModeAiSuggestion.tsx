import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@components/ui/Button'
import { messageSuggestsInjuryMode } from '../injuryMode'
import { useOptionalAthleteDevelopment } from '../../hooks/useAthleteDevelopment'

interface InjuryModeAiSuggestionProps {
  message: string
  visible: boolean
  onDismiss: () => void
}

export function InjuryModeAiSuggestion({ message, visible, onDismiss }: InjuryModeAiSuggestionProps) {
  const athlete = useOptionalAthleteDevelopment()
  const [busy, setBusy] = useState(false)

  if (!visible || !athlete || athlete.development.injuryMode.active) return null
  if (!messageSuggestsInjuryMode(message)) return null

  async function activate() {
    setBusy(true)
    try {
      await athlete!.setInjuryMode(true, 'Suggested from AI Coach conversation', true)
      onDismiss()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-4 mb-2 rounded-[var(--radius-md)] border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/10 p-3">
      <p className="text-xs text-[var(--color-text-secondary)]">
        Your message may indicate an injury or pain.{' '}
        <strong className="text-[var(--color-danger)]">Injury Mode</strong> freezes your training streak and
        prioritizes recovery — without changing your logged data.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" disabled={busy} onClick={() => void activate()}>
          Activate Injury Mode
        </Button>
        <Link
          to="/soccer/recovery"
          className="inline-flex h-7 items-center rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 text-[11px] text-[var(--color-text-secondary)]"
        >
          View Recovery
        </Link>
        <Button size="sm" variant="secondary" onClick={onDismiss}>
          Not now
        </Button>
      </div>
    </div>
  )
}
