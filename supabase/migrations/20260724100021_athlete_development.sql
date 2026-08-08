-- Athlete development: streaks, injury mode, side tracking, custom tabs, knowledge import prep

alter table public.soccer_user_data
  add column if not exists athlete_development jsonb not null default '{}'::jsonb;

alter table public.training_sessions
  add column if not exists side_balance jsonb;
