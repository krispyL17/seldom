-- Apply ALL RLS policies (idempotent) — run in Supabase SQL Editor
-- Same content as migration 20260722100012_ensure_rls_policies.sql
--
-- "policy ... does not exist, skipping" on DROP POLICY IF EXISTS is NORMAL on
-- first run (PostgreSQL NOTICE). CREATE POLICY always runs after each DROP.

-- ─── tasks ───────────────────────────────────────────────────────────────────
alter table public.tasks enable row level security;
drop policy if exists "Users can view own tasks" on public.tasks;
drop policy if exists "Users can insert own tasks" on public.tasks;
drop policy if exists "Users can update own tasks" on public.tasks;
drop policy if exists "Users can delete own tasks" on public.tasks;
create policy "Users can view own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks for delete using (auth.uid() = user_id);

-- ─── goals ───────────────────────────────────────────────────────────────────
alter table public.goals enable row level security;
drop policy if exists "Users can view own goals" on public.goals;
drop policy if exists "Users can insert own goals" on public.goals;
drop policy if exists "Users can update own goals" on public.goals;
drop policy if exists "Users can delete own goals" on public.goals;
create policy "Users can view own goals" on public.goals for select using (auth.uid() = user_id);
create policy "Users can insert own goals" on public.goals for insert with check (auth.uid() = user_id);
create policy "Users can update own goals" on public.goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own goals" on public.goals for delete using (auth.uid() = user_id);

-- ─── journal_entries ───────────────────────────────────────────────────────────
alter table public.journal_entries enable row level security;
drop policy if exists "Users can view own journal entries" on public.journal_entries;
drop policy if exists "Users can insert own journal entries" on public.journal_entries;
drop policy if exists "Users can update own journal entries" on public.journal_entries;
drop policy if exists "Users can delete own journal entries" on public.journal_entries;
create policy "Users can view own journal entries" on public.journal_entries for select using (auth.uid() = user_id);
create policy "Users can insert own journal entries" on public.journal_entries for insert with check (auth.uid() = user_id);
create policy "Users can update own journal entries" on public.journal_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own journal entries" on public.journal_entries for delete using (auth.uid() = user_id);

-- ─── training_sessions ───────────────────────────────────────────────────────
alter table public.training_sessions enable row level security;
drop policy if exists "Users can view own training sessions" on public.training_sessions;
drop policy if exists "Users can insert own training sessions" on public.training_sessions;
drop policy if exists "Users can update own training sessions" on public.training_sessions;
drop policy if exists "Users can delete own training sessions" on public.training_sessions;
create policy "Users can view own training sessions" on public.training_sessions for select using (auth.uid() = user_id);
create policy "Users can insert own training sessions" on public.training_sessions for insert with check (auth.uid() = user_id);
create policy "Users can update own training sessions" on public.training_sessions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own training sessions" on public.training_sessions for delete using (auth.uid() = user_id);

-- ─── colleges ────────────────────────────────────────────────────────────────
alter table public.colleges enable row level security;
drop policy if exists "Users can view own colleges" on public.colleges;
drop policy if exists "Users can insert own colleges" on public.colleges;
drop policy if exists "Users can update own colleges" on public.colleges;
drop policy if exists "Users can delete own colleges" on public.colleges;
create policy "Users can view own colleges" on public.colleges for select using (auth.uid() = user_id);
create policy "Users can insert own colleges" on public.colleges for insert with check (auth.uid() = user_id);
create policy "Users can update own colleges" on public.colleges for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own colleges" on public.colleges for delete using (auth.uid() = user_id);

-- ─── college_activities ────────────────────────────────────────────────────────
alter table public.college_activities enable row level security;
drop policy if exists "Users can view own college activities" on public.college_activities;
drop policy if exists "Users can insert own college activities" on public.college_activities;
drop policy if exists "Users can update own college activities" on public.college_activities;
drop policy if exists "Users can delete own college activities" on public.college_activities;
create policy "Users can view own college activities" on public.college_activities for select using (auth.uid() = user_id);
create policy "Users can insert own college activities" on public.college_activities for insert with check (auth.uid() = user_id);
create policy "Users can update own college activities" on public.college_activities for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own college activities" on public.college_activities for delete using (auth.uid() = user_id);

-- ─── college_awards ──────────────────────────────────────────────────────────
alter table public.college_awards enable row level security;
drop policy if exists "Users can view own college awards" on public.college_awards;
drop policy if exists "Users can insert own college awards" on public.college_awards;
drop policy if exists "Users can update own college awards" on public.college_awards;
drop policy if exists "Users can delete own college awards" on public.college_awards;
create policy "Users can view own college awards" on public.college_awards for select using (auth.uid() = user_id);
create policy "Users can insert own college awards" on public.college_awards for insert with check (auth.uid() = user_id);
create policy "Users can update own college awards" on public.college_awards for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own college awards" on public.college_awards for delete using (auth.uid() = user_id);

-- ─── college_projects ────────────────────────────────────────────────────────
alter table public.college_projects enable row level security;
drop policy if exists "Users can view own college projects" on public.college_projects;
drop policy if exists "Users can insert own college projects" on public.college_projects;
drop policy if exists "Users can update own college projects" on public.college_projects;
drop policy if exists "Users can delete own college projects" on public.college_projects;
create policy "Users can view own college projects" on public.college_projects for select using (auth.uid() = user_id);
create policy "Users can insert own college projects" on public.college_projects for insert with check (auth.uid() = user_id);
create policy "Users can update own college projects" on public.college_projects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own college projects" on public.college_projects for delete using (auth.uid() = user_id);

-- ─── college_user_data ───────────────────────────────────────────────────────
alter table public.college_user_data enable row level security;
drop policy if exists "Users can view own college user data" on public.college_user_data;
drop policy if exists "Users can insert own college user data" on public.college_user_data;
drop policy if exists "Users can update own college user data" on public.college_user_data;
create policy "Users can view own college user data" on public.college_user_data for select using (auth.uid() = user_id);
create policy "Users can insert own college user data" on public.college_user_data for insert with check (auth.uid() = user_id);
create policy "Users can update own college user data" on public.college_user_data for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── run_logs ────────────────────────────────────────────────────────────────
alter table public.run_logs enable row level security;
drop policy if exists "Users can view own run logs" on public.run_logs;
drop policy if exists "Users can insert own run logs" on public.run_logs;
drop policy if exists "Users can update own run logs" on public.run_logs;
drop policy if exists "Users can delete own run logs" on public.run_logs;
create policy "Users can view own run logs" on public.run_logs for select using (auth.uid() = user_id);
create policy "Users can insert own run logs" on public.run_logs for insert with check (auth.uid() = user_id);
create policy "Users can update own run logs" on public.run_logs for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own run logs" on public.run_logs for delete using (auth.uid() = user_id);

-- ─── run_goals ─────────────────────────────────────────────────────────────────
alter table public.run_goals enable row level security;
drop policy if exists "Users can view own run goals" on public.run_goals;
drop policy if exists "Users can insert own run goals" on public.run_goals;
drop policy if exists "Users can update own run goals" on public.run_goals;
drop policy if exists "Users can delete own run goals" on public.run_goals;
create policy "Users can view own run goals" on public.run_goals for select using (auth.uid() = user_id);
create policy "Users can insert own run goals" on public.run_goals for insert with check (auth.uid() = user_id);
create policy "Users can update own run goals" on public.run_goals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own run goals" on public.run_goals for delete using (auth.uid() = user_id);

-- ─── memories ────────────────────────────────────────────────────────────────
alter table public.memories enable row level security;
drop policy if exists "Users can view own memories" on public.memories;
drop policy if exists "Users can insert own memories" on public.memories;
drop policy if exists "Users can update own memories" on public.memories;
drop policy if exists "Users can delete own memories" on public.memories;
create policy "Users can view own memories" on public.memories for select using (auth.uid() = user_id);
create policy "Users can insert own memories" on public.memories for insert with check (auth.uid() = user_id);
create policy "Users can update own memories" on public.memories for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own memories" on public.memories for delete using (auth.uid() = user_id);

-- ─── soccer_matches ────────────────────────────────────────────────────────────
alter table public.soccer_matches enable row level security;
drop policy if exists "Users can view own soccer matches" on public.soccer_matches;
drop policy if exists "Users can insert own soccer matches" on public.soccer_matches;
drop policy if exists "Users can update own soccer matches" on public.soccer_matches;
drop policy if exists "Users can delete own soccer matches" on public.soccer_matches;
create policy "Users can view own soccer matches" on public.soccer_matches for select using (auth.uid() = user_id);
create policy "Users can insert own soccer matches" on public.soccer_matches for insert with check (auth.uid() = user_id);
create policy "Users can update own soccer matches" on public.soccer_matches for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own soccer matches" on public.soccer_matches for delete using (auth.uid() = user_id);

-- ─── soccer_insights ─────────────────────────────────────────────────────────
alter table public.soccer_insights enable row level security;
drop policy if exists "Users can view own soccer insights" on public.soccer_insights;
drop policy if exists "Users can insert own soccer insights" on public.soccer_insights;
drop policy if exists "Users can update own soccer insights" on public.soccer_insights;
drop policy if exists "Users can delete own soccer insights" on public.soccer_insights;
create policy "Users can view own soccer insights" on public.soccer_insights for select using (auth.uid() = user_id);
create policy "Users can insert own soccer insights" on public.soccer_insights for insert with check (auth.uid() = user_id);
create policy "Users can update own soccer insights" on public.soccer_insights for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own soccer insights" on public.soccer_insights for delete using (auth.uid() = user_id);

-- ─── ai_prompts ──────────────────────────────────────────────────────────────
alter table public.ai_prompts enable row level security;
drop policy if exists "Authenticated users can read active prompts" on public.ai_prompts;
create policy "Authenticated users can read active prompts"
  on public.ai_prompts for select using (auth.role() = 'authenticated' and active = true);

-- ─── soccer_user_data ────────────────────────────────────────────────────────
alter table public.soccer_user_data enable row level security;
drop policy if exists "Users can view own soccer user data" on public.soccer_user_data;
drop policy if exists "Users can insert own soccer user data" on public.soccer_user_data;
drop policy if exists "Users can update own soccer user data" on public.soccer_user_data;
create policy "Users can view own soccer user data" on public.soccer_user_data for select using (auth.uid() = user_id);
create policy "Users can insert own soccer user data" on public.soccer_user_data for insert with check (auth.uid() = user_id);
create policy "Users can update own soccer user data" on public.soccer_user_data for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ─── user_preferences ──────────────────────────────────────────────────────────
alter table public.user_preferences enable row level security;
drop policy if exists "Users can view own preferences" on public.user_preferences;
drop policy if exists "Users can insert own preferences" on public.user_preferences;
drop policy if exists "Users can update own preferences" on public.user_preferences;
create policy "Users can view own preferences" on public.user_preferences for select using (auth.uid() = user_id);
create policy "Users can insert own preferences" on public.user_preferences for insert with check (auth.uid() = user_id);
create policy "Users can update own preferences" on public.user_preferences for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
