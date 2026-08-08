import { Button } from '@components/ui/Button'
import { Modal } from '@components/ui/Modal'
import { StreakFlame, StreakMilestoneBadges } from './StreakFlame'
import { STREAK_MILESTONES } from '../types'

interface StreakExplainerModalProps {
  open: boolean
  current: number
  longest: number
  milestonesAchieved: number[]
  onDismiss: () => void
}

export function StreakExplainerModal({
  open,
  current,
  longest,
  milestonesAchieved,
  onDismiss,
}: StreakExplainerModalProps) {
  return (
    <Modal open={open} onClose={onDismiss} title="Your training streak">
      <div className="space-y-4 text-sm text-[var(--color-text-secondary)]">
        <StreakFlame current={current} longest={longest} />
        <p>
          A <strong className="text-[var(--color-text-primary)]">training streak</strong> counts consecutive
          days with sport activity — practice sessions, runs, games, or other athletic work you log in Seldom.
        </p>
        <p>
          <strong className="text-[var(--color-text-primary)]">Milestones</strong> unlock at{' '}
          {STREAK_MILESTONES.join(', ')} days. The flame grows warmer as you hit higher tiers.
        </p>
        <p>
          Streaks are recalculated from your logged activity. If you enable{' '}
          <strong className="text-[var(--color-text-primary)]">Injury Mode</strong> later, your streak will
          freeze so rest days do not unfairly reset your progress.
        </p>
        {milestonesAchieved.length > 0 && (
          <div>
            <p className="mb-1 text-xs text-[var(--color-text-tertiary)]">Milestones reached</p>
            <StreakMilestoneBadges achieved={milestonesAchieved} />
          </div>
        )}
        <div className="flex justify-end border-t border-[var(--color-border)] pt-4">
          <Button onClick={onDismiss}>Got it</Button>
        </div>
      </div>
    </Modal>
  )
}
