import { useCallback, useEffect } from 'react'
import {
  gradientPreviewCss,
  remapNavTabColors,
  THEME_PALETTE_OPTIONS,
} from '@config/themePalettes'
import { captureThemeForCustomSlot } from '@config/themeCapture'
import { useSidebarNav } from '@hooks/useSidebarNav'
import { buildNavTabColorPreview } from '@hooks/useNavTabColor'
import { applyThemeFromPreferences } from '@lib/theme'
import type {
  CustomThemeDefinition,
  CustomThemeId,
  CustomThemes,
  NavTabColors,
  ThemeAppearance,
  ThemePalette,
} from '@/types/userPreferences'
import { CUSTOM_THEME_SLOTS, isCustomThemePalette } from '@/types/userPreferences'

interface ThemeSettingsSectionProps {
  themePalette: ThemePalette
  themeAppearance: ThemeAppearance
  customThemes: CustomThemes
  navTabColors: NavTabColors
  animationsEnabled: boolean
  onPaletteChange: (palette: ThemePalette) => void
  onAppearanceChange: (appearance: ThemeAppearance) => void
  onCustomThemesChange: (themes: CustomThemes) => void
  onNavTabColorsChange: (colors: NavTabColors) => void
  onAnimationsChange: (enabled: boolean) => void
}

const DEFAULT_CUSTOM_COLORS: [string, string, string] = ['#5a8fd4', '#6b6794', '#8b87b8']

export function ThemeSettingsSection({
  themePalette,
  themeAppearance,
  customThemes,
  navTabColors,
  animationsEnabled,
  onPaletteChange,
  onAppearanceChange,
  onCustomThemesChange,
  onNavTabColorsChange,
  onAnimationsChange,
}: ThemeSettingsSectionProps) {
  const navItems = useSidebarNav()
  const navIds = navItems.map((item) => item.id)
  const usingCustomPalette = isCustomThemePalette(themePalette)

  const previewColors = buildNavTabColorPreview(themePalette, navIds, navTabColors, customThemes)

  const applyPreview = useCallback(() => {
    requestAnimationFrame(() => {
      applyThemeFromPreferences(
        themePalette,
        themeAppearance,
        animationsEnabled,
        navTabColors,
        navIds,
        customThemes,
      )
    })
  }, [themePalette, themeAppearance, animationsEnabled, navTabColors, navIds, customThemes])

  useEffect(() => {
    applyPreview()
  }, [applyPreview])

  function handlePaletteChange(palette: ThemePalette) {
    if (palette !== themePalette && Object.keys(navTabColors).length > 0) {
      onNavTabColorsChange(
        remapNavTabColors(
          navTabColors,
          themePalette,
          palette,
          navIds,
          customThemes,
          customThemes,
        ),
      )
    } else if (palette !== themePalette) {
      onNavTabColorsChange({})
    }
    onPaletteChange(palette)
  }

  function handleTabColorChange(navId: string, color: string) {
    onNavTabColorsChange({ ...navTabColors, [navId]: color })
  }

  function resetTabColors() {
    onNavTabColorsChange({})
  }

  function upsertCustomTheme(id: CustomThemeId, patch: Partial<CustomThemeDefinition>) {
    const current = customThemes[id]
    const next: CustomThemeDefinition = {
      name: patch.name ?? current?.name ?? CUSTOM_THEME_SLOTS.find((s) => s.id === id)!.defaultName,
      colors: patch.colors ?? current?.colors ?? DEFAULT_CUSTOM_COLORS,
      navTabColors: patch.navTabColors ?? current?.navTabColors,
    }
    onCustomThemesChange({ ...customThemes, [id]: next })
  }

  function handleCustomThemeTabColor(id: CustomThemeId, navId: string, color: string) {
    const current = customThemes[id]
    const navTabColors = { ...(current?.navTabColors ?? {}), [navId]: color }
    upsertCustomTheme(id, { navTabColors })
  }

  function resetCustomThemeTabColors(id: CustomThemeId) {
    const current = customThemes[id]
    if (!current) return
    upsertCustomTheme(id, { navTabColors: {} })
  }

  function deleteCustomTheme(id: CustomThemeId) {
    const next = { ...customThemes }
    delete next[id]
    onCustomThemesChange(next)
    if (themePalette === id) {
      onPaletteChange('classic')
    }
  }

  function applyCurrentLook(id: CustomThemeId) {
    const captured = captureThemeForCustomSlot(
      themePalette,
      navTabColors,
      navIds,
      customThemes,
      id,
      customThemes[id]?.name,
    )
    upsertCustomTheme(id, captured)
  }

  return (
    <div className="space-y-5">
      <fieldset>
        <legend className="text-xs font-medium text-[var(--color-text-secondary)]">Built-in palettes</legend>
        <p className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
          Preset palettes support dark, light, and system brightness. Click <strong>Save preferences</strong> below to keep changes.
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
        <legend className="text-xs font-medium text-[var(--color-text-secondary)]">Custom themes</legend>
        <p className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
          Create up to two personal themes with your own colors and sidebar bookmarks. Dark, light, and system brightness apply to custom themes too.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {CUSTOM_THEME_SLOTS.map((slot) => {
            const theme = customThemes[slot.id]
            const colors = theme?.colors ?? DEFAULT_CUSTOM_COLORS
            const isActive = themePalette === slot.id
            return (
              <div
                key={slot.id}
                className={`rounded-[var(--radius-md)] border p-3 ${
                  isActive
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent-subtle)]'
                    : 'border-[var(--color-border)]'
                }`}
              >
                <div
                  className="mb-2 h-2 w-full rounded-full"
                  style={{ background: gradientPreviewCss(slot.id, { [slot.id]: theme ?? { name: slot.defaultName, colors } }) }}
                  aria-hidden
                />
                <label className="block text-[10px] font-medium text-[var(--color-text-tertiary)]">
                  Theme name
                  <input
                    type="text"
                    value={theme?.name ?? ''}
                    placeholder={slot.defaultName}
                    onChange={(e) => upsertCustomTheme(slot.id, { name: e.target.value, colors })}
                    className="mt-1 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1.5 text-xs text-[var(--color-text-primary)]"
                  />
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {(['Primary', 'Mid', 'Accent'] as const).map((label, index) => (
                    <label key={label} className="text-[9px] text-[var(--color-text-tertiary)]">
                      {label}
                      <input
                        type="color"
                        value={colors[index]}
                        onChange={(e) => {
                          const next = [...colors] as [string, string, string]
                          next[index] = e.target.value
                          upsertCustomTheme(slot.id, { colors: next })
                        }}
                        className="mt-1 h-8 w-full cursor-pointer rounded border border-[var(--color-border)] bg-transparent p-0.5"
                      />
                    </label>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      upsertCustomTheme(slot.id, {})
                      handlePaletteChange(slot.id)
                    }}
                    className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-[10px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)]"
                  >
                    {isActive ? 'Selected' : 'Use theme'}
                  </button>
                  <button
                    type="button"
                    onClick={() => applyCurrentLook(slot.id)}
                    className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2 py-1 text-[10px] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)]"
                  >
                    Use current look
                  </button>
                  {theme && (
                    <button
                      type="button"
                      onClick={() => deleteCustomTheme(slot.id)}
                      className="rounded-[var(--radius-sm)] px-2 py-1 text-[10px] text-[var(--color-danger)] hover:underline"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <div className="mt-3 border-t border-[var(--color-border)] pt-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="text-[10px] font-medium text-[var(--color-text-secondary)]">
                      Tab bookmarks for this theme
                    </p>
                    {theme?.navTabColors && Object.keys(theme.navTabColors).length > 0 && (
                      <button
                        type="button"
                        onClick={() => resetCustomThemeTabColors(slot.id)}
                        className="text-[9px] text-[var(--color-text-tertiary)] hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <ul className="max-h-40 space-y-1.5 overflow-y-auto">
                    {navItems.map((item) => {
                      const slotTheme = customThemes[slot.id]
                      const preview = buildNavTabColorPreview(
                        slot.id,
                        navIds,
                        slotTheme?.navTabColors ?? {},
                        { [slot.id]: slotTheme ?? { name: slot.defaultName, colors } },
                      )
                      return (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-overlay)] px-2 py-1.5"
                        >
                          <span className="truncate text-[10px] text-[var(--color-text-primary)]">
                            {item.label}
                          </span>
                          <input
                            type="color"
                            value={preview[item.id]}
                            onChange={(e) => handleCustomThemeTabColor(slot.id, item.id, e.target.value)}
                            className="h-7 w-9 shrink-0 cursor-pointer rounded border border-[var(--color-border)] bg-transparent p-0.5"
                            aria-label={`Bookmark color for ${item.label}`}
                          />
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-xs font-medium text-[var(--color-text-secondary)]">Brightness</legend>
        <p className="mt-0.5 text-[11px] text-[var(--color-text-tertiary)]">
          Applies to built-in and custom palettes — including light mode for custom color themes.
        </p>
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

      {!usingCustomPalette && (
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
          Override sidebar tab underscores for built-in palettes. Custom themes store bookmarks per theme above.
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
      )}

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
