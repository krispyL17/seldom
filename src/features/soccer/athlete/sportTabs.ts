import type { CustomPerformanceTab } from './types'

const TAB_TEMPLATES: Record<string, Omit<CustomPerformanceTab, 'id'>[]> = {
  soccer: [
    { label: 'Shooting', slug: 'shooting', focusHint: 'Finishing and shot technique' },
    { label: 'Weak Foot', slug: 'weak-foot', focusHint: 'Non-dominant foot reps' },
    { label: 'Tactical', slug: 'tactical', focusHint: 'Positioning and game IQ' },
    { label: 'Speed', slug: 'speed', focusHint: 'Acceleration and sprint work' },
  ],
  football: [
    { label: 'Route Running', slug: 'routes', focusHint: 'Routes and releases' },
    { label: 'Footwork', slug: 'footwork', focusHint: 'Agility and cuts' },
    { label: 'Film Study', slug: 'film', focusHint: 'Reads and assignments' },
    { label: 'Strength', slug: 'strength', focusHint: 'Power and contact prep' },
  ],
  running: [
    { label: 'Pace', slug: 'pace', focusHint: 'Target splits and tempo' },
    { label: 'Distance', slug: 'distance', focusHint: 'Weekly mileage build' },
    { label: 'Recovery', slug: 'run-recovery', focusHint: 'Easy days and mobility' },
    { label: 'Race Prep', slug: 'race-prep', focusHint: 'Race-specific sessions' },
  ],
  basketball: [
    { label: 'Shooting', slug: 'shooting', focusHint: 'Form and volume' },
    { label: 'Ball Handling', slug: 'handles', focusHint: 'Weak-hand dribbling' },
    { label: 'Defense', slug: 'defense', focusHint: 'Slides and closeouts' },
    { label: 'Conditioning', slug: 'conditioning', focusHint: 'Court fitness' },
  ],
  default: [
    { label: 'Technique', slug: 'technique', focusHint: 'Skill-specific reps' },
    { label: 'Consistency', slug: 'consistency', focusHint: 'Show-up habits' },
    { label: 'Benchmarks', slug: 'benchmarks', focusHint: 'Measurable targets' },
    { label: 'Review', slug: 'review', focusHint: 'Weekly reflection' },
  ],
}

function matchSportKey(passion: string): string {
  const p = passion.toLowerCase()
  if (p.includes('soccer') || p.includes('futsal')) return 'soccer'
  if (p.includes('football') && !p.includes('soccer')) return 'football'
  if (p.includes('run') || p.includes('track') || p.includes('cross country')) return 'running'
  if (p.includes('basketball')) return 'basketball'
  return 'default'
}

export function generateSportTabs(passion: string): CustomPerformanceTab[] {
  const key = matchSportKey(passion)
  const templates = TAB_TEMPLATES[key] ?? TAB_TEMPLATES.default
  return templates.slice(0, 4).map((t, i) => ({
    id: `sport-tab-${i}-${t.slug}`,
    ...t,
  }))
}

export function slugifyTabLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 32)
}
