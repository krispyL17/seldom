-- Reset app tutorial, tab intros, sport/hobby labels, and performance onboarding for ALL users.
-- Safe to re-run. Run once when you want everyone to retake setup + tutorial.

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
