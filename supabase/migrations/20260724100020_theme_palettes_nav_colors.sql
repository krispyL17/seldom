-- Theme palettes + customizable sidebar bookmark colors

alter table public.user_preferences
  add column if not exists theme_palette text not null default 'classic';

alter table public.user_preferences
  add column if not exists nav_tab_colors jsonb not null default '{}'::jsonb;

alter table public.user_preferences
  drop constraint if exists user_preferences_theme_palette_check;

alter table public.user_preferences
  add constraint user_preferences_theme_palette_check
  check (theme_palette in ('classic', 'sunset', 'ocean'));

update public.user_preferences
set theme_palette = 'classic'
where theme_palette is null or theme_palette = '';

update public.user_preferences
set nav_tab_colors = '{}'::jsonb
where nav_tab_colors is null;
