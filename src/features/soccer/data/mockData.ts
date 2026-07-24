/**
 * Soccer-specific mock data for the soccer performance module.
 * All values are static — will be replaced by Supabase / AI services later.
 */

import type {
  SkillRating,
  TrainingSession,
  MatchRecord,
  PhysicalMetric,
  PerformanceInsight,
  WeeklyLoad,
  RatingTrend,
  CoachMessage,
  PlayerProfile,
} from '../types'

export const playerProfile: PlayerProfile = {
  name: 'Alex Thompson',
  position: 'Central Midfielder',
  preferredFoot: 'Right',
  squadNumber: 8,
  season: '2026/27',
  currentFocus: 'First touch under pressure & scanning frequency'
}

export const technicalSkills: SkillRating[] = [
  { id: 'passing', name: 'Passing', value: 14, max: 20, trend: 'up' },
  { id: 'dribbling', name: 'Dribbling', value: 13, max: 20, trend: 'stable' },
  { id: 'first-touch', name: 'First Touch', value: 15, max: 20, trend: 'up' },
  { id: 'crossing', name: 'Crossing', value: 11, max: 20, trend: 'down' },
  { id: 'finishing', name: 'Finishing', value: 12, max: 20, trend: 'stable' },
  { id: 'vision', name: 'Vision', value: 14, max: 20, trend: 'up' },
  { id: 'work-rate', name: 'Work Rate', value: 16, max: 20, trend: 'stable' },
  { id: 'tackling', name: 'Tackling', value: 13, max: 20, trend: 'up' },
  { id: 'heading', name: 'Heading', value: 10, max: 20, trend: 'stable' },
  { id: 'set-pieces', name: 'Set Pieces', value: 12, max: 20, trend: 'up' },
]

export const physicalMetrics: PhysicalMetric[] = [
  { id: 'pace', name: 'Pace', value: 85, unit: '%', benchmark: 80, trend: 'up' },
  { id: 'acceleration', name: 'Acceleration', value: 82, unit: '%', benchmark: 85, trend: 'stable' },
  { id: 'stamina', name: 'Stamina', value: 88, unit: '%', benchmark: 85, trend: 'up' },
  { id: 'strength', name: 'Strength', value: 76, unit: '%', benchmark: 75, trend: 'up' },
  { id: 'balance', name: 'Balance', value: 83, unit: '%', benchmark: 80, trend: 'stable' },
  { id: 'agility', name: 'Agility', value: 79, unit: '%', benchmark: 80, trend: 'down' },
  { id: 'jumping', name: 'Jumping Reach', value: 174, unit: 'cm', benchmark: 170, trend: 'stable' },
]

export const trainingSessions: TrainingSession[] = [
  {
    id: 'ts1',
    date: '2026-07-21',
    type: 'Technical + Small-sided games',
    durationMin: 90,
    intensity: 'Moderate-High',
    rpe: 7,
    focus: ['First Touch', 'Passing', 'Decision Making'],
    notes: 'Strong pressing first half. Passing accuracy dropped after 60 min.',
    rating: 7.2,
  },
  {
    id: 'ts2',
    date: '2026-07-19',
    type: 'Match simulation',
    durationMin: 85,
    intensity: 'High',
    rpe: 8,
    focus: ['Match Intensity', 'Tactical Awareness'],
    notes: 'Great work rate throughout. Need better positioning in final third.',
    rating: 7.8,
  },
  {
    id: 'ts3',
    date: '2026-07-17',
    type: 'Technical drills',
    durationMin: 75,
    intensity: 'Moderate',
    rpe: 6,
    focus: ['Ball Control', 'Weak Foot'],
    notes: 'Focused session on weak foot development. Good progress visible.',
    rating: 7.5,
  },
  {
    id: 'ts4',
    date: '2026-07-15',
    type: 'Tactical work',
    durationMin: 80,
    intensity: 'Moderate-High',
    rpe: 7,
    focus: ['Positioning', 'Pressing'],
    notes: 'Understanding of pressing triggers improved significantly.',
    rating: 8.1,
  },
  {
    id: 'ts5',
    date: '2026-07-13',
    type: 'Fitness + Technical',
    durationMin: 95,
    intensity: 'High',
    rpe: 8,
    focus: ['Endurance', 'Pass Accuracy'],
    notes: 'Tough session but maintained technique under fatigue well.',
    rating: 7.6,
  },
]

export const matches: MatchRecord[] = [
  {
    id: 'm1',
    date: '2026-07-20',
    opponent: 'City United',
    competition: 'League',
    result: 'W',
    score: '2-1',
    minutes: 87,
    goals: 1,
    assists: 1,
    rating: 8.2,
    highlights: 'Scored winner in 78th minute. Key pass for opener.',
  },
  {
    id: 'm2',
    date: '2026-07-13',
    opponent: 'Athletic FC',
    competition: 'League',
    result: 'D',
    score: '1-1',
    minutes: 90,
    goals: 0,
    assists: 1,
    rating: 7.4,
    highlights: 'Solid midfield performance. Created the equalizer.',
  },
  {
    id: 'm3',
    date: '2026-07-06',
    opponent: 'Rangers SC',
    competition: 'Cup',
    result: 'W',
    score: '3-0',
    minutes: 78,
    goals: 0,
    assists: 2,
    rating: 7.9,
    highlights: 'Two assists in first half. Dominated midfield battle.',
  },
  {
    id: 'm4',
    date: '2026-06-29',
    opponent: 'Rovers FC',
    competition: 'League',
    result: 'L',
    score: '0-2',
    minutes: 85,
    goals: 0,
    assists: 0,
    rating: 6.5,
    highlights: 'Struggled with their high press. Learning experience.',
  },
]

export const weeklyLoad: WeeklyLoad[] = [
  { week: 'Week 1', minutes: 320, sessions: 4, avgRpe: 6.8 },
  { week: 'Week 2', minutes: 380, sessions: 5, avgRpe: 7.2 },
  { week: 'Week 3', minutes: 290, sessions: 3, avgRpe: 6.5 },
  { week: 'Week 4', minutes: 360, sessions: 4, avgRpe: 7.0 },
  { week: 'Week 5', minutes: 400, sessions: 5, avgRpe: 7.5 },
  { week: 'Week 6', minutes: 340, sessions: 4, avgRpe: 6.9 },
]

export const ratingTrends: RatingTrend[] = [
  { week: 'Week 1', matchRating: 7.2, trainingRating: 7.1 },
  { week: 'Week 2', matchRating: 7.6, trainingRating: 7.4 },
  { week: 'Week 3', matchRating: 7.1, trainingRating: 7.2 },
  { week: 'Week 4', matchRating: 7.8, trainingRating: 7.6 },
  { week: 'Week 5', matchRating: 8.0, trainingRating: 7.5 },
  { week: 'Week 6', matchRating: 7.9, trainingRating: 7.7 },
]

export const weeklyWorkload = {
  sessions: 4,
  totalMinutes: 340,
  target: 360,
  loadStatus: 'On track',
}

export const strengths: PerformanceInsight[] = [
  {
    id: 's1',
    title: 'Excellent work rate and stamina',
    description: 'Consistently maintains high intensity throughout full matches. Rarely substituted due to fatigue.',
    priority: 'high',
    category: 'Physical',
  },
  {
    id: 's2',
    title: 'Strong vision and passing range',
    description: 'Can pick out teammates with long diagonal passes. Creates chances from deep positions.',
    priority: 'high',
    category: 'Technical',
  },
  {
    id: 's3',
    title: 'Leadership and communication',
    description: 'Organizes defensive shape well. Vocal in directing teammates during matches.',
    priority: 'medium',
    category: 'Mental',
  },
  {
    id: 's4',
    title: 'First touch under pressure',
    description: 'Rarely loses possession when receiving the ball in tight spaces. Excellent ball control.',
    priority: 'high',
    category: 'Technical',
  },
]

export const weaknesses: PerformanceInsight[] = [
  {
    id: 'w1',
    title: 'Weak foot accuracy needs improvement',
    description: 'Passing accuracy drops to 68% when using left foot. Affects decision-making under pressure.',
    priority: 'high',
    category: 'Technical',
  },
  {
    id: 'w2',
    title: 'Aerial duels win rate below average',
    description: 'Only winning 45% of aerial challenges. Need to improve timing and positioning.',
    priority: 'medium',
    category: 'Physical',
  },
  {
    id: 'w3',
    title: 'Shooting accuracy from distance',
    description: 'Long-range shots often off target. Better shot selection needed outside the box.',
    priority: 'medium',
    category: 'Technical',
  },
  {
    id: 'w4',
    title: 'Concentration lapses in final 15 minutes',
    description: 'Tendency to lose focus late in matches. Need better energy management strategies.',
    priority: 'high',
    category: 'Mental',
  },
]

export const aiCoachTips: PerformanceInsight[] = [
  {
    id: 'tip1',
    title: 'Pre-training scan drill',
    description: '10 min before today\'s session to reinforce your scanning goal. Focus on head movements.',
    priority: 'high',
    category: 'Tactical',
  },
  {
    id: 'tip2',
    title: 'Weak foot passing practice',
    description: 'Add 15 min weak-foot rondo before each session. Start with stationary passes.',
    priority: 'high',
    category: 'Technical',
  },
  {
    id: 'tip3',
    title: 'Recovery nutrition timing',
    description: 'Consume protein within 30 minutes post-training. Your recovery score improves 15% with proper timing.',
    priority: 'medium',
    category: 'Physical',
  },
  {
    id: 'tip4',
    title: 'Match preparation routine',
    description: 'Review tactical notes 90 minutes before kickoff. Your performance rating averages 0.3 points higher.',
    priority: 'medium',
    category: 'Mental',
  },
]

export const coachMessages: CoachMessage[] = [
  {
    id: 'cm1',
    role: 'assistant',
    content: 'Based on your recent sessions, I notice your passing accuracy drops after the 60-minute mark. This suggests we should work on maintaining concentration under fatigue. How do you feel about adding some high-intensity decision-making drills to your training?',
    timestamp: '2026-07-21T14:30:00Z',
  },
  {
    id: 'cm2',
    role: 'user',
    content: 'I agree, I do feel my decision-making gets rushed when I\'m tired. What specific drills would you recommend?',
    timestamp: '2026-07-21T14:35:00Z',
  },
  {
    id: 'cm3',
    role: 'assistant',
    content: 'Great awareness! I suggest starting with "tired legs, sharp mind" drills. After 70 minutes of regular training, we\'ll add 15 minutes of quick passing triangles with decision points. This trains your brain to stay sharp when your body is fatigued.',
    timestamp: '2026-07-21T14:37:00Z',
  },
  {
    id: 'cm4',
    role: 'user',
    content: 'That makes sense. Should I focus on any particular type of passes during these drills?',
    timestamp: '2026-07-21T14:40:00Z',
  },
  {
    id: 'cm5',
    role: 'assistant',
    content: 'Focus on your weak foot first - that\'s where fatigue hits hardest. Start with short passes (5-15m) and build up to switching play. Your data shows left foot accuracy needs the most work under pressure.',
    timestamp: '2026-07-21T14:42:00Z',
  },
]