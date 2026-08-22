import type { CustomThemeId, CustomThemes, ThemeAppearance, ThemePalette } from '@/types/userPreferences'
import { isCustomThemePalette } from '@/types/userPreferences'

/** Gradient stops cycled across sidebar tabs in order. */
export const PALETTE_GRADIENT_STOPS: Record<'classic' | 'sunset' | 'ocean', readonly string[]> = {
  classic: ['#2dd4bf', '#fbbf24', '#fb7185'],
  sunset: ['#d4726a', '#e8956a', '#f2b8c6'],
  ocean: ['#3d7dd4', '#5b6bb5', '#7b5ba8'],
}

export function getCustomThemeStops(
  customThemes: CustomThemes,
  id: CustomThemeId,
): readonly [string, string, string] | null {
  const def = customThemes[id]
  if (!def?.colors?.length) return null
  return def.colors
}

export function paletteGradientStops(
  palette: ThemePalette,
  customThemes: CustomThemes = {},
): readonly string[] {
  if (isCustomThemePalette(palette)) {
    return getCustomThemeStops(customThemes, palette) ?? PALETTE_GRADIENT_STOPS.classic
  }
  return PALETTE_GRADIENT_STOPS[palette]
}

export const THEME_PALETTE_OPTIONS: {
  id: ThemePalette
  label: string
  description: string
}[] = [
  { id: 'classic', label: 'Classic', description: 'Midnight field — teal, amber, coral' },
  { id: 'sunset', label: 'Sunset', description: 'Soft red → orange → pink' },
  { id: 'ocean', label: 'Ocean', description: 'Blue → purple gradient' },
]

interface Rgb {
  r: number
  g: number
  b: number
}

interface ThemeTokens {
  '--color-surface-base': string
  '--color-surface-raised': string
  '--color-surface-overlay': string
  '--color-surface-elevated': string
  '--color-accent': string
  '--color-accent-muted': string
  '--color-accent-hover': string
  '--color-accent-subtle': string
  '--color-brand': string
  '--color-brand-muted': string
  '--color-brand-bg': string
  '--color-text-primary': string
  '--color-text-secondary': string
  '--color-text-tertiary': string
  '--color-border': string
  '--color-border-strong': string
  '--color-surface-base-gradient'?: string
}

function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace('#', '')
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized
  const num = Number.parseInt(value, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

function rgbToHex({ r, g, b }: Rgb): string {
  const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function mix(a: Rgb, b: Rgb, t: number): Rgb {
  return {
    r: a.r + (b.r - a.r) * t,
    g: a.g + (b.g - a.g) * t,
    b: a.b + (b.b - a.b) * t,
  }
}

function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/** Complement for paired UI accents (e.g. junior / senior phase toggle). */
export function complementaryHex(hex: string): string {
  const { r, g, b } = hexToRgb(hex)
  return rgbToHex({ r: 255 - r, g: 255 - g, b: 255 - b })
}

export function withHexAlpha(hex: string, alpha: number): string {
  return withAlpha(hex, alpha)
}

/** Sample a color along gradient stops at position t ∈ [0, 1]. */
export function sampleGradient(stops: readonly string[], t: number): string {
  if (stops.length === 0) return '#888888'
  if (stops.length === 1) return stops[0]
  const clamped = Math.max(0, Math.min(1, t))
  const scaled = clamped * (stops.length - 1)
  const index = Math.min(Math.floor(scaled), stops.length - 2)
  const localT = scaled - index
  return rgbToHex(mix(hexToRgb(stops[index]), hexToRgb(stops[index + 1]), localT))
}

/** Assign gradient colors to nav tabs in sidebar order. */
export function defaultNavTabColors(
  palette: ThemePalette,
  navIds: readonly string[],
  customThemes: CustomThemes = {},
): Record<string, string> {
  const stops = paletteGradientStops(palette, customThemes)
  const count = navIds.length
  if (count === 0) return {}
  return Object.fromEntries(
    navIds.map((id, index) => {
      const t = count === 1 ? 0 : index / (count - 1)
      return [id, sampleGradient(stops, t)]
    }),
  )
}

export function resolveNavTabColor(
  navId: string,
  palette: ThemePalette,
  navIds: readonly string[],
  customColors: Record<string, string>,
  customThemes: CustomThemes = {},
): string {
  const custom = customColors[navId]?.trim()
  if (custom && /^#[0-9a-fA-F]{3,8}$/.test(custom)) return custom
  const defaults = defaultNavTabColors(palette, navIds, customThemes)
  const stops = paletteGradientStops(palette, customThemes)
  return defaults[navId] ?? stops[0]
}

/** Faint ledger accents derived from a nav bookmark color (dashboard panel headers). */
export function bookmarkPanelAccents(bookmarkHex: string): {
  rule: string
  mark: string
  heading: string
} {
  return {
    rule: withAlpha(bookmarkHex, 0.38),
    mark: withAlpha(bookmarkHex, 0.72),
    heading: bookmarkHex,
  }
}

function resolveAppearance(appearance: ThemeAppearance): 'dark' | 'light' {
  if (appearance === 'light') return 'light'
  if (appearance === 'dark') return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** Resolved brightness for accent derivation (exported for tab accent scoping). */
export function resolveThemeMode(appearance: ThemeAppearance): 'dark' | 'light' {
  return resolveAppearance(appearance)
}

function normalizeHex(hex: string): string {
  return hex.trim().toLowerCase()
}

/** Accent tokens derived from a sidebar bookmark color. */
export function bookmarkAccentTokens(
  bookmarkHex: string,
  mode: 'dark' | 'light',
): {
  accent: string
  accentMuted: string
  accentHover: string
  accentSubtle: string
} {
  const rgb = hexToRgb(bookmarkHex)
  const black = { r: 0, g: 0, b: 0 }
  const accent = rgbToHex(mix(rgb, black, mode === 'dark' ? 0.22 : 0.28))
  const accentMuted = bookmarkHex
  const accentHover = rgbToHex(mix(hexToRgb(accent), rgb, 0.42))
  const accentSubtle = withAlpha(bookmarkHex, mode === 'dark' ? 0.14 : 0.12)

  return { accent, accentMuted, accentHover, accentSubtle }
}

/** CSS variables for tab-scoped accent + panel ledger tints from a bookmark color. */
export function bookmarkAccentScopeVars(
  bookmarkHex: string,
  mode: 'dark' | 'light',
): Record<string, string> {
  const accents = bookmarkAccentTokens(bookmarkHex, mode)
  const panel = bookmarkPanelAccents(bookmarkHex)
  return {
    '--color-accent': accents.accent,
    '--color-accent-muted': accents.accentMuted,
    '--color-accent-hover': accents.accentHover,
    '--color-accent-subtle': accents.accentSubtle,
    '--panel-accent-rule': panel.rule,
    '--panel-accent-mark': panel.mark,
    '--panel-heading': panel.heading,
  }
}

export function navTabColorsMatch(a: string, b: string): boolean {
  return normalizeHex(a) === normalizeHex(b)
}

/** Whether a tab route should remap default (Today) accents to its bookmark color. */
export function shouldScopeTabAccent(
  navId: string,
  tabColor: string,
  homeColor: string,
  defaultHomeColor: string,
): boolean {
  if (navId === 'home') {
    return !navTabColorsMatch(tabColor, defaultHomeColor)
  }
  return !navTabColorsMatch(tabColor, homeColor)
}

const CLASSIC_DARK: ThemeTokens = {
  '--color-surface-base': '#080b12',
  '--color-surface-raised': '#0f141f',
  '--color-surface-overlay': '#151c2b',
  '--color-surface-elevated': '#1c2638',
  '--color-accent': '#0d9488',
  '--color-accent-muted': '#2dd4bf',
  '--color-accent-hover': '#14b8a6',
  '--color-accent-subtle': 'rgba(45, 212, 191, 0.14)',
  '--color-brand': '#fbbf24',
  '--color-brand-muted': '#fcd34d',
  '--color-brand-bg': 'rgba(251, 191, 36, 0.12)',
  '--color-text-primary': '#eef2f8',
  '--color-text-secondary': '#94a3b8',
  '--color-text-tertiary': '#8898ae',
  '--color-border': 'rgba(148, 163, 184, 0.1)',
  '--color-border-strong': 'rgba(148, 163, 184, 0.16)',
  '--color-surface-base-gradient':
    'radial-gradient(ellipse 120% 70% at 50% -15%, rgba(45, 212, 191, 0.07) 0%, transparent 55%), radial-gradient(ellipse 70% 50% at 100% 100%, rgba(251, 191, 36, 0.04) 0%, transparent 50%)',
}

const CLASSIC_LIGHT: ThemeTokens = {
  '--color-surface-base': '#f4f7fb',
  '--color-surface-raised': '#ffffff',
  '--color-surface-overlay': '#e8eef6',
  '--color-surface-elevated': '#dce6f2',
  '--color-accent': '#0f766e',
  '--color-accent-muted': '#14b8a6',
  '--color-accent-hover': '#0d9488',
  '--color-accent-subtle': 'rgba(20, 184, 166, 0.12)',
  '--color-brand': '#d97706',
  '--color-brand-muted': '#f59e0b',
  '--color-brand-bg': 'rgba(217, 119, 6, 0.1)',
  '--color-text-primary': '#0f172a',
  '--color-text-secondary': '#475569',
  '--color-text-tertiary': '#5c6b80',
  '--color-border': 'rgba(15, 23, 42, 0.08)',
  '--color-border-strong': 'rgba(15, 23, 42, 0.14)',
  '--color-surface-base-gradient':
    'radial-gradient(ellipse 100% 60% at 50% -10%, rgba(20, 184, 166, 0.08) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(217, 119, 6, 0.05) 0%, transparent 45%)',
}

function buildTokensFromStops(stops: readonly string[], mode: 'dark' | 'light'): ThemeTokens {
  const primary = stops[0]
  const mid = stops[1] ?? stops[0]
  const accent = stops[stops.length - 1] ?? mid

  if (mode === 'dark') {
    return {
      '--color-surface-base': '#0a0e16',
      '--color-surface-raised': '#101622',
      '--color-surface-overlay': '#161e2e',
      '--color-surface-elevated': '#1e2840',
      '--color-accent': rgbToHex(mix(hexToRgb(primary), hexToRgb(accent), 0.35)),
      '--color-accent-muted': mid,
      '--color-accent-hover': rgbToHex(mix(hexToRgb(primary), hexToRgb(mid), 0.5)),
      '--color-accent-subtle': withAlpha(primary, 0.16),
      '--color-brand': primary,
      '--color-brand-muted': mid,
      '--color-brand-bg': withAlpha(primary, 0.12),
      '--color-text-primary': '#e8edf8',
      '--color-text-secondary': '#9aa8c4',
      '--color-text-tertiary': '#64708a',
      '--color-border': 'rgba(160, 190, 255, 0.08)',
      '--color-border-strong': 'rgba(160, 190, 255, 0.14)',
      '--color-surface-base-gradient': `linear-gradient(165deg, #0a0e16 0%, ${withAlpha(primary, 0.15)} 50%, ${withAlpha(accent, 0.12)} 100%)`,
    }
  }

  return {
    '--color-surface-base': '#f2f6fc',
    '--color-surface-raised': '#ffffff',
    '--color-surface-overlay': '#e8eef8',
    '--color-surface-elevated': '#dce6f4',
    '--color-accent': rgbToHex(mix(hexToRgb(primary), hexToRgb(accent), 0.4)),
    '--color-accent-muted': mid,
    '--color-accent-hover': rgbToHex(mix(hexToRgb(primary), hexToRgb(mid), 0.55)),
    '--color-accent-subtle': withAlpha(primary, 0.1),
    '--color-brand': primary,
    '--color-brand-muted': accent,
    '--color-brand-bg': withAlpha(primary, 0.08),
    '--color-text-primary': '#141c2e',
    '--color-text-secondary': '#4a5878',
    '--color-text-tertiary': '#7a88a8',
    '--color-border': 'rgba(40, 70, 140, 0.1)',
    '--color-border-strong': 'rgba(40, 70, 140, 0.16)',
    '--color-surface-base-gradient': `linear-gradient(165deg, #f6f9ff 0%, ${withAlpha(primary, 0.08)} 50%, ${withAlpha(accent, 0.06)} 100%)`,
  }
}

function buildPaletteTokens(palette: 'sunset' | 'ocean', mode: 'dark' | 'light'): ThemeTokens {
  const stops = PALETTE_GRADIENT_STOPS[palette]
  const primary = stops[0]
  const mid = stops[1] ?? stops[0]
  const accent = stops[stops.length - 1] ?? mid

  if (palette === 'sunset') {
    if (mode === 'dark') {
      return {
        '--color-surface-base': '#120e10',
        '--color-surface-raised': '#1a1418',
        '--color-surface-overlay': '#221a20',
        '--color-surface-elevated': '#2c2228',
        '--color-accent': '#5c3f48',
        '--color-accent-muted': '#8a6270',
        '--color-accent-hover': '#6b4a55',
        '--color-accent-subtle': withAlpha(primary, 0.18),
        '--color-brand': mid,
        '--color-brand-muted': accent,
        '--color-brand-bg': withAlpha(mid, 0.12),
        '--color-text-primary': '#f5eef0',
        '--color-text-secondary': '#b8a8ae',
        '--color-text-tertiary': '#7a6b72',
        '--color-border': 'rgba(255, 220, 210, 0.08)',
        '--color-border-strong': 'rgba(255, 220, 210, 0.14)',
        '--color-surface-base-gradient': `linear-gradient(165deg, #120e10 0%, #1a1218 45%, #18121a 100%)`,
      }
    }
    return {
      '--color-surface-base': '#faf6f5',
      '--color-surface-raised': '#ffffff',
      '--color-surface-overlay': '#f3ecea',
      '--color-surface-elevated': '#ebe2df',
      '--color-accent': '#8f5f68',
      '--color-accent-muted': '#b07a84',
      '--color-accent-hover': '#7a5059',
      '--color-accent-subtle': withAlpha(primary, 0.1),
      '--color-brand': primary,
      '--color-brand-muted': mid,
      '--color-brand-bg': withAlpha(primary, 0.08),
      '--color-text-primary': '#2a1f22',
      '--color-text-secondary': '#6b565c',
      '--color-text-tertiary': '#9a848a',
      '--color-border': 'rgba(120, 70, 70, 0.1)',
      '--color-border-strong': 'rgba(120, 70, 70, 0.16)',
      '--color-surface-base-gradient': `linear-gradient(165deg, #fff8f6 0%, #faf0ec 50%, #fdf5f8 100%)`,
    }
  }

  if (palette === 'ocean') {
    if (mode === 'dark') {
      return {
        '--color-surface-base': '#0a0e16',
        '--color-surface-raised': '#101622',
        '--color-surface-overlay': '#161e2e',
        '--color-surface-elevated': '#1e2840',
        '--color-accent': '#2f3f66',
        '--color-accent-muted': '#5a6a96',
        '--color-accent-hover': '#3a4d78',
        '--color-accent-subtle': withAlpha(primary, 0.16),
        '--color-brand': primary,
        '--color-brand-muted': mid,
        '--color-brand-bg': withAlpha(primary, 0.12),
        '--color-text-primary': '#e8edf8',
        '--color-text-secondary': '#9aa8c4',
        '--color-text-tertiary': '#64708a',
        '--color-border': 'rgba(160, 190, 255, 0.08)',
        '--color-border-strong': 'rgba(160, 190, 255, 0.14)',
        '--color-surface-base-gradient': `linear-gradient(165deg, #0a0e16 0%, #0e1424 50%, #121028 100%)`,
      }
    }
    return {
      '--color-surface-base': '#f2f6fc',
      '--color-surface-raised': '#ffffff',
      '--color-surface-overlay': '#e8eef8',
      '--color-surface-elevated': '#dce6f4',
      '--color-accent': '#3d5080',
      '--color-accent-muted': '#5a6ea8',
      '--color-accent-hover': '#324468',
      '--color-accent-subtle': withAlpha(primary, 0.1),
      '--color-brand': primary,
      '--color-brand-muted': accent,
      '--color-brand-bg': withAlpha(primary, 0.08),
      '--color-text-primary': '#141c2e',
      '--color-text-secondary': '#4a5878',
      '--color-text-tertiary': '#7a88a8',
      '--color-border': 'rgba(40, 70, 140, 0.1)',
      '--color-border-strong': 'rgba(40, 70, 140, 0.16)',
      '--color-surface-base-gradient': `linear-gradient(165deg, #f6f9ff 0%, #eef3fc 50%, #f0eef8 100%)`,
    }
  }

  return mode === 'dark' ? CLASSIC_DARK : CLASSIC_LIGHT
}

export function resolveThemeTokens(
  palette: ThemePalette,
  appearance: ThemeAppearance,
  customThemes: CustomThemes = {},
): { mode: 'dark' | 'light'; tokens: ThemeTokens } {
  if (isCustomThemePalette(palette)) {
    const stops = getCustomThemeStops(customThemes, palette)
    const mode = resolveAppearance(appearance)
    if (stops) {
      return { mode, tokens: buildTokensFromStops(stops, mode) }
    }
    return { mode, tokens: mode === 'dark' ? CLASSIC_DARK : CLASSIC_LIGHT }
  }

  const mode = resolveAppearance(appearance)
  const tokens =
    palette === 'classic' ? (mode === 'dark' ? CLASSIC_DARK : CLASSIC_LIGHT) : buildPaletteTokens(palette, mode)
  return { mode, tokens }
}

export function gradientPreviewCss(palette: ThemePalette, customThemes: CustomThemes = {}): string {
  const stops = paletteGradientStops(palette, customThemes)
  return `linear-gradient(90deg, ${stops.join(', ')})`
}

/** Shift custom bookmark overrides when the palette changes. */
export function remapNavTabColors(
  customColors: Record<string, string>,
  oldPalette: ThemePalette,
  newPalette: ThemePalette,
  navIds: readonly string[],
  oldCustomThemes: CustomThemes = {},
  newCustomThemes: CustomThemes = {},
): Record<string, string> {
  if (Object.keys(customColors).length === 0 || oldPalette === newPalette) return customColors
  const oldDefaults = defaultNavTabColors(oldPalette, navIds, oldCustomThemes)
  const newDefaults = defaultNavTabColors(newPalette, navIds, newCustomThemes)
  const remapped: Record<string, string> = {}
  for (const id of navIds) {
    const custom = customColors[id]
    if (!custom) continue
    if (custom.toLowerCase() === oldDefaults[id]?.toLowerCase()) continue
    remapped[id] = newDefaults[id] ?? custom
  }
  return remapped
}
