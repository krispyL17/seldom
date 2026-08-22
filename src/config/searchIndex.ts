import { PRIMARY_SIDEBAR_NAV, UTILITY_NAV } from '@config/navigation'

export interface SearchResult {
  id: string
  label: string
  description?: string
  href: string
  keywords: string[]
}

function item(
  id: string,
  label: string,
  href: string,
  keywords: string[] = [],
  description?: string,
): SearchResult {
  return { id, label, href, keywords, description }
}

/** Static navigation index for the global search bar. */
export function buildSearchIndex(hobbyTabLabel = 'Performance', hobbyPassion = ''): SearchResult[] {
  const passion = hobbyPassion.toLowerCase()
  const perfLabel = hobbyTabLabel

  const primaryNav = PRIMARY_SIDEBAR_NAV.map((nav) =>
    item(
      nav.id,
      nav.id === 'home' ? 'Today' : nav.id === 'soccer' ? perfLabel : nav.label,
      nav.href,
      [nav.label.toLowerCase(), nav.id, nav.id === 'soccer' ? passion : ''].filter(Boolean),
    ),
  )

  const utilityNav = UTILITY_NAV.map((nav) =>
    item(nav.id, nav.label, nav.href, [nav.label.toLowerCase(), nav.id]),
  )

  const performanceRoutes: SearchResult[] = [
    item('perf-overview', `${perfLabel} overview`, '/soccer/overview', ['session', 'training', 'game', 'match', 'log', 'practice', 'overview', 'gym', passion]),
    item('perf-cardio', 'Cardio / runs', '/soccer/running', ['cardio', 'run', 'running', 'mile', '5k', passion]),
    item('perf-skills', `${perfLabel} skills & progression`, '/soccer/skills', ['progression', 'stats', 'skills', 'heatmap', 'trends', passion]),
    item('perf-recovery', 'Recovery & workload', '/soccer/recovery', ['recovery', 'workload', 'injury', passion]),
    item('perf-gym', 'Gym log', '/soccer/gym', ['gym', 'lift', 'weights', passion]),
    item('perf-knowledge', 'Import knowledge', '/soccer/knowledge', ['import', 'markdown', 'json', 'memory', 'notes']),
  ]

  const collegeRoutes: SearchResult[] = [
    item('college-overview', 'College prep overview', '/college', ['college', 'junior prep', 'overview', 'dashboard']),
    item('college-schools', 'College list & schools', '/college/schools', ['schools', 'colleges', 'list', 'reach', 'safety']),
    item('college-deadlines', 'Deadlines & timeline', '/college/deadlines', ['deadline', 'timeline', 'dates', 'calendar']),
    item('college-common', 'Common App — activities, essays & résumé', '/college/common-app', ['common app', 'essay', 'activities', 'resume', 'supplemental', 'personal statement']),
    item('college-planning', 'Testing, aid & scholarships', '/college/planning', ['sat', 'act', 'financial aid', 'scholarship', 'plan']),
    item('college-advisor', 'AI college coach', '/college/advisor', ['advisor', 'ai coach', 'college advice']),
  ]

  const utilityRoutes: SearchResult[] = [
    item('assistant', 'Seldom AI assistant', '/assistant', ['seldom ai', 'assistant', 'chat', 'help']),
    item('settings-ai', 'AI Settings (Ollama)', '/settings/ai', ['ollama', 'ai', 'model', 'local llm']),
    item('assistant-drills', 'Training drills (AI)', '/assistant?mode=soccer_drills', ['drills', 'training plan', passion]),
  ]

  const merged = [...primaryNav, ...utilityNav, ...performanceRoutes, ...collegeRoutes, ...utilityRoutes]
  const byHref = new Map<string, SearchResult>()

  for (const entry of merged) {
    const existing = byHref.get(entry.href)
    if (!existing || entry.keywords.length > existing.keywords.length) {
      byHref.set(entry.href, entry)
    }
  }

  return [...byHref.values()]
}

export function filterSearchResults(query: string, index: SearchResult[], limit = 8): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []

  const seen = new Set<string>()
  const scored = index
    .map((entry) => {
      const haystack = [entry.label, entry.description ?? '', ...entry.keywords].join(' ').toLowerCase()
      let score = 0
      if (entry.label.toLowerCase().startsWith(q)) score += 10
      if (entry.label.toLowerCase().includes(q)) score += 6
      if (haystack.includes(q)) score += 3
      for (const word of q.split(/\s+/)) {
        if (word.length > 1 && haystack.includes(word)) score += 2
      }
      return { entry, score }
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)

  const results: SearchResult[] = []
  for (const { entry } of scored) {
    if (seen.has(entry.href)) continue
    seen.add(entry.href)
    results.push(entry)
    if (results.length >= limit) break
  }

  return results
}
