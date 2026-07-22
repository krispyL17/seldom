import type {
  CoachMessage,
  MatchRecord,
  PerformanceInsight,
  PhysicalMetric,
  PlayerProfile,
  RatingTrend,
  SkillRating,
  TrainingSession,
  WeeklyLoad,
} from '../types'

export const playerProfile: PlayerProfile = {
  name: 'Kristian L.',
  position: 'Central Midfielder',
  preferredFoot: 'Right',
  squadNumber: 8,
  season: '2026–27',
  currentFocus: 'First touch under pressure & scanning frequency',
}

export const trainingSessions: TrainingSession[] = [
  {
    id: 't1',
    date: '2026-07-22',
    type: 'Technical + Small-sided games',
    durationMin: 90,
    intensity: 'Moderate-High',
    rpe: 7,
    focus: ['First touch', 'Scanning', 'Pressing triggers'],
    notes: 'Strong start. Fatigue visible after 70 min — passing tempo dropped.',
    rating: 7.4,
  },
  {
    id: 't2',
    date: '2026-07-20',
    type: 'Match simulation',
    durationMin: 85,
    intensity: 'High',
    rpe: 8,
    focus: ['Transition play', 'Defensive shape'],
    notes: 'Good pressing first half. Lost concentration after 60 min.',
    rating: 7.2,
  },
  {
    id: 't3',
    date: '2026-07-18',
    type: 'Recovery + mobility',
    durationMin: 45,
    intensity: 'Low',
    rpe: 4,
    focus: ['Mobility', 'Activation'],
    notes: 'Light session. Hamstring felt good.',
    rating: 6.5,
  },
  {
    id: 't4',
    date: '2026-07-16',
    type: 'Tactical — build-up patterns',
    durationMin: 75,
    intensity: 'Moderate',
    rpe: 6,
    focus: ['Build-up', 'Third-man runs', 'Passing lanes'],
    notes: 'Improved awareness in half-spaces. Need more weight on through balls.',
    rating: 7.6,
  },
  {
    id: 't5',
    date: '2026-07-14',
    type: 'Finishing & composure',
    durationMin: 60,
    intensity: 'Moderate-High',
    rpe: 7,
    focus: ['Finishing', 'Weak foot', 'Composure'],
    notes: 'Weak-foot finishes improving. 4/7 on target.',
    rating: 7.0,
  },
]

export const matches: MatchRecord[] = [
  {
    id: 'm1',
    date: '2026-07-19',
    opponent: 'City United',
    competition: 'Summer League',
    result: 'W',
    score: '3–1',
    minutes: 90,
    goals: 1,
    assists: 1,
    rating: 7.8,
    highlights: 'Assist from deep, 89% pass accuracy, 3 key passes',
  },
  {
    id: 'm2',
    date: '2026-07-12',
    opponent: 'Northside FC',
    competition: 'Summer League',
    result: 'D',
    score: '2–2',
    minutes: 78,
    goals: 0,
    assists: 1,
    rating: 7.1,
    highlights: 'Created 2 big chances. Lost duels in midfield second half.',
  },
  {
    id: 'm3',
    date: '2026-07-05',
    opponent: 'Academy Select',
    competition: 'Friendly',
    result: 'L',
    score: '0–2',
    minutes: 90,
    goals: 0,
    assists: 0,
    rating: 6.4,
    highlights: 'Struggled under high press. 72% pass accuracy.',
  },
  {
    id: 'm4',
    date: '2026-06-28',
    opponent: 'Metro Athletic',
    competition: 'Summer League',
    result: 'W',
    score: '4–0',
    minutes: 67,
    goals: 2,
    assists: 0,
    rating: 8.2,
    highlights: 'Man of the match. 2 goals, 5/5 dribbles.',
  },
]

export const technicalSkills: SkillRating[] = [
  { id: 'passing', name: 'Passing', value: 14, trend: 'up' },
  { id: 'dribbling', name: 'Dribbling', value: 13, trend: 'stable' },
  { id: 'first-touch', name: 'First Touch', value: 15, trend: 'up' },
  { id: 'vision', name: 'Vision', value: 14, trend: 'stable' },
  { id: 'finishing', name: 'Finishing', value: 12, trend: 'up' },
  { id: 'weak-foot', name: 'Weak Foot', value: 10, trend: 'up' },
  { id: 'crossing', name: 'Crossing', value: 11, trend: 'stable' },
  { id: 'long-shots', name: 'Long Shots', value: 11, trend: 'down' },
  { id: 'tackling', name: 'Tackling', value: 13, trend: 'stable' },
  { id: 'positioning', name: 'Positioning', value: 14, trend: 'up' },
  { id: 'composure', name: 'Composure', value: 13, trend: 'stable' },
  { id: 'work-rate', name: 'Work Rate', value: 16, trend: 'stable' },
]

export const physicalMetrics: PhysicalMetric[] = [
  { id: 'sprint', name: 'Top Speed', value: 31.2, unit: 'km/h', benchmark: 32, trend: 'up' },
  { id: 'distance', name: 'Avg Match Distance', value: 10.8, unit: 'km', benchmark: 11, trend: 'stable' },
  { id: 'sprints', name: 'Sprints / Match', value: 24, unit: '', benchmark: 28, trend: 'up' },
  { id: 'hr-avg', name: 'Avg Heart Rate', value: 158, unit: 'bpm', benchmark: 165, trend: 'stable' },
  { id: 'hr-max', name: 'Max Heart Rate', value: 192, unit: 'bpm', benchmark: 195, trend: 'stable' },
  { id: 'vo2', name: 'VO₂ Estimate', value: 52, unit: 'ml/kg', benchmark: 55, trend: 'up' },
  { id: 'body-fat', name: 'Body Fat', value: 11.2, unit: '%', benchmark: 10, trend: 'down' },
  { id: 'jump', name: 'Vertical Jump', value: 58, unit: 'cm', benchmark: 60, trend: 'up' },
]

export const weaknesses: PerformanceInsight[] = [
  {
    id: 'w1',
    title: 'Weak-foot passing under pressure',
    description: 'Pass completion drops 18% when pressed on non-dominant side. Limit exposure until 80% short-pass target met.',
    priority: 'high',
    category: 'Technical',
  },
  {
    id: 'w2',
    title: 'Late-game concentration',
    description: 'Match ratings drop ~0.8 after 70 minutes. Stamina and decision-making both decline in final third.',
    priority: 'high',
    category: 'Mental / Physical',
  },
  {
    id: 'w3',
    title: 'Aerial duels',
    description: 'Win rate 42% in aerial contests. Below CM benchmark of 55%.',
    priority: 'medium',
    category: 'Physical',
  },
  {
    id: 'w4',
    title: 'Long-range shooting',
    description: 'Shot conversion from 18+ yards at 6%. Focus on closer-range composure drills first.',
    priority: 'low',
    category: 'Technical',
  },
]

export const strengths: PerformanceInsight[] = [
  {
    id: 's1',
    title: 'Pressing intensity',
    description: 'Consistently among top 3 in team for pressures and recoveries. Sets tempo defensively.',
    priority: 'high',
    category: 'Tactical',
  },
  {
    id: 's2',
    title: 'Progressive passing',
    description: '4.2 progressive passes per 90 — above squad average. Strong at breaking lines with weight.',
    priority: 'high',
    category: 'Technical',
  },
  {
    id: 's3',
    title: 'Work rate & engine',
    description: 'Rating 16/20. Covers ground efficiently. Maintains output in high-tempo sessions.',
    priority: 'medium',
    category: 'Physical',
  },
  {
    id: 's4',
    title: 'First touch in space',
    description: 'Clean reception when not pressed. Opens passing lanes quickly on half-turn.',
    priority: 'medium',
    category: 'Technical',
  },
]

export const weeklyLoad: WeeklyLoad[] = [
  { week: 'W1 Jun', minutes: 280, sessions: 3, avgRpe: 6.2 },
  { week: 'W2 Jun', minutes: 310, sessions: 4, avgRpe: 6.8 },
  { week: 'W3 Jun', minutes: 295, sessions: 3, avgRpe: 6.5 },
  { week: 'W4 Jun', minutes: 340, sessions: 4, avgRpe: 7.0 },
  { week: 'W1 Jul', minutes: 355, sessions: 4, avgRpe: 7.2 },
  { week: 'W2 Jul', minutes: 340, sessions: 4, avgRpe: 6.9 },
  { week: 'W3 Jul', minutes: 320, sessions: 4, avgRpe: 6.7 },
]

export const ratingTrends: RatingTrend[] = [
  { week: 'W1 Jun', matchRating: 6.8, trainingRating: 6.9 },
  { week: 'W2 Jun', matchRating: 7.0, trainingRating: 7.1 },
  { week: 'W3 Jun', matchRating: 6.5, trainingRating: 6.8 },
  { week: 'W4 Jun', matchRating: 7.4, trainingRating: 7.2 },
  { week: 'W1 Jul', matchRating: 7.2, trainingRating: 7.3 },
  { week: 'W2 Jul', matchRating: 7.6, trainingRating: 7.4 },
  { week: 'W3 Jul', matchRating: 7.1, trainingRating: 7.2 },
]

export const coachMessages: CoachMessage[] = [
  {
    id: 'c1',
    role: 'assistant',
    content: 'Performance hub online. I can analyze sessions, review match data, and build training plans once AI is connected.',
    timestamp: '2026-07-22T08:00:00',
  },
]

export const aiCoachTips = [
  'Reduce high-intensity volume tomorrow — weekly load at 94%.',
  'Add 15 min weak-foot rondo before each session.',
  'Scanning drill in warm-up: 6+ checks per possession target.',
  'Schedule lighter day before Saturday match.',
]

export const weeklyWorkload = {
  sessions: 4,
  totalMinutes: 340,
  target: 360,
  loadStatus: 'On track',
}
