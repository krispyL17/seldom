-- Run in Supabase SQL Editor after pulling migration 20260722100017

alter table public.training_sessions
  add column if not exists high_points text,
  add column if not exists work_on text,
  add column if not exists goal_id uuid references public.goals (id) on delete set null;

alter table public.tasks
  add column if not exists goal_id uuid references public.goals (id) on delete set null;

alter table public.user_preferences
  add column if not exists distance_unit text not null default 'mi'
  check (distance_unit in ('km', 'mi'));

create index if not exists training_sessions_goal_id_idx on public.training_sessions (goal_id);
create index if not exists tasks_goal_id_idx on public.tasks (goal_id);
