-- Seldom: goals table

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

create policy "Users can view own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update own goals"
  on public.goals for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own goals"
  on public.goals for delete
  using (auth.uid() = user_id);

drop trigger if exists goals_set_updated_at on public.goals;

create trigger goals_set_updated_at
  before update on public.goals
  for each row
  execute function public.set_updated_at();
