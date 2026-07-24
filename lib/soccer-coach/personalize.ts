/** Personalize coach welcome copy with the user's first name when available. */
export function formatCoachWelcome(template: string, displayName: string | null | undefined): string {
  const first = displayName?.trim().split(/\s+/)[0]
  if (first) {
    return template.replace(/\{name\}/g, first)
  }
  return template
    .replace(/\{name\}/g, '')
    .replace(/Hey \{name\}!/gi, 'Hey!')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function resolveFirstName(
  displayName?: string | null,
  profileName?: string | null,
): string | null {
  const raw = displayName?.trim() || profileName?.trim()
  if (!raw) return null
  return raw.split(/\s+/)[0] ?? raw
}
