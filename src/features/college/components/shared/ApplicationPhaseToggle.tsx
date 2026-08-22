import { useEffect, useMemo } from 'react'
import { ALL_NAV_TAB_IDS } from '@config/navigation'
import { complementaryHex, resolveNavTabColor, withHexAlpha } from '@config/themePalettes'
import { useUserPreferences } from '@features/preferences'
import { cn } from '@lib/utils'
import { useCollege } from '../../hooks/useCollege'
import { phaseDescription, phaseLabel } from '../../phaseUtils'
import { dismissSeniorHint, isSeniorHintDismissed } from '../../utils/seniorHintDismiss'

function phaseChipStyle(color: string, active: boolean) {
  return {
    color,
    backgroundColor: withHexAlpha(color, active ? 0.16 : 0.06),
    borderColor: withHexAlpha(color, active ? 0.55 : 0.28),
  } as const
}

export function ApplicationPhaseToggle() {
  const { applicationPhase, isSeniorMode, enterSeniorMode, enterJuniorMode } = useCollege()
  const { themePalette, customThemes, navTabColors, updatePreferences } = useUserPreferences()

  const collegeTabColor = useMemo(
    () => resolveNavTabColor('college', themePalette, ALL_NAV_TAB_IDS, navTabColors, customThemes),
    [themePalette, navTabColors, customThemes],
  )

  const { juniorColor, seniorColor } = useMemo(() => {
    if (isSeniorMode) {
      return {
        juniorColor: complementaryHex(collegeTabColor),
        seniorColor: collegeTabColor,
      }
    }
    return {
      juniorColor: collegeTabColor,
      seniorColor: complementaryHex(collegeTabColor),
    }
  }, [collegeTabColor, isSeniorMode])

  const showHint = !isSeniorMode && !isSeniorHintDismissed()

  useEffect(() => () => dismissSeniorHint(), [])

  async function handleEnterSenior() {
    const nextSeniorColor = complementaryHex(collegeTabColor)
    await enterSeniorMode()
    await updatePreferences({
      nav_tab_colors: { ...navTabColors, college: nextSeniorColor },
    })
  }

  async function handleEnterJunior() {
    if (!confirm('Switch back to junior prep mode? Your application data is kept.')) return
    const nextJuniorColor = complementaryHex(collegeTabColor)
    await enterJuniorMode()
    await updatePreferences({
      nav_tab_colors: { ...navTabColors, college: nextJuniorColor },
    })
  }

  return (
    <header className="mb-2 shrink-0">
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-[var(--color-text-primary)]">
            {phaseLabel(applicationPhase)}
          </h2>
          <p className="text-xs text-[var(--color-text-tertiary)]">{phaseDescription(applicationPhase)}</p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1">
          <div className="flex items-center gap-1.5">
            {isSeniorMode ? (
              <button
                type="button"
                onClick={() => void handleEnterJunior()}
                className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                style={phaseChipStyle(juniorColor, false)}
              >
                Junior
              </button>
            ) : (
              <span
                className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide"
                style={phaseChipStyle(juniorColor, true)}
                aria-current="step"
              >
                Junior
              </span>
            )}

            <span className="text-xs text-[var(--color-text-tertiary)]" aria-hidden>
              /
            </span>

            {isSeniorMode ? (
              <span
                className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide"
                style={phaseChipStyle(seniorColor, true)}
                aria-current="step"
              >
                Senior
              </span>
            ) : (
              <button
                type="button"
                onClick={() => void handleEnterSenior()}
                className={cn(
                  'inline-flex items-center rounded-md border border-dashed px-2 py-0.5 text-xs font-semibold uppercase tracking-wide transition-colors',
                  'hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]',
                )}
                style={phaseChipStyle(seniorColor, false)}
                aria-label="Switch to senior application mode"
              >
                Senior
              </button>
            )}
          </div>

          {showHint && (
            <p className="max-w-[12rem] text-right text-xs leading-snug text-[var(--color-text-tertiary)]">
              Click me once you&apos;re a senior
            </p>
          )}
        </div>
      </div>
    </header>
  )
}
