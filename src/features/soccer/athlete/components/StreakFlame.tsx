import { cn } from '@lib/utils'
import { streakMilestoneTier, nextStreakMilestone } from '../streak'
import { STREAK_MILESTONES } from '../types'

interface StreakFlameProps {
  current: number
  longest: number
  frozen?: boolean
  compact?: boolean
  className?: string
}

function flameColors(tier: number, frozen: boolean) {
  if (frozen) {
    return {
      fill: 'var(--color-accent-muted)',
      glow: 'rgba(147, 197, 253, 0.35)',
    }
  }
  if (tier >= 100) return { fill: 'var(--color-brand)', glow: 'rgba(251, 191, 36, 0.55)' }
  if (tier >= 30) return { fill: 'var(--color-brand-muted)', glow: 'rgba(252, 211, 77, 0.45)' }
  if (tier >= 7) return { fill: 'var(--color-brand)', glow: 'rgba(251, 191, 36, 0.4)' }
  if (tier >= 3) return { fill: 'var(--color-brand-muted)', glow: 'rgba(252, 211, 77, 0.35)' }
  return { fill: 'var(--color-text-tertiary)', glow: 'transparent' }
}

export function StreakFlame({ current, longest, frozen = false, compact, className }: StreakFlameProps) {
  const tier = streakMilestoneTier(current)
  const next = nextStreakMilestone(current)
  const colors = flameColors(tier, frozen)
  const scale = compact ? 0.85 : 1

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className="relative flex shrink-0 items-center justify-center"
        style={{ width: 36 * scale, height: 40 * scale }}
        title={frozen ? 'Streak frozen (Injury Mode)' : `Training streak: ${current} days`}
      >
        {colors.glow !== 'transparent' && (
          <span
            className="absolute inset-0 rounded-full blur-md"
            style={{ background: colors.glow, opacity: frozen ? 0.5 : 0.85 }}
          />
        )}
        <svg viewBox="0 0 24 28" className="relative h-9 w-8" aria-hidden>
          <path
            d="M12 2c0 6-4 8-4 14a4 4 0 0 0 8 0c0-6-4-8-4-14zm0 22a3 3 0 0 1-3-3c0-2 1.5-3.5 3-5 1.5 1.5 3 3 3 5a3 3 0 0 1-3 3z"
            fill={colors.fill}
          />
        </svg>
        {frozen && (
          <span className="absolute -bottom-0.5 rounded bg-[var(--color-surface-raised)] px-1 text-xs text-[var(--color-accent-muted)]">
            ❄
          </span>
        )}
      </div>
      <div className={compact ? 'min-w-0' : undefined}>
        <p className="text-sm font-semibold tabular-nums text-[var(--color-text-primary)]">
          {current} day{current === 1 ? '' : 's'}
        </p>
        {!compact && (
          <>
            <p className="text-xs text-[var(--color-text-tertiary)]">
              Best: {longest} · {frozen ? 'Frozen' : next ? `${next - current} to ${next}` : 'Max milestone'}
            </p>
            {tier > 0 && (
              <p className="text-xs text-[var(--color-warning)]">{tier}-day milestone</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export function StreakMilestoneBadges({ achieved }: { achieved: number[] }) {
  if (achieved.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1">
      {STREAK_MILESTONES.filter((m) => achieved.includes(m)).map((m) => (
        <span
          key={m}
          className="rounded-full border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/10 px-2 py-0.5 text-xs text-[var(--color-warning)]"
        >
          {m}d
        </span>
      ))}
    </div>
  )
}
