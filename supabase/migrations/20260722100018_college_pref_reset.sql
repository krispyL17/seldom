-- College tab opt-in + tutorial reset v4

alter table public.user_preferences
  add column if not exists college_enabled boolean not null default false;

-- Reset tutorial, tab intros, performance setup (re-run safe)
update public.user_preferences
set
  app_tutorial_completed_at = null,
  tab_intros_completed = '{}'::jsonb,
  hobby_tab_label = 'Performance',
  hobby_passion = '',
  college_enabled = false;

update public.soccer_user_data
set
  onboarding_completed_at = null,
  profile = '{}'::jsonb;

-- Clear seeded AI recommendation cards from older builds
update public.college_user_data
set ai_recommendations = '[]'::jsonb
where ai_recommendations is not null;
