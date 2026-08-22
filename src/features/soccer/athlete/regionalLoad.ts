export interface RegionalSessionInput {
  session_date: string
  duration_min: number
  intensity: number
  skills?: { slug: string; label: string }[]
  team_session?: boolean
}

function sessionLoadUnits(durationMin: number, intensity: number): number {
  return durationMin * (intensity / 10)
}

export interface SkillRef {
  slug: string
  label: string
}

export interface RegionalLoadEntry {
  id: string
  label: string
  load: number
  percent: number
  sessionTouches: number
  sources: string[]
  region: 'upper' | 'lower' | 'core' | 'full'
}

const REGION_META: Record<string, { label: string; region: RegionalLoadEntry['region'] }> = {
  quads: { label: 'Quads', region: 'lower' },
  hamstrings: { label: 'Hamstrings', region: 'lower' },
  calves: { label: 'Calves', region: 'lower' },
  hip_flexors: { label: 'Hip flexors', region: 'lower' },
  ankles: { label: 'Ankles & feet', region: 'lower' },
  core: { label: 'Core', region: 'core' },
  upper_back: { label: 'Upper back', region: 'upper' },
  glutes: { label: 'Glutes', region: 'lower' },
}

/** Skill slug → body regions (biomechanics-informed, not keyword guessing on session title). */
const SLUG_REGIONS: Record<string, string[]> = {
  'weak-foot': ['calves', 'hip_flexors', 'quads'],
  'first-touch': ['ankles', 'hip_flexors', 'core'],
  finishing: ['quads', 'hip_flexors', 'core'],
  scanning: ['core'],
  passing: ['hip_flexors', 'core', 'calves'],
  dribbling: ['hip_flexors', 'ankles', 'core'],
  crossing: ['hip_flexors', 'core', 'quads'],
  acceleration: ['quads', 'hamstrings', 'calves'],
  '1v1-defending': ['quads', 'hamstrings', 'core'],
  'route-running': ['hamstrings', 'calves', 'hip_flexors'],
  footwork: ['ankles', 'calves', 'hip_flexors'],
  pace: ['quads', 'hamstrings', 'calves'],
  endurance: ['quads', 'hamstrings', 'calves'],
  form: ['core', 'hip_flexors', 'calves'],
  'race-prep': ['quads', 'hamstrings', 'calves'],
  shooting: ['quads', 'core', 'hip_flexors'],
  'ball-handling': ['hip_flexors', 'core', 'ankles'],
  defense: ['quads', 'hamstrings', 'core'],
  'court-vision': ['core'],
  technique: ['hip_flexors', 'core'],
  consistency: ['core'],
  speed: ['quads', 'hamstrings', 'calves'],
  'decision-making': ['core'],
}

const LABEL_HINTS: { pattern: RegExp; regions: string[] }[] = [
  { pattern: /finishing|shoot|strike|goal/, regions: ['quads', 'hip_flexors', 'core'] },
  { pattern: /pass|cross/, regions: ['hip_flexors', 'core', 'calves'] },
  { pattern: /dribbl|touch|foot/, regions: ['ankles', 'hip_flexors', 'core'] },
  { pattern: /sprint|accel|speed|pace/, regions: ['quads', 'hamstrings', 'calves'] },
  { pattern: /defend|1v1/, regions: ['quads', 'hamstrings', 'core'] },
  { pattern: /scan|vision|decision/, regions: ['core'] },
  { pattern: /endurance|cardio|run/, regions: ['quads', 'hamstrings', 'calves'] },
]

export function resolveSkillRegions(slug: string, label: string): string[] {
  const fromSlug = SLUG_REGIONS[slug]
  if (fromSlug?.length) return fromSlug

  const lower = label.toLowerCase()
  for (const hint of LABEL_HINTS) {
    if (hint.pattern.test(lower)) return hint.regions
  }

  return ['hip_flexors', 'core']
}

interface RegionAccumulator {
  load: number
  sources: Set<string>
  sessionTouches: number
}

function addRegionLoad(
  map: Map<string, RegionAccumulator>,
  regionId: string,
  load: number,
  source: string,
) {
  const cur = map.get(regionId) ?? { load: 0, sources: new Set<string>(), sessionTouches: 0 }
  cur.load += load
  cur.sources.add(source)
  cur.sessionTouches += 1
  map.set(regionId, cur)
}

function contributeSession(
  map: Map<string, RegionAccumulator>,
  session: RegionalSessionInput,
  since: string,
) {
  if (session.session_date < since) return
  const skills = session.skills ?? []
  if (skills.length === 0) return

  const multiplier = session.team_session ? 0.5 : 1
  const totalLoad = sessionLoadUnits(session.duration_min, session.intensity) * multiplier
  const perSkillLoad = totalLoad / skills.length

  for (const skill of skills) {
    const regions = resolveSkillRegions(skill.slug, skill.label)
    const perRegion = perSkillLoad / regions.length
    for (const regionId of regions) {
      addRegionLoad(map, regionId, perRegion, skill.label)
    }
  }
}

function contributeRuns(
  map: Map<string, RegionAccumulator>,
  runMinutes: number,
  sourceLabel = 'Cardio runs',
) {
  if (runMinutes <= 0) return
  const totalLoad = runMinutes * 0.7
  const regions = ['quads', 'hamstrings', 'calves']
  const perRegion = totalLoad / regions.length
  for (const regionId of regions) {
    addRegionLoad(map, regionId, perRegion, sourceLabel)
  }
}

export function computeRegionalLoad(
  sessions: RegionalSessionInput[],
  runMinutesLast7: number,
  since: string,
): RegionalLoadEntry[] {
  const map = new Map<string, RegionAccumulator>()

  for (const session of sessions) {
    contributeSession(map, session, since)
  }
  contributeRuns(map, runMinutesLast7)

  const totalLoad = [...map.values()].reduce((s, v) => s + v.load, 0)
  if (totalLoad <= 0) return []

  return [...map.entries()]
    .map(([id, acc]) => ({
      id,
      label: REGION_META[id]?.label ?? id.replace(/_/g, ' '),
      load: Math.round(acc.load * 10) / 10,
      percent: Math.round((acc.load / totalLoad) * 100),
      sessionTouches: acc.sessionTouches,
      sources: [...acc.sources],
      region: REGION_META[id]?.region ?? 'full',
    }))
    .sort((a, b) => b.load - a.load)
    .slice(0, 6)
}

export function countSkillTaggedSessions(sessions: RegionalSessionInput[], since: string): number {
  return sessions.filter((s) => s.session_date >= since && (s.skills?.length ?? 0) > 0).length
}
