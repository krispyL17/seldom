import { useCallback, useEffect } from 'react'
import { gradientPreviewCss, THEME_PALETTE_OPTIONS } from '@config/themePalettes'
import { useSidebarNav } from '@hooks/useSidebarNav'
import { buildNavTabColorPreview } from '@hooks/useNavTabColor'
import { applyThemeFromPreferences } from '@lib/theme'
import type { NavTabColors, ThemeAppearance, ThemePalette } from '@/types/userPreferences'

interface ThemeSettingsSectionProps {
  themePalette: ThemePalette
  themeAppearance: ThemeAppearance
  navTabColors: NavTabColors
  animationsEnabled: boolean
  onPaletteChange: (palette: ThemePalette) => void
  onAppearanceChange: (appearance: ThemeAppearance) => void
  onNavTabColorsChange: (colors: NavTabColors) => void
  onAnimationsChange: (enabled: boolean) => void
}

export function ThemeSettingsSection({
  themePalette,
  themeAppearance,
  navTabColors,
  animationsEnabled,
  onPaletteChange,
  onAppearanceChange,
  onNavTabColorsChange,
  onAnimationsChange,
}: ThemeSettingsSectionProps) {
  const navItems = useSidebarNav()
  const navIds = navItems.map((item) => item.id)

  const previewColors = buildNavTabColorPreview(themePalette, navIds, navTabColors)

  const applyPreview = useCallback(() => {
    applyThemeFromPreferences(themePalette, themeAppearance, animationsEnabled, navTabColors, navIds)
  }, [themePalette, themeAppearance, animationsEnabled, navTabColors, navIds])

  useEffect(() => {
    applyPreview()
  }, [applyPreview])

  function handlePaletteChange(palette: ThemePalette) {
    onPaletteChange(palette)
    onNavTabColorsChange({})
  }

  function handleTabColorChange(navId: string, color: string) {
    onNavTabColorsChange({ ...navTabColors, [navId]: color })
  }

  function resetTabColors() {
    onNavTabColorsChange({})
  }

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="text-xs font-medium text-[var(--color-text-secondary)]">Color palette</legend>
        <p className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
          Palettes tint the whole app and set default sidebar bookmark colors.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {THEME_PALETTE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => handlePaletteChange(option.id)}
              className={`rounded-[var(--radius-md)] border p-3 text-left transition-colors ${
                themePalette === option.id
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]'
                  : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]'
              }`}
            >
              <div
                className="mb-2 h-2 w-full rounded-full"
                style={{ background: gradientPreviewCss(option.id) }}
                aria-hidden
              />
              <span className="block text-xs font-medium text-[var(--color-text-primary)]">
                {option.label}
              </span>
              <span className="mt-0.5 block text-[10px] leading-snug text-[var(--color-text-tertiary)]">
                {option.description}
              </span>
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-medium text-[var(--color-text-secondary)]">Brightness</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {(['dark', 'light', 'system'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onAppearanceChange(option)}
              className={`rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs capitalize transition-colors ${
                themeAppearance === option
                  ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-text-primary)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]'
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <div className="flex items-center justify-between gap-3">
          <legend className="text-xs font-medium text-[var(--color-text-secondary)]">
            Sidebar bookmarks
          </legend>
          <button
            type="button"
            onClick={resetTabColors}
            className="text-[10px] text-[var(--color-text-tertiary)] underline-offset-2 hover:text-[var(--color-text-secondary)] hover:underline"
          >
            Reset to palette
          </button>
        </div>
        <p className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
          Each tab gets a colored underscore in gradient order. Override any tab below.
        </p>
        <ul className="mt-3 space-y-2">
          {navItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-[var(--color-text-primary)]">
                  {item.label}
                </span>
                <span
                  className="mt-1.5 block h-0.5 max-w-[120px] rounded-full"
                  style={{ backgroundColor: previewColors[item.id] }}
                  aria-hidden
                />
              </div>
              <input
                type="color"
                value={previewColors[item.id]}
                onChange={(e) => handleTabColorChange(item.id, e.target.value)}
                className="h-8 w-10 shrink-0 cursor-pointer rounded border border-[var(--color-border)] bg-transparent p-0.5"
                aria-label={`Bookmark color for ${item.label}`}
              />
            </li>
          ))}
        </ul>
      </fieldset>

      <label className="flex items-center justify-between gap-4">
        <span className="text-xs font-medium text-[var(--color-text-secondary)]">
          Interface animations
        </span>
        <input
          type="checkbox"
          checked={animationsEnabled}
          onChange={(e) => onAnimationsChange(e.target.checked)}
          className="h-4 w-4 rounded accent-[var(--color-accent)]"
        />
      </label>
    </div>
  )
}

/** Distance unit picker — kept separate for Settings layout */
export function DistanceUnitField({
  value,
  onChange,
}: {
  value: 'mi' | 'km'
  onChange: (unit: 'mi' | 'km') => void
}) {
  return (
    <fieldset>
      <legend className="text-xs font-medium text-[var(--color-text-secondary)]">
        Running distance unit
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {(['mi', 'km'] as const).map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs uppercase transition-colors ${
              value === option
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)] text-[var(--color-text-primary)]'
                : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)]'
            }`}
          >
            {option}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
