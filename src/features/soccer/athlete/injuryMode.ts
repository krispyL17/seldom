const INJURY_PATTERNS = [
  /\binjur(y|ed|ies)\b/i,
  /\bpain\b/i,
  /\bhurt\b/i,
  /\bsprain(ed|)\b/i,
  /\bstrain(ed|)\b/i,
  /\btorn\b/i,
  /\bcan['']?t (run|walk|train|play)\b/i,
  /\b(out|sidelined) (for|with|due to)\b/i,
  /\b(acl|mcl|hamstring|ankle|knee|groin) (injury|pain|issue)\b/i,
]

export function messageSuggestsInjuryMode(message: string): boolean {
  const text = message.trim()
  if (text.length < 8) return false
  return INJURY_PATTERNS.some((re) => re.test(text))
}
