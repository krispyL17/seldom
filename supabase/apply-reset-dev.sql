-- Seldom dev reset: first-login state for ALL users. Keeps auth.users only.
-- Run in Supabase Dashboard → SQL Editor, then bump TUTORIAL_RESET_VERSION locally (currently 5).
-- Re-run safe.

alter table public.user_preferences
  add column if not exists college_enabled boolean not null default false;

alter table public.user_preferences
  add column if not exists tab_intros_completed jsonb not null default '{}'::jsonb;

alter table public.user_preferences
  add column if not exists distance_unit text not null default 'mi';

alter table public.user_preferences
  add column if not exists theme_palette text not null default 'classic';

alter table public.user_preferences
  add column if not exists nav_tab_colors jsonb not null default '{}'::jsonb;

-- Delete all user-scoped app data
delete from public.tasks;
delete from public.journal_entries;
delete from public.training_sessions;
delete from public.run_logs;
delete from public.run_goals;
delete from public.goals;
delete from public.college_activities;
delete from public.college_awards;
delete from public.college_projects;
delete from public.colleges;
delete from public.soccer_matches;
delete from public.soccer_insights;
delete from public.memories;

-- Reset per-user profile rows (keep user_id links to auth)
update auth.users
set raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) - 'display_name';

update public.soccer_user_data
set
  onboarding_completed_at = null,
  profile = '{}'::jsonb;

update public.college_user_data
set
  test_scores = '{"sat":{"score":null,"status":"not_taken","date":null},"act":{"score":null,"status":"not_taken","date":null}}'::jsonb,
  financial_aid = '[]'::jsonb,
  recommendations = '[]'::jsonb,
  scholarships = '[]'::jsonb,
  ai_recommendations = '[]'::jsonb,
  common_app = '{"activityDescriptions":[],"essayIdeas":[],"personalStatementDrafts":[],"supplementalTracking":[],"reflectionNotes":[]}'::jsonb,
  resume_settings = '{"template":"classic","selectedActivityIds":[],"selectedAwardIds":[],"selectedProjectIds":[],"applicationPhase":"junior","seniorModeStartedAt":null,"onboardingCompletedAt":null,"studentProfile":null}'::jsonb;

update public.user_preferences
set
  app_tutorial_completed_at = null,
  tab_intros_completed = '{}'::jsonb,
  hobby_tab_label = 'Performance',
  hobby_passion = '',
  theme = 'dark',
  theme_palette = 'classic',
  nav_tab_colors = '{}'::jsonb,
  animations_enabled = true,
  browser_notifications_enabled = false,
  email_notifications_enabled = false,
  reminder_lead_minutes = 60,
  calendar_sync_prompted_at = null,
  distance_unit = 'mi',
  college_enabled = false;
