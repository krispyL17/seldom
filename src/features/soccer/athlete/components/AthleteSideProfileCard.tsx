import { useState } from 'react'
import { Button } from '@components/ui/Button'
import { useUserPreferences } from '@features/preferences'
import { useAthleteDevelopment } from '../../hooks/useAthleteDevelopment'
import {
  dominantSideLabel,
  inferWeakSide,
  sportUsesFeet,
  sportUsesHands,
  sportUsesSideTracking,
} from '../sideTracking'
import type { SidePreference } from '../types'

const SIDE_OPTIONS: SidePreference[] = ['left', 'right', 'both', 'unknown']

export function AthleteSideProfileCard() {
  const { hobbyPassion } = useUserPreferences()
  const { development, updateSideProfile } = useAthleteDevelopment()
  const { sideProfile } = development
  const [saving, setSaving] = useState(false)

  if (!sportUsesSideTracking(hobbyPassion)) return null

  const usesFeet = sportUsesFeet(hobbyPassion)
  const usesHands = sportUsesHands(hobbyPassion)

  async function setDominant(side: SidePreference) {
    setSaving(true)
    try {
      await updateSideProfile({
        dominantSide: side,
        weakSide: inferWeakSide(side),
        usesSideTracking: true,
      })
    } finally {
      setSaving(false)
    }
  }

  async function setHand(side: SidePreference | 'none') {
    setSaving(true)
    try {
      await updateSideProfile({ preferredHand: side })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] p-3">
      <p className="text-xs font-medium text-[var(--color-text-primary)]">Athlete profile</p>
      <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
        Dominant and weak side tracking for {hobbyPassion || 'your sport'}.
      </p>

      {usesFeet && (
        <fieldset className="mt-3">
          <legend className="mb-1.5 text-xs text-[var(--color-text-secondary)]">Preferred foot</legend>
          <div className="flex flex-wrap gap-1.5">
            {SIDE_OPTIONS.filter((s) => s !== 'unknown').map((side) => (
              <button
                key={side}
                type="button"
                disabled={saving}
                onClick={() => void setDominant(side)}
                className={
                  sideProfile.dominantSide === side
                    ? 'rounded-full bg-[var(--color-accent)] px-2.5 py-1 text-xs text-white'
                    : 'rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)]'
                }
              >
                {dominantSideLabel(side)}
              </button>
            ))}
          </div>
          {sideProfile.weakSide !== 'unknown' && (
            <p className="mt-1 text-xs text-[var(--color-text-tertiary)]">
              Weak side: {dominantSideLabel(sideProfile.weakSide)}
            </p>
          )}
        </fieldset>
      )}

      {usesHands && (
        <fieldset className="mt-3">
          <legend className="mb-1.5 text-xs text-[var(--color-text-secondary)]">Preferred hand</legend>
          <div className="flex flex-wrap gap-1.5">
            {(['left', 'right', 'both', 'none'] as const).map((side) => (
              <button
                key={side}
                type="button"
                disabled={saving}
                onClick={() => void setHand(side)}
                className={
                  sideProfile.preferredHand === side
                    ? 'rounded-full bg-[var(--color-accent)] px-2.5 py-1 text-xs text-white'
                    : 'rounded-full border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)]'
                }
              >
                {side === 'none' ? 'N/A' : dominantSideLabel(side)}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {sideProfile.dominantSide === 'unknown' && usesFeet && (
        <p className="mt-2 text-xs text-[var(--color-warning)]">Set your dominant foot to enable side balance logging.</p>
      )}
    </div>
  )
}

interface SideBalanceFieldsProps {
  dominantPct: number
  weakPct: number
  onChange: (dominant: number, weak: number) => void
  disabled?: boolean
}

export function SideBalanceFields({ dominantPct, weakPct, onChange, disabled }: SideBalanceFieldsProps) {
  function setDominant(value: number) {
    const d = Math.max(0, Math.min(100, value))
    onChange(d, 100 - d)
  }

  return (
    <div className="space-y-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3">
      <p className="text-xs font-medium text-[var(--color-text-secondary)]">Side balance (% of session)</p>
      <div>
        <label className="mb-1 flex justify-between text-xs text-[var(--color-text-tertiary)]">
          <span>Dominant side</span>
          <span>{dominantPct}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={dominantPct}
          disabled={disabled}
          onChange={(e) => setDominant(Number(e.target.value))}
          className="w-full accent-[var(--color-accent)]"
        />
      </div>
      <div>
        <label className="mb-1 flex justify-between text-xs text-[var(--color-text-tertiary)]">
          <span>Weak side</span>
          <span>{weakPct}%</span>
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={weakPct}
          disabled={disabled}
          onChange={(e) => onChange(100 - Number(e.target.value), Number(e.target.value))}
          className="w-full accent-[var(--color-warning)]"
        />
      </div>
    </div>
  )
}

interface InjuryModeControlsProps {
  className?: string
}

export function InjuryModeControls({ className }: InjuryModeControlsProps) {
  const { development, setInjuryMode } = useAthleteDevelopment()
  const [reason, setReason] = useState(development.injuryMode.reason ?? '')
  const [busy, setBusy] = useState(false)

  async function activate() {
    setBusy(true)
    try {
      await setInjuryMode(true, reason || 'Manual activation')
    } finally {
      setBusy(false)
    }
  }

  if (development.injuryMode.active) return null

  return (
    <div className={className}>
      <p className="text-xs font-medium text-[var(--color-text-primary)]">Injury Mode</p>
      <p className="mt-0.5 text-xs text-[var(--color-text-tertiary)]">
        Freezes your streak and prioritizes recovery. Does not change your logged history.
      </p>
      <input
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Optional note (e.g. ankle soreness)"
        className="mt-2 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1.5 text-xs"
      />
      <Button size="sm" variant="secondary" className="mt-2" disabled={busy} onClick={() => void activate()}>
        Activate Injury Mode
      </Button>
    </div>
  )
}
