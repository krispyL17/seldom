-- Seldom: training_sessions table

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

create policy "Users can view own training sessions"
  on public.training_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own training sessions"
  on public.training_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own training sessions"
  on public.training_sessions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own training sessions"
  on public.training_sessions for delete
  using (auth.uid() = user_id);

drop trigger if exists training_sessions_set_updated_at on public.training_sessions;

create trigger training_sessions_set_updated_at
  before update on public.training_sessions
  for each row
  execute function public.set_updated_at();
