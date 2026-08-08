import type { CustomPerformanceTab } from '../athlete/types'

export const SESSION_TAB_PREFIX = 'seldom-tab:'

export interface SessionTabOption {
  value: string
  label: string
  group: 'Built-in' | 'Custom'
}

const BUILT_IN_TAB_LABELS: Record<string, string> = {
  running: 'Cardio',
  progression: 'Progression',
  recovery: 'Recovery',
}

const BUILT_IN_TAB_KEYS = new Set(Object.keys(BUILT_IN_TAB_LABELS))

function tabKeyExists(tabKey: string, customTabs: CustomPerformanceTab[]): boolean {
  if (BUILT_IN_TAB_KEYS.has(tabKey)) return true
  if (tabKey.startsWith('custom:')) {
    const slug = tabKey.slice('custom:'.length)
    return customTabs.some((t) => t.slug === slug)
  }
  return false
}

/** Session category points at a custom tab that no longer exists. */
export function isOrphanedSessionCategory(
  positionPlayed: string,
  customTabs: CustomPerformanceTab[] = [],
): boolean {
  const { tabKey } = decodeSessionTabCategory(positionPlayed)
  if (!tabKey?.startsWith('custom:')) return false
  return !tabKeyExists(tabKey, customTabs)
}

/** Human label for a removed custom tab slug. */
export function getOrphanedSessionTabLabel(positionPlayed: string): string | null {
  const { tabKey } = decodeSessionTabCategory(positionPlayed)
  if (!tabKey?.startsWith('custom:')) return null
  const slug = tabKey.slice('custom:'.length)
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/** Tabs a session can be filed under (excludes Overview and Tab preferences). */
export function getSessionTabOptions(customTabs: CustomPerformanceTab[] = []): SessionTabOption[] {
  const builtIn: SessionTabOption[] = Object.entries(BUILT_IN_TAB_LABELS).map(([value, label]) => ({
    value,
    label,
    group: 'Built-in',
  }))

  const custom: SessionTabOption[] = customTabs.slice(0, 4).map((tab) => ({
    value: `custom:${tab.slug}`,
    label: tab.label,
    group: 'Custom',
  }))

  return [...builtIn, ...custom]
}

export function encodeSessionTabCategory(tabKey: string | null | undefined): string {
  const key = tabKey?.trim()
  if (!key) return 'Session'
  return `${SESSION_TAB_PREFIX}${key}`
}

export function decodeSessionTabCategory(positionPlayed: string): {
  tabKey: string | null
  legacyLabel: string | null
} {
  const value = positionPlayed.trim()
  if (!value || value === 'Session') {
    return { tabKey: null, legacyLabel: null }
  }
  if (value.startsWith(SESSION_TAB_PREFIX)) {
    return { tabKey: value.slice(SESSION_TAB_PREFIX.length), legacyLabel: null }
  }
  return { tabKey: null, legacyLabel: value }
}

export function resolveSessionTabLabel(
  positionPlayed: string,
  customTabs: CustomPerformanceTab[] = [],
): string {
  const { tabKey, legacyLabel } = decodeSessionTabCategory(positionPlayed)
  if (legacyLabel) return legacyLabel
  if (!tabKey) return 'Session'

  if (tabKey.startsWith('custom:')) {
    const slug = tabKey.slice('custom:'.length)
    const match = customTabs.find((t) => t.slug === slug)
    if (match) return match.label
    const orphanLabel = getOrphanedSessionTabLabel(positionPlayed)
    return orphanLabel ? `Removed tab · ${orphanLabel}` : 'Removed tab'
  }

  return BUILT_IN_TAB_LABELS[tabKey] ?? tabKey
}

export function sessionBelongsToTab(
  positionPlayed: string,
  tab: Pick<CustomPerformanceTab, 'id' | 'slug' | 'label' | 'focusHint'>,
  customTabs: CustomPerformanceTab[] = [],
): boolean {
  const { tabKey, legacyLabel } = decodeSessionTabCategory(positionPlayed)

  if (tabKey) {
    if (tab.id === 'running') return tabKey === 'running'
    if (tab.id === 'progression') return tabKey === 'progression'
    if (tab.id === 'recovery') return tabKey === 'recovery'
    const custom = customTabs.find((t) => t.id === tab.id)
    if (custom) return tabKey === `custom:${custom.slug}`
    return false
  }

  if (!legacyLabel || !tab.slug) return false

  const needle = tab.slug.replace(/-/g, ' ')
  const labelNeedle = tab.label.toLowerCase()
  const focus = legacyLabel.toLowerCase()
  return (
    focus.includes(needle) ||
    focus.includes(labelNeedle) ||
    tab.focusHint
      .toLowerCase()
      .split(' ')
      .some((word: string) => word.length > 3 && focus.includes(word))
  )
}

export function positionPlayedFromSessionInput(input: {
  tab_category?: string | null
  focus?: string
}): string {
  if (input.tab_category !== undefined) {
    return encodeSessionTabCategory(input.tab_category)
  }
  if (input.focus !== undefined) {
    const trimmed = input.focus.trim()
    return trimmed || 'Session'
  }
  return 'Session'
}
