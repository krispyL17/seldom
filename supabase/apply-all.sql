-- Seldom: apply all tables (tasks, goals, journal_entries, training_sessions)
--
-- HOW THIS WORKS:
-- • Running this in SQL Editor CREATES TABLES directly.
-- • It will NOT show up under Supabase "Migrations" in the dashboard.
--   That list is only populated by `supabase db push` via the CLI.
-- • For college tables, also run: supabase/apply-college.sql
-- • For soccer tables, also run: supabase/apply-soccer.sql
-- • After running, verify with: supabase/verify-tables.sql (should show 16 tables)
-- • Preferred workflow: npm run supabase:push (see supabase/MIGRATIONS.md)
--
-- Safe to re-run: uses IF NOT EXISTS / DROP IF EXISTS where needed.

-- ─── Shared trigger function ───────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ─── Tasks ─────────────────────────────────────────────────────────────────

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  category text,
  deadline timestamptz,
  completed boolean not null default false,
  estimated_duration integer check (estimated_duration is null or estimated_duration >= 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_user_id_idx on public.tasks (user_id);
create index if not exists tasks_deadline_idx on public.tasks (deadline);
create index if not exists tasks_completed_idx on public.tasks (completed);
alter table public.tasks enable row level security;

drop policy if exists "Users can view own tasks" on public.tasks;
drop policy if exists "Users can insert own tasks" on public.tasks;
drop policy if exists "Users can update own tasks" on public.tasks;
drop policy if exists "Users can delete own tasks" on public.tasks;

create policy "Users can view own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks for delete using (auth.uid() = user_id);

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks for each row execute function public.set_updated_at();

-- ─── Goals ─────────────────────────────────────────────────────────────────

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text,
  target_date date,
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  milestones jsonb not null default '[]'::jsonb,
  category text,
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists goals_user_id_idx on public.goals (user_id);
create index if not exists goals_status_idx on public.goals (status);
create index if not exists goals_target_date_idx on public.goals (target_date);
alter table public.goals enable row level security;

drop policy if exists "Users can view own goals" on public.goals;
drop policy if exists "Users can insert own goals" on public.goals;
drop policy if exists "Users can update own goals" on public.goals;
drop policy if exists "Users can delete own goals" on public.goals;

create policy "Users can view own goals" on public.goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on public.goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on public.goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own goals" on public.goals for delete using (auth.uid() = user_id);

drop trigger if exists goals_set_updated_at on public.goals;
create trigger goals_set_updated_at before update on public.goals for each row execute function public.set_updated_at();

-- ─── Journal entries ───────────────────────────────────────────────────────

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null default current_date,
  mood text not null check (mood in ('great', 'good', 'okay', 'low', 'rough')),
  energy_level integer not null check (energy_level >= 1 and energy_level <= 5),
  reflection text,
  wins text,
  challenges text,
  tomorrows_focus text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journal_entries_user_id_idx on public.journal_entries (user_id);
create index if not exists journal_entries_entry_date_idx on public.journal_entries (entry_date desc);
alter table public.journal_entries enable row level security;

drop policy if exists "Users can view own journal entries" on public.journal_entries;
drop policy if exists "Users can insert own journal entries" on public.journal_entries;
drop policy if exists "Users can update own journal entries" on public.journal_entries;
drop policy if exists "Users can delete own journal entries" on public.journal_entries;

create policy "Users can view own journal entries" on public.journal_entries for select using (auth.uid() = user_id);
create policy "Users can insert own journal entries" on public.journal_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own journal entries" on public.journal_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own journal entries" on public.journal_entries for delete using (auth.uid() = user_id);

drop trigger if exists journal_entries_set_updated_at on public.journal_entries;
create trigger journal_entries_set_updated_at before update on public.journal_entries for each row execute function public.set_updated_at();

-- ─── Training sessions ───────────────────────────────────────────────────────

create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  session_date date not null default current_date,
  duration_min integer not null check (duration_min > 0 and duration_min <= 600),
  position_played text not null check (char_length(trim(position_played)) > 0),
  intensity integer not null check (intensity >= 1 and intensity <= 10),
  mood text not null check (mood in ('great', 'good', 'okay', 'low', 'rough')),
  energy_level integer not null check (energy_level >= 1 and energy_level <= 5),
  technical_ratings jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists training_sessions_user_id_idx on public.training_sessions (user_id);
create index if not exists training_sessions_session_date_idx on public.training_sessions (session_date desc);
alter table public.training_sessions enable row level security;

drop policy if exists "Users can view own training sessions" on public.training_sessions;
drop policy if exists "Users can insert own training sessions" on public.training_sessions;
drop policy if exists "Users can update own training sessions" on public.training_sessions;
drop policy if exists "Users can delete own training sessions" on public.training_sessions;

create policy "Users can view own training sessions" on public.training_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own training sessions" on public.training_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own training sessions" on public.training_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own training sessions" on public.training_sessions for delete using (auth.uid() = user_id);

drop trigger if exists training_sessions_set_updated_at on public.training_sessions;
create trigger training_sessions_set_updated_at before update on public.training_sessions for each row execute function public.set_updated_at();
