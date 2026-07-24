-- Apply user_preferences table (idempotent). Run in Supabase SQL editor if not using CLI push.

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  hobby_tab_label text not null default 'Performance',
  hobby_passion text not null default '',
  theme text not null default 'dark' check (theme in ('dark', 'light', 'system')),
  animations_enabled boolean not null default true,
  app_tutorial_completed_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

drop policy if exists "Users can view own preferences" on public.user_preferences;
drop policy if exists "Users can insert own preferences" on public.user_preferences;
drop policy if exists "Users can update own preferences" on public.user_preferences;

create policy "Users can view own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "Users can insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "Users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;

alter table public.user_preferences
  add column if not exists tab_intros_completed jsonb not null default '{}'::jsonb;

