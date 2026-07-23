-- Notification preferences on user_preferences
-- Safe to re-run.

alter table public.user_preferences
  add column if not exists browser_notifications_enabled boolean not null default false,
  add column if not exists email_notifications_enabled boolean not null default false,
  add column if not exists reminder_lead_minutes integer not null default 60,
  add column if not exists calendar_sync_prompted_at timestamptz;
