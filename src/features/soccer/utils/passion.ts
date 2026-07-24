/** True when the user's passion is soccer / football (not American football alone). */
export function isSoccerPassion(passion: string): boolean {
  const p = passion.toLowerCase().trim()
  if (!p) return false
  if (p === 'soccer' || p === 'football' || p === 'fútbol' || p === 'futbol') return true
  if (p.includes('soccer')) return true
  if (p.includes('football') && !p.includes('american')) return true
  return false
}
