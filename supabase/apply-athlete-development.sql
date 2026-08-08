-- Apply athlete development migration (dev / manual)
-- Run in Supabase SQL editor after linking project

alter table public.soccer_user_data
  add column if not exists athlete_development jsonb not null default '{}'::jsonb;

alter table public.training_sessions
  add column if not exists side_balance jsonb;

comment on column public.soccer_user_data.athlete_development is
  'JSON: streak, injuryMode, sideProfile, customTabs, knowledgeImports';

comment on column public.training_sessions.side_balance is
  'JSON: { dominant_pct, weak_pct } optional side balance for session';
