import type { CalendarEventType, RecoveryStatus } from '@/types'

export const tasksData = {
  completionRate: 62,
  active: [
    { id: 't1', title: 'Finish college essay draft', progress: 40, due: 'Today', overdue: false },
    { id: 't2', title: 'SAT practice — reading section', progress: 0, due: 'Tomorrow', overdue: false },
    { id: 't3', title: 'Log training session', progress: 80, due: 'Yesterday', overdue: true },
  ],
}

export const goalsData = [
  {
    id: 'g1',
    title: 'Sub-6:30 mile',
    progress: 72,
    eta: 'Aug 2026',
    milestone: 'Consistent 6:45 tempo runs',
    suggestion: 'Add one interval session per week.',
  },
  {
    id: 'g2',
    title: 'College list finalized',
    progress: 45,
    eta: 'Sep 2026',
    milestone: 'Visit 2 campuses',
    suggestion: 'Schedule UNC info session.',
  },
]

export const journalEntries = [
  { id: 'j1', date: 'Jul 22', mood: 'Focused', energy: 4, preview: 'Strong training week. Need better sleep.' },
  { id: 'j2', date: 'Jul 21', mood: 'Tired', energy: 2, preview: 'Heavy legs after match. Recovery day helped.' },
]

export const dailyBriefing = {
  summary:
    'Midweek focus: balance college prep with training load. You have 1 overdue task and a tempo run scheduled.',
  priorities: [
    { id: 'p1', text: 'Complete SAT reading practice', done: false },
    { id: 'p2', text: 'Log yesterday\'s training session', done: false },
    { id: 'p3', text: 'Review college list targets', done: true },
  ],
  recovery: {
    status: 'Moderate' as RecoveryStatus,
    score: 68,
    note: 'Sleep was short — aim for 8h tonight.',
    sleep: '6h 45m',
    hrv: 52,
    readiness: 'Moderate',
  },
  focusBlock: { title: 'Deep work', time: '4:00–5:30 PM', task: 'Essay brainstorming' },
  deadlines: [
    { id: 'dl1', title: 'UNC EA research deadline', daysLeft: 14, date: 'Aug 5' },
    { id: 'dl2', title: 'SAT reading practice', daysLeft: 1, date: 'Jul 23' },
    { id: 'dl3', title: 'Scholarship essay draft', daysLeft: 5, date: 'Jul 27' },
  ],
}

export const calendarEvents = [
  { id: 'c1', day: 'Mon', date: '21', isoDate: '2026-07-21', title: 'Recovery run', time: '7:00 AM', type: 'recovery' as CalendarEventType },
  { id: 'c2', day: 'Tue', date: '22', isoDate: '2026-07-22', title: 'Technical session', time: '5:30 PM', type: 'training' as CalendarEventType },
  { id: 'c3', day: 'Wed', date: '23', isoDate: '2026-07-23', title: 'Tactical review', time: '4:00 PM', type: 'tactical' as CalendarEventType },
  { id: 'c4', day: 'Thu', date: '24', isoDate: '2026-07-24', title: 'Match prep', time: '6:00 PM', type: 'match' as CalendarEventType },
  { id: 'c5', day: 'Fri', date: '25', isoDate: '2026-07-25', title: 'League match', time: '3:00 PM', type: 'match' as CalendarEventType },
]

export const performanceAnalytics = {
  weekLabels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  trainingFrequency: [1, 0, 1, 1, 0, 1, 0],
  taskCompletion: [55, 60, 45, 70, 62, 80, 62],
  goalProgress: [40, 42, 45, 48, 50, 55, 58],
  sleepHours: [7.5, 6.5, 8, 7, 6, 8.5, 7],
  recoveryScores: [72, 65, 80, 70, 68, 85, 68],
}

export const soccerHub = {
  currentFocus: 'First touch under pressure',
  nextTraining: { type: 'Technical + rondos', time: 'Today 5:30 PM', duration: '90 min', intensity: 'Moderate-High' },
  weeklyWorkload: { sessions: 4, totalMinutes: 340, target: 360, loadStatus: 'On track' },
  technicalRatings: [
    { skill: 'Passing', value: 70, max: 100 },
    { skill: 'First touch', value: 75, max: 100 },
    { skill: 'Scanning', value: 65, max: 100 },
  ],
  lastSession: {
    date: 'Jul 21',
    type: 'Technical + rondos',
    rating: 7.5,
    notes: 'Good first touch under pressure. Weak foot still needs reps in tight spaces.',
  },
  lastMatch: { opponent: 'City United', result: 'W 3–1', rating: 7.8 },
  aiRecommendation:
    'Keep technical volume moderate today — add 15 minutes of weak-foot rondos before your college essay block.',
}

export const insightsData = {
  aiInsights: [
    'Training load is high — schedule a lighter day before Saturday.',
    'College essay themes are ready to outline.',
    'Mile PR trending down — on track for sub-6:30 goal.',
  ],
  personalRecords: [
    { label: 'Mile', value: '6:42' },
    { label: '5K', value: '22:10' },
    { label: 'Match rating', value: '8.2' },
  ],
  streaks: [
    { label: 'Journal', count: 12, unit: 'days' },
    { label: 'Training logged', count: 4, unit: 'weeks' },
  ],
  motivation: 'Small consistent reps beat cramming. One focused hour today moves everything forward.',
  suggestedAction: {
    title: '15-min weak-foot rondo',
    description: 'Quick technical touch before homework block.',
    duration: '15 min',
  },
}
