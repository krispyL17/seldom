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
  AuthCallbackPage,
} from '@features/auth'
import { HomePage } from '@features/dashboard'
import { TasksPage } from '@features/tasks'
import { GoalsPage } from '@features/goals'
import { JournalPage } from '@features/journal'
import { SettingsPage, AiSettingsPage } from '@features/settings'

const CollegeLayout = lazy(() =>
  import('@features/college').then((m) => ({ default: m.CollegeLayout })),
)
const CollegeOverviewPage = lazy(() =>
  import('@features/college').then((m) => ({ default: m.CollegeOverviewPage })),
)
const CollegeSchoolsPage = lazy(() =>
  import('@features/college').then((m) => ({ default: m.CollegeSchoolsPage })),
)
const CollegeDeadlinesPage = lazy(() =>
  import('@features/college').then((m) => ({ default: m.CollegeDeadlinesPage })),
)
const CollegeEssaysPage = lazy(() =>
  import('@features/college').then((m) => ({ default: m.CollegeEssaysPage })),
)
const CollegePlanningPage = lazy(() =>
  import('@features/college').then((m) => ({ default: m.CollegePlanningPage })),
)
const CollegeAdvisorPage = lazy(() =>
  import('@features/college').then((m) => ({ default: m.CollegeAdvisorPage })),
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
const GymPage = lazy(() =>
  import('@features/soccer').then((m) => ({ default: m.GymPage })),
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
const RunningPage = lazy(() =>
  import('@features/soccer').then((m) => ({ default: m.RunningPage })),
)
const SoccerOverviewPage = lazy(() =>
  import('@features/soccer').then((m) => ({ default: m.SoccerOverviewPage })),
)
const RecoveryPage = lazy(() =>
  import('@features/soccer').then((m) => ({ default: m.RecoveryPage })),
)
const PerformancePreferencesPage = lazy(() =>
  import('@features/soccer/components/pages/PerformancePreferencesPage').then((m) => ({
    default: m.PerformancePreferencesPage,
  })),
)
const ProgressionPage = lazy(() =>
  import('@features/soccer').then((m) => ({ default: m.ProgressionPage })),
)
const CustomSportTabPage = lazy(() =>
  import('@features/soccer').then((m) => ({ default: m.CustomSportTabPage })),
)
const KnowledgeImportPage = lazy(() =>
  import('@features/soccer').then((m) => ({ default: m.KnowledgeImportPage })),
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
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

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
              <Route index element={<CollegeOverviewPage />} />
              <Route path="schools" element={<CollegeSchoolsPage />} />
              <Route path="schools/:collegeId" element={<CollegeProfilePage />} />
              <Route path="deadlines" element={<CollegeDeadlinesPage />} />
              <Route path="essays" element={<CollegeEssaysPage />} />
              <Route path="common-app" element={<CommonAppPage />} />
              <Route path="planning" element={<CollegePlanningPage />} />
              <Route path="activities" element={<ActivitiesResumePage />} />
              <Route path="advisor" element={<CollegeAdvisorPage />} />
              <Route path="timeline" element={<TimelinePage />} />
            </Route>
            <Route path="journal" element={<JournalPage />} />
            <Route path="calendar" element={<CalendarPage />} />
              <Route path="soccer" element={<SoccerLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<SoccerOverviewPage />} />
              <Route path="training" element={<Navigate to="/soccer/overview" replace />} />
              <Route path="running" element={<RunningPage />} />
              <Route path="gym" element={<GymPage />} />
              <Route path="matches" element={<Navigate to="/soccer/overview" replace />} />
              <Route path="technical" element={<Navigate to="/soccer/progression" replace />} />
              <Route path="physical" element={<PhysicalMetricsPage />} />
              <Route path="weaknesses" element={<WeaknessesPage />} />
              <Route path="strengths" element={<StrengthsPage />} />
              <Route path="coach" element={<Navigate to="/assistant?mode=soccer_drills" replace />} />
              <Route path="progress" element={<Navigate to="/soccer/progression" replace />} />
              <Route path="progression" element={<ProgressionPage />} />
              <Route path="recovery" element={<RecoveryPage />} />
              <Route path="preferences" element={<PerformancePreferencesPage />} />
              <Route path="knowledge" element={<KnowledgeImportPage />} />
              <Route path="tab/:tabSlug" element={<CustomSportTabPage />} />
              <Route path="stats" element={<Navigate to="/soccer/progression" replace />} />
            </Route>
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="assistant" element={<AssistantPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="settings/ai" element={<AiSettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  )
}
