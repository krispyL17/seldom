-- Custom user themes (two slots) + extended palette ids

alter table public.user_preferences
  add column if not exists custom_themes jsonb not null default '{}'::jsonb;

alter table public.user_preferences
  drop constraint if exists user_preferences_theme_palette_check;

alter table public.user_preferences
  add constraint user_preferences_theme_palette_check
  check (theme_palette in ('classic', 'sunset', 'ocean', 'custom-1', 'custom-2'));

update public.user_preferences
set custom_themes = '{}'::jsonb
where custom_themes is null;
