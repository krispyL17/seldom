-- Track first-visit tab intro popups (idempotent)

alter table public.user_preferences
  add column if not exists tab_intros_completed jsonb not null default '{}'::jsonb;
