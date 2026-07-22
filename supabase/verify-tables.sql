-- Seldom table verification — run in Supabase Dashboard → SQL Editor → Run
--
-- Query 1: All public tables (shows everything in your database)
select table_name
from information_schema.tables
where table_schema = 'public'
  and table_type = 'BASE TABLE'
order by table_name;

-- Query 2: Seldom app tables — expected vs missing
with expected as (
  select unnest(array[
    'tasks',
    'goals',
    'journal_entries',
    'training_sessions',
    'run_logs',
    'run_goals',
    'colleges',
    'college_activities',
    'college_awards',
    'college_projects',
    'college_user_data'
  ]) as table_name
),
existing as (
  select table_name
  from information_schema.tables
  where table_schema = 'public'
    and table_type = 'BASE TABLE'
)
select
  e.table_name,
  case when x.table_name is not null then 'yes' else 'MISSING' end as exists
from expected e
left join existing x on x.table_name = e.table_name
order by e.table_name;

-- Query 3: Migration history (CLI tracking — separate from Table Editor)
select version, name
from supabase_migrations.schema_migrations
order by version;

-- Expected: Query 2 shows 11 rows, all "yes".
-- Migration history should include 20260722100000 through 20260722100005.
-- If any MISSING, run npm run supabase:push or supabase/apply-college.sql