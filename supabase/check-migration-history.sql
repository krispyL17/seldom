-- Run in Supabase SQL Editor FIRST to see what the remote thinks is applied.
-- Compare "version" column to files in supabase/migrations/

select version, name, statements
from supabase_migrations.schema_migrations
order by version;

-- Local files should be:
--   20260722100000  tasks
--   20260722100001  goals
--   20260722100002  journal_entries
--   20260722100003  training_sessions
--   20260722100004  college_applications
--   20260722100005  ensure_indexes
--   20260722100006  run_logs
--   20260722100007  vector_memories
--   20260722100008  soccer_coach
--   20260722100009  soccer_user_data
--   20260722100010  user_preferences
--   20260722100011  notification_prefs
--   20260722100012  ensure_rls_policies
