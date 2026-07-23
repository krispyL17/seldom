-- Soccer coach data: matches, performance insights, external prompt overrides
-- Safe to re-run. Requires set_updated_at() from migration 20260722100000.

create table if not exists public.soccer_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  match_date date not null default current_date,
  opponent text not null check (char_length(trim(opponent)) > 0),
  competition text,
  result text not null check (result in ('W', 'D', 'L')),
  score text,
  minutes integer not null default 90 check (minutes >= 0 and minutes <= 120),
  goals integer not null default 0 check (goals >= 0),
  assists integer not null default 0 check (assists >= 0),
  rating numeric(3, 1) check (rating is null or (rating >= 1 and rating <= 10)),
  highlights text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists soccer_matches_user_id_idx on public.soccer_matches (user_id);
create index if not exists soccer_matches_match_date_idx on public.soccer_matches (match_date desc);

alter table public.soccer_matches enable row level security;

drop policy if exists "Users can view own soccer matches" on public.soccer_matches;
drop policy if exists "Users can insert own soccer matches" on public.soccer_matches;
drop policy if exists "Users can update own soccer matches" on public.soccer_matches;
drop policy if exists "Users can delete own soccer matches" on public.soccer_matches;

create policy "Users can view own soccer matches"
  on public.soccer_matches for select
  using (auth.uid() = user_id);

create policy "Users can insert own soccer matches"
  on public.soccer_matches for insert
  with check (auth.uid() = user_id);

create policy "Users can update own soccer matches"
  on public.soccer_matches for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own soccer matches"
  on public.soccer_matches for delete
  using (auth.uid() = user_id);

drop trigger if exists soccer_matches_set_updated_at on public.soccer_matches;

create trigger soccer_matches_set_updated_at
  before update on public.soccer_matches
  for each row
  execute function public.set_updated_at();

-- Weaknesses and strengths tracked for the AI coach

create table if not exists public.soccer_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  insight_type text not null check (insight_type in ('weakness', 'strength')),
  title text not null check (char_length(trim(title)) > 0),
  description text,
  priority text check (priority is null or priority in ('high', 'medium', 'low')),
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists soccer_insights_user_id_idx on public.soccer_insights (user_id);
create index if not exists soccer_insights_type_idx on public.soccer_insights (insight_type);

alter table public.soccer_insights enable row level security;

drop policy if exists "Users can view own soccer insights" on public.soccer_insights;
drop policy if exists "Users can insert own soccer insights" on public.soccer_insights;
drop policy if exists "Users can update own soccer insights" on public.soccer_insights;
drop policy if exists "Users can delete own soccer insights" on public.soccer_insights;

create policy "Users can view own soccer insights"
  on public.soccer_insights for select
  using (auth.uid() = user_id);

create policy "Users can insert own soccer insights"
  on public.soccer_insights for insert
  with check (auth.uid() = user_id);

create policy "Users can update own soccer insights"
  on public.soccer_insights for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own soccer insights"
  on public.soccer_insights for delete
  using (auth.uid() = user_id);

drop trigger if exists soccer_insights_set_updated_at on public.soccer_insights;

create trigger soccer_insights_set_updated_at
  before update on public.soccer_insights
  for each row
  execute function public.set_updated_at();

-- Optional DB overrides for AI prompt templates (defaults live in config/prompts/*.json)

create table if not exists public.ai_prompts (
  id text primary key,
  module text not null,
  content jsonb not null,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create index if not exists ai_prompts_module_idx on public.ai_prompts (module);

alter table public.ai_prompts enable row level security;

drop policy if exists "Authenticated users can read active prompts" on public.ai_prompts;

create policy "Authenticated users can read active prompts"
  on public.ai_prompts for select
  using (auth.role() = 'authenticated' and active = true);
