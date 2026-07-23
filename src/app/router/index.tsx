/**
 * Application route definitions.
 */
import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from '@components/auth/ProtectedRoute'
import { GuestRoute } from '@components/auth/GuestRoute'
import { MainLayout } from '@components/layout/MainLayout'
import { PageSkeleton } from '@components/ui/PanelSkeleton'
import {
  LoginPage,
  SignUpPage,
  ForgotPasswordPage,
  ResetPasswordPage,
} from '@features/auth'
import { HomePage } from '@features/dashboard'
import { TasksPage } from '@features/tasks'
import { GoalsPage } from '@features/goals'
import { JournalPage } from '@features/journal'
import { SettingsPage } from '@features/settings'

const CollegeLayout = lazy(() =>
  import('@features/college').then((m) => ({ default: m.CollegeLayout })),
)
const CollegeDashboardPage = lazy(() =>
  import('@features/college').then((m) => ({ default: m.CollegeDashboardPage })),
)
const CollegeProfilePage = lazy(() =>
  import('@features/college').then((m) => ({ default: m.CollegeProfilePage })),
)
const ActivitiesResumePage = lazy(() =>
  import('@features/college').then((m) => ({ default: m.ActivitiesResumePage })),
)
const CommonAppPage = lazy(() =>
  import('@features/college').then((m) => ({ default: m.CommonAppPage })),
)
const TimelinePage = lazy(() =>
  import('@features/college').then((m) => ({ default: m.TimelinePage })),
)

const SoccerLayout = lazy(() =>
  import('@features/soccer').then((m) => ({ default: m.SoccerLayout })),
)
const SoccerOverviewPage = lazy(() =>
  import('@features/soccer').then((m) => ({ default: m.SoccerOverviewPage })),
)
const TrainingSessionsPage = lazy(() =>
  import('@features/soccer').then((m) => ({ default: m.TrainingSessionsPage })),
)
const MatchesPage = lazy(() =>
  import('@features/soccer').then((m) => ({ default: m.MatchesPage })),
)
const TechnicalSkillsPage = lazy(() =>
  import('@features/soccer').then((m) => ({ default: m.TechnicalSkillsPage })),
)
const PhysicalMetricsPage = lazy(() =>
  import('@features/soccer').then((m) => ({ default: m.PhysicalMetricsPage })),
)
const WeaknessesPage = lazy(() =>
  import('@features/soccer').then((m) => ({ default: m.WeaknessesPage })),
)
const StrengthsPage = lazy(() =>
  import('@features/soccer').then((m) => ({ default: m.StrengthsPage })),
)
const AiCoachPage = lazy(() =>
  import('@features/soccer').then((m) => ({ default: m.AiCoachPage })),
)
const ProgressChartsPage = lazy(() =>
  import('@features/soccer').then((m) => ({ default: m.ProgressChartsPage })),
)
const RunningPage = lazy(() =>
  import('@features/soccer').then((m) => ({ default: m.RunningPage })),
)

const CalendarPage = lazy(() =>
  import('@features/calendar').then((m) => ({ default: m.CalendarPage })),
)
const AnalyticsPage = lazy(() =>
  import('@features/analytics').then((m) => ({ default: m.AnalyticsPage })),
)
const AssistantPage = lazy(() =>
  import('@features/assistant').then((m) => ({ default: m.AssistantPage })),
)

function RouteFallback() {
  return (
    <div className="mx-auto max-w-[1600px] animate-fade-in p-4">
      <PageSkeleton panels={3} />
    </div>
  )
}

export function AppRouter() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Password reset — outside guest guard (recovery session is authenticated) */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Auth pages — redirect to home if already signed in */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* App pages — require authentication */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="goals" element={<GoalsPage />} />
            <Route path="college" element={<CollegeLayout />}>
              <Route index element={<CollegeDashboardPage />} />
              <Route path="activities" element={<ActivitiesResumePage />} />
              <Route path="common-app" element={<CommonAppPage />} />
              <Route path="timeline" element={<TimelinePage />} />
              <Route path="schools/:collegeId" element={<CollegeProfilePage />} />
            </Route>
            <Route path="journal" element={<JournalPage />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="soccer" element={<SoccerLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<SoccerOverviewPage />} />
              <Route path="training" element={<TrainingSessionsPage />} />
              <Route path="running" element={<RunningPage />} />
              <Route path="matches" element={<MatchesPage />} />
              <Route path="technical" element={<TechnicalSkillsPage />} />
              <Route path="physical" element={<PhysicalMetricsPage />} />
              <Route path="weaknesses" element={<WeaknessesPage />} />
              <Route path="strengths" element={<StrengthsPage />} />
              <Route path="coach" element={<AiCoachPage />} />
              <Route path="progress" element={<ProgressChartsPage />} />
            </Route>
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
