-- Overview panel preferences (home dashboard insight slot)

alter table public.user_preferences
  add column if not exists overview_insight_mode text not null default 'analytics'
    check (overview_insight_mode in ('analytics', 'college')),
  add column if not exists overview_college_prompt_dismissed_at timestamptz;
