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
--
-- If you see old versions like 001, 002, 003, 004 → run repair commands in package.json (see below)
