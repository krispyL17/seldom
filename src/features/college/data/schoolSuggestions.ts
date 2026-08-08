export interface SchoolSuggestion {
  name: string
  majors: string[]
  regions: string[]
  athletics: string[]
  note?: string
}

/** Curated starter list — suggestions only, not endorsements. */
export const SCHOOL_CATALOG: SchoolSuggestion[] = [
  { name: 'UCLA', majors: ['computer science', 'engineering', 'biology', 'business', 'film'], regions: ['california', 'west', 'socal', 'los angeles'], athletics: ['soccer', 'basketball', 'football'] },
  { name: 'UC Berkeley', majors: ['computer science', 'engineering', 'business', 'economics'], regions: ['california', 'west', 'bay area', 'norcal'], athletics: ['soccer', 'football'] },
  { name: 'University of Michigan', majors: ['engineering', 'business', 'computer science', 'nursing'], regions: ['midwest', 'michigan'], athletics: ['football', 'basketball', 'soccer'] },
  { name: 'Ohio State University', majors: ['business', 'engineering', 'nursing', 'education'], regions: ['midwest', 'ohio'], athletics: ['football', 'basketball', 'soccer'] },
  { name: 'University of Texas at Austin', majors: ['computer science', 'engineering', 'business', 'communications'], regions: ['south', 'texas', 'austin'], athletics: ['football', 'basketball', 'soccer'] },
  { name: 'University of Florida', majors: ['biology', 'business', 'engineering', 'nursing'], regions: ['south', 'florida'], athletics: ['football', 'basketball', 'soccer'] },
  { name: 'Georgia Tech', majors: ['computer science', 'engineering', 'business'], regions: ['south', 'georgia', 'atlanta'], athletics: ['football', 'basketball'] },
  { name: 'NYU', majors: ['business', 'film', 'arts', 'computer science', 'nursing'], regions: ['northeast', 'new york', 'nyc'], athletics: ['soccer', 'basketball'] },
  { name: 'Boston University', majors: ['business', 'communications', 'nursing', 'engineering'], regions: ['northeast', 'massachusetts', 'boston'], athletics: ['hockey', 'soccer', 'basketball'] },
  { name: 'University of Washington', majors: ['computer science', 'engineering', 'nursing', 'business'], regions: ['west', 'washington', 'seattle', 'pacific northwest'], athletics: ['football', 'soccer', 'basketball'] },
  { name: 'University of Virginia', majors: ['business', 'economics', 'engineering', 'nursing'], regions: ['south', 'virginia'], athletics: ['basketball', 'soccer', 'football'] },
  { name: 'Penn State', majors: ['engineering', 'business', 'nursing', 'communications'], regions: ['northeast', 'pennsylvania'], athletics: ['football', 'soccer', 'basketball'] },
  { name: 'University of North Carolina', majors: ['business', 'nursing', 'biology', 'communications'], regions: ['south', 'north carolina'], athletics: ['basketball', 'soccer', 'football'] },
  { name: 'USC', majors: ['film', 'business', 'engineering', 'communications'], regions: ['california', 'west', 'socal', 'los angeles'], athletics: ['football', 'basketball', 'soccer'] },
  { name: 'Arizona State University', majors: ['business', 'engineering', 'nursing', 'computer science'], regions: ['west', 'arizona', 'southwest'], athletics: ['football', 'basketball', 'soccer'] },
  { name: 'University of Colorado Boulder', majors: ['engineering', 'business', 'environmental', 'computer science'], regions: ['west', 'colorado', 'mountain'], athletics: ['football', 'soccer', 'basketball'] },
  { name: 'University of Wisconsin', majors: ['engineering', 'business', 'nursing', 'education'], regions: ['midwest', 'wisconsin'], athletics: ['football', 'basketball', 'hockey'] },
  { name: 'Indiana University', majors: ['business', 'music', 'communications', 'nursing'], regions: ['midwest', 'indiana'], athletics: ['basketball', 'soccer', 'football'] },
  { name: 'University of Maryland', majors: ['computer science', 'engineering', 'business', 'nursing'], regions: ['northeast', 'mid-atlantic', 'maryland', 'dc area'], athletics: ['basketball', 'soccer', 'football'] },
  { name: 'University of Oregon', majors: ['business', 'journalism', 'environmental', 'arts'], regions: ['west', 'oregon', 'pacific northwest'], athletics: ['football', 'track', 'basketball'] },
]

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function tokens(text: string): string[] {
  return normalize(text).split(' ').filter((t) => t.length > 1)
}

function scoreSchool(
  school: SchoolSuggestion,
  majorText: string,
  regionText: string,
  passionText: string,
): number {
  let score = 0
  const majorTokens = tokens(majorText)
  const regionTokens = tokens(regionText)
  const passionNorm = normalize(passionText)

  for (const major of school.majors) {
    if (majorTokens.some((t) => major.includes(t) || t.includes(major))) score += 3
    if (normalize(majorText).includes(major)) score += 4
  }

  for (const region of school.regions) {
    if (regionTokens.some((t) => region.includes(t) || t.includes(region))) score += 2
    if (normalize(regionText).includes(region)) score += 3
  }

  if (passionNorm) {
    for (const sport of school.athletics) {
      if (passionNorm.includes(sport) || sport.includes(passionNorm)) score += 2
    }
    if (passionNorm.includes('soccer') || passionNorm.includes('football') || passionNorm.includes('basketball')) {
      if (school.athletics.some((a) => passionNorm.includes(a))) score += 1
    }
  }

  return score
}

export function suggestSchools(input: {
  intendedMajor: string
  schoolArea: string
  hobbyPassion?: string
  limit?: number
}): SchoolSuggestion[] {
  const ranked = SCHOOL_CATALOG.map((school) => ({
    school,
    score: scoreSchool(school, input.intendedMajor, input.schoolArea, input.hobbyPassion ?? ''),
  }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)

  const picked = ranked.slice(0, input.limit ?? 5).map((r) => r.school)

  if (picked.length >= 3) return picked

  const fallback = SCHOOL_CATALOG.filter((s) => !picked.some((p) => p.name === s.name)).slice(
    0,
    (input.limit ?? 5) - picked.length,
  )
  return [...picked, ...fallback]
}
