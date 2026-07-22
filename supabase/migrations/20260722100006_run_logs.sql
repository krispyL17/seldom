-- Seldom: distance running logs + pace goals

create table if not exists public.run_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  run_date date not null default current_date,
  distance_m numeric(10, 2) not null check (distance_m > 0),
  distance_label text not null check (char_length(trim(distance_label)) > 0),
  duration_sec integer not null check (duration_sec > 0),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists run_logs_user_id_idx on public.run_logs (user_id);
create index if not exists run_logs_run_date_idx on public.run_logs (run_date desc);
create index if not exists run_logs_distance_m_idx on public.run_logs (distance_m);

alter table public.run_logs enable row level security;

drop policy if exists "Users can view own run logs" on public.run_logs;
drop policy if exists "Users can insert own run logs" on public.run_logs;
drop policy if exists "Users can update own run logs" on public.run_logs;
drop policy if exists "Users can delete own run logs" on public.run_logs;

create policy "Users can view own run logs"
  on public.run_logs for select using (auth.uid() = user_id);
create policy "Users can insert own run logs"
  on public.run_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own run logs"
  on public.run_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own run logs"
  on public.run_logs for delete using (auth.uid() = user_id);

drop trigger if exists run_logs_set_updated_at on public.run_logs;
create trigger run_logs_set_updated_at
  before update on public.run_logs
  for each row execute function public.set_updated_at();

-- Pace goals for specific distances (mile, 5K, custom)

create table if not exists public.run_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  distance_m numeric(10, 2) not null check (distance_m > 0),
  distance_label text not null check (char_length(trim(distance_label)) > 0),
  target_duration_sec integer not null check (target_duration_sec > 0),
  deadline date,
  achieved_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists run_goals_user_id_idx on public.run_goals (user_id);
create index if not exists run_goals_distance_m_idx on public.run_goals (distance_m);

alter table public.run_goals enable row level security;

drop policy if exists "Users can view own run goals" on public.run_goals;
drop policy if exists "Users can insert own run goals" on public.run_goals;
drop policy if exists "Users can update own run goals" on public.run_goals;
drop policy if exists "Users can delete own run goals" on public.run_goals;

create policy "Users can view own run goals"
  on public.run_goals for select using (auth.uid() = user_id);
create policy "Users can insert own run goals"
  on public.run_goals for insert with check (auth.uid() = user_id);
create policy "Users can update own run goals"
  on public.run_goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own run goals"
  on public.run_goals for delete using (auth.uid() = user_id);

drop trigger if exists run_goals_set_updated_at on public.run_goals;
create trigger run_goals_set_updated_at
  before update on public.run_goals
  for each row execute function public.set_updated_at();
