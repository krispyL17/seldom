-- Seldom: ensure performance indexes exist (safe to re-run)
-- Adds indexes that may be missing if tables were created via older apply-all.sql

create index if not exists tasks_deadline_idx on public.tasks (deadline);
create index if not exists tasks_completed_idx on public.tasks (completed);
create index if not exists goals_status_idx on public.goals (status);
create index if not exists goals_target_date_idx on public.goals (target_date);
