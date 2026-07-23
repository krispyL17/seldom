-- Verify RLS policies — run in Supabase SQL Editor
-- Query 1: All policies on public tables
select schemaname, tablename, policyname, cmd, qual, with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- Query 2: Expected vs missing policies
with expected as (
  select * from (values
    ('tasks', 'Users can view own tasks'),
    ('tasks', 'Users can insert own tasks'),
    ('tasks', 'Users can update own tasks'),
    ('tasks', 'Users can delete own tasks'),
    ('goals', 'Users can view own goals'),
    ('goals', 'Users can insert own goals'),
    ('goals', 'Users can update own goals'),
    ('goals', 'Users can delete own goals'),
    ('journal_entries', 'Users can view own journal entries'),
    ('journal_entries', 'Users can insert own journal entries'),
    ('journal_entries', 'Users can update own journal entries'),
    ('journal_entries', 'Users can delete own journal entries'),
    ('training_sessions', 'Users can view own training sessions'),
    ('training_sessions', 'Users can insert own training sessions'),
    ('training_sessions', 'Users can update own training sessions'),
    ('training_sessions', 'Users can delete own training sessions'),
    ('colleges', 'Users can view own colleges'),
    ('colleges', 'Users can insert own colleges'),
    ('colleges', 'Users can update own colleges'),
    ('colleges', 'Users can delete own colleges'),
    ('college_activities', 'Users can view own college activities'),
    ('college_activities', 'Users can insert own college activities'),
    ('college_activities', 'Users can update own college activities'),
    ('college_activities', 'Users can delete own college activities'),
    ('college_awards', 'Users can view own college awards'),
    ('college_awards', 'Users can insert own college awards'),
    ('college_awards', 'Users can update own college awards'),
    ('college_awards', 'Users can delete own college awards'),
    ('college_projects', 'Users can view own college projects'),
    ('college_projects', 'Users can insert own college projects'),
    ('college_projects', 'Users can update own college projects'),
    ('college_projects', 'Users can delete own college projects'),
    ('college_user_data', 'Users can view own college user data'),
    ('college_user_data', 'Users can insert own college user data'),
    ('college_user_data', 'Users can update own college user data'),
    ('run_logs', 'Users can view own run logs'),
    ('run_logs', 'Users can insert own run logs'),
    ('run_logs', 'Users can update own run logs'),
    ('run_logs', 'Users can delete own run logs'),
    ('run_goals', 'Users can view own run goals'),
    ('run_goals', 'Users can insert own run goals'),
    ('run_goals', 'Users can update own run goals'),
    ('run_goals', 'Users can delete own run goals'),
    ('memories', 'Users can view own memories'),
    ('memories', 'Users can insert own memories'),
    ('memories', 'Users can update own memories'),
    ('memories', 'Users can delete own memories'),
    ('soccer_matches', 'Users can view own soccer matches'),
    ('soccer_matches', 'Users can insert own soccer matches'),
    ('soccer_matches', 'Users can update own soccer matches'),
    ('soccer_matches', 'Users can delete own soccer matches'),
    ('soccer_insights', 'Users can view own soccer insights'),
    ('soccer_insights', 'Users can insert own soccer insights'),
    ('soccer_insights', 'Users can update own soccer insights'),
    ('soccer_insights', 'Users can delete own soccer insights'),
    ('ai_prompts', 'Authenticated users can read active prompts'),
    ('soccer_user_data', 'Users can view own soccer user data'),
    ('soccer_user_data', 'Users can insert own soccer user data'),
    ('soccer_user_data', 'Users can update own soccer user data'),
    ('user_preferences', 'Users can view own preferences'),
    ('user_preferences', 'Users can insert own preferences'),
    ('user_preferences', 'Users can update own preferences')
  ) as t(tablename, policyname)
),
existing as (
  select tablename, policyname
  from pg_policies
  where schemaname = 'public'
)
select
  e.tablename,
  e.policyname,
  case when x.policyname is not null then 'ok' else 'MISSING' end as status
from expected e
left join existing x on x.tablename = e.tablename and x.policyname = e.policyname
order by e.tablename, e.policyname;

-- If any MISSING: run supabase/apply-all-policies.sql in SQL Editor, or npm run supabase:push
