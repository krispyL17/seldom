-- Reset tutorial + sport setup for ALL users (idempotent).
-- Run in Supabase Dashboard → SQL Editor, or via: npm run supabase:push (includes migration 00014)

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

-- Verify (optional):
-- select user_id, app_tutorial_completed_at, hobby_tab_label, hobby_passion, tab_intros_completed
-- from public.user_preferences;
-- select user_id, onboarding_completed_at, profile from public.soccer_user_data;
