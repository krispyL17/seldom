-- Reset tutorial, tab intros, and performance setup (re-run safe).
-- Bump TUTORIAL_RESET_VERSION locally to match.

update public.user_preferences
set
  app_tutorial_completed_at = null,
  tab_intros_completed = '{}'::jsonb,
  hobby_tab_label = 'Performance',
  hobby_passion = '';

update public.soccer_user_data
set
  onboarding_completed_at = null,
  profile = '{}'::jsonb;
