/**
 * Realistic placeholder data for the dashboard command center.
 * All values are static — will be replaced by Supabase / AI services later.
 */

import type { CalendarEventType, RecoveryStatus } from '@/types'

export const dailyBriefing = {
  summary:
    'Strong recovery overnight. HRV is up 8% from baseline — good day for technical work. Two deadlines approaching this week. Prioritize film review before evening session.',
  priorities: [
    { id: '1', text: 'Complete agility drill block (45 min)', done: false },
    { id: '2', text: 'Review match footage — pressing triggers', done: false },
    { id: '3', text: 'Log nutrition for pre-training meal', done: true },
  ],
  recovery: {
    score: 82,
    status: 'Good' as RecoveryStatus,
    sleep: '7h 24m',
    hrv: 68,
    readiness: 'Ready to train',
  },
  deadlines: [
    { id: 'd1', title: 'Season goal review', date: 'Jul 24', daysLeft: 2 },
    { id: 'd2', title: 'Training plan submission', date: 'Jul 26', daysLeft: 4 },
  ],
}

export const tasksData = {
  completionRate: 67,
  active: [
    { id: 't1', title: 'Ball mastery — weak foot series', due: 'Today', overdue: false, progress: 40 },
    { id: 't2', title: 'Stretching routine post-session', due: 'Today', overdue: false, progress: 0 },
    { id: 't3', title: 'Update weekly training log', due: 'Yesterday', overdue: true, progress: 75 },
    { id: 't4', title: 'Call physio — ankle check-in', due: 'Jul 24', overdue: false, progress: 0 },
  ],
}

export const soccerHub = {
  currentFocus: 'First touch under pressure & scanning frequency',
  nextTraining: {
    type: 'Technical + Small-sided games',
    time: 'Today, 6:00 PM',
    duration: '90 min',
    intensity: 'Moderate-High',
  },
  technicalRatings: [
    { skill: 'Passing', value: 14, max: 20 },
    { skill: 'Dribbling', value: 13, max: 20 },
    { skill: 'First Touch', value: 15, max: 20 },
    { skill: 'Vision', value: 14, max: 20 },
    { skill: 'Work Rate', value: 16, max: 20 },
  ],
  lastSession: {
    date: 'Jul 20',
    type: 'Match simulation',
    duration: '85 min',
    rating: 7.2,
    notes: 'Strong pressing first half. Passing accuracy dropped after 60 min.',
  },
  weeklyWorkload: {
    sessions: 4,
    totalMinutes: 340,
    target: 360,
    loadStatus: 'On track',
  },
  aiRecommendation:
    'Reduce high-intensity volume tomorrow. Focus on recovery jog and mobility. Your weekly load is at 94% — one lighter day prevents overreach.',
}

export const goalsData = [
  {
    id: 'g1',
    title: 'Improve weak-foot passing accuracy',
    progress: 62,
    milestone: '80% short-pass completion',
    eta: 'Aug 2026',
    suggestion: 'Add 15 min weak-foot rondo before each session',
  },
  {
    id: 'g2',
    title: 'Reach match fitness baseline',
    progress: 78,
    milestone: 'Complete 90 min at RPE 7+',
    eta: 'Sep 2026',
    suggestion: 'Extend Saturday session by 10 min weekly',
  },
  {
    id: 'g3',
    title: 'Read the game — scanning habit',
    progress: 45,
    milestone: '6+ scans per possession',
    eta: 'Oct 2026',
    suggestion: 'Use scanning cues drill in warm-up',
  },
]

export const calendarEvents: Array<{
  id: string
  day: string
  date: number
  isoDate: string
  title: string
  time: string
  type: CalendarEventType
}> = [
  { id: 'c1', day: 'Wed', date: 22, isoDate: '2026-07-22', title: 'Technical training', time: '18:00', type: 'training' },
  { id: 'c2', day: 'Thu', date: 23, isoDate: '2026-07-23', title: 'Recovery + mobility', time: '10:00', type: 'recovery' },
  { id: 'c3', day: 'Fri', date: 24, isoDate: '2026-07-24', title: 'Tactical review', time: '17:30', type: 'tactical' },
  { id: 'c4', day: 'Sat', date: 25, isoDate: '2026-07-25', title: 'Match day', time: '15:00', type: 'match' },
  { id: 'c5', day: 'Sun', date: 26, isoDate: '2026-07-26', title: 'Active recovery', time: '11:00', type: 'recovery' },
]

export const journalEntries = [
  {
    id: 'j1',
    date: 'Jul 21',
    preview: 'Felt sharp in morning session. Ankle a bit tight after sprints…',
    mood: 'Focused',
    energy: 4,
  },
  {
    id: 'j2',
    date: 'Jul 20',
    preview: 'Match sim was intense. Need better fueling strategy at halftime.',
    mood: 'Tired',
    energy: 3,
  },
  {
    id: 'j3',
    date: 'Jul 19',
    preview: 'Recovery day. Sleep was excellent — HRV bounced back.',
    mood: 'Calm',
    energy: 5,
  },
]

export const performanceAnalytics = {
  trainingFrequency: [3, 4, 5, 4, 4, 5, 4],
  taskCompletion: [55, 62, 70, 58, 75, 67, 72],
  goalProgress: [40, 42, 45, 48, 52, 58, 62],
  sleepHours: [6.5, 7, 7.5, 6, 7.2, 7.8, 7.4],
  recoveryScores: [70, 75, 78, 65, 80, 82, 82],
  weekLabels: ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'],
}

export const insightsData = {
  aiInsights: [
    'Your best training days follow 7+ hours of sleep.',
    'Task completion drops 22% on double-session days.',
    'Weak-foot drills correlate with improved match ratings.',
  ],
  personalRecords: [
    { label: 'Longest training streak', value: '14 days' },
    { label: 'Best session rating', value: '8.4' },
    { label: 'Most tasks in a week', value: '23' },
  ],
  streaks: [
    { label: 'Daily journal', count: 12, unit: 'days' },
    { label: 'Training logged', count: 8, unit: 'sessions' },
    { label: 'Recovery score 80+', count: 5, unit: 'days' },
  ],
  motivation:
    'Consistency beats intensity. You\'ve hit 4 sessions this week — one more puts you ahead of your monthly average.',
  suggestedAction: {
    title: 'Pre-training scan drill',
    description: '10 min before today\'s session to reinforce your scanning goal.',
    duration: '10 min',
  },
}
