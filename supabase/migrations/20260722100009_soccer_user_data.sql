-- Soccer user profile + onboarding state
-- Safe to re-run. Requires set_updated_at() from migration 20260722100000.

create table if not exists public.soccer_user_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  onboarding_completed_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.soccer_user_data enable row level security;

drop policy if exists "Users can view own soccer user data" on public.soccer_user_data;
drop policy if exists "Users can insert own soccer user data" on public.soccer_user_data;
drop policy if exists "Users can update own soccer user data" on public.soccer_user_data;

create policy "Users can view own soccer user data"
  on public.soccer_user_data for select
  using (auth.uid() = user_id);

create policy "Users can insert own soccer user data"
  on public.soccer_user_data for insert
  with check (auth.uid() = user_id);

create policy "Users can update own soccer user data"
  on public.soccer_user_data for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists soccer_user_data_set_updated_at on public.soccer_user_data;

create trigger soccer_user_data_set_updated_at
  before update on public.soccer_user_data
  for each row
  execute function public.set_updated_at();
