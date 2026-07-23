# Supabase migrations

Seldom uses the **Supabase CLI** as the source of truth for schema changes.

## Quick start (new project or fresh link)

```powershell
npm run supabase:login
npm run supabase:link
npm run supabase:push
```

This applies everything in `supabase/migrations/` and records history in the dashboard **Migrations** tab.

## Verify

Run `supabase/verify-tables.sql` in **SQL Editor**. Query 2 should show all 17 tables as `yes`:

| Group | Tables |
|-------|--------|
| Core | `tasks`, `goals`, `journal_entries`, `training_sessions` |
| Running | `run_logs`, `run_goals` |
| College | `colleges`, `college_activities`, `college_awards`, `college_projects`, `college_user_data` |
| Memory | `memories` |
| Soccer | `soccer_matches`, `soccer_insights`, `soccer_user_data`, `ai_prompts` |
| App | `user_preferences` |

Query 3 should list migration versions `20260722100000` through `20260722100012`.

Run `supabase/verify-policies.sql` Query 2 — every row should show `ok`, not `MISSING`.

## Migration files

| Version | Contents |
|---------|----------|
| `20260722100000` | `tasks` + `set_updated_at()` |
| `20260722100001` | `goals` |
| `20260722100002` | `journal_entries` |
| `20260722100003` | `training_sessions` |
| `20260722100004` | College module (5 tables) |
| `20260722100005` | Performance indexes |
| `20260722100006` | `run_logs`, `run_goals` |
| `20260722100007` | `memories` (pgvector) |
| `20260722100008` | `soccer_matches`, `soccer_insights`, `ai_prompts` |
| `20260722100009` | `soccer_user_data` |
| `20260722100010` | `user_preferences` |
| `20260722100011` | Notification columns on `user_preferences` |
| `20260722100012` | **Re-apply all RLS policies** (fixes missing policies after repair) |

## "Policy does not exist, skipping" — this is normal

When you run `apply-soccer.sql`, `apply-all-policies.sql`, or migrations that use
`DROP POLICY IF EXISTS`, PostgreSQL prints a **NOTICE** like:

```
NOTICE: policy "Users can view own soccer user data" for relation "soccer_user_data" does not exist, skipping
```

That is **not an error**. It only means the policy wasn't there yet on the DROP step.
The next `CREATE POLICY` line still runs and creates it.

## Missing policies after `supabase:repair`

`npm run supabase:repair` marks migrations as **applied in history** without running
their SQL. If tables were created via SQL Editor but policies were never applied,
`db push` will **skip** those old migrations and policies stay missing.

**Fix (pick one):**

```powershell
# Option A — CLI (recommended)
npm run supabase:push
# Applies migration 20260722100012 which recreates every policy
```

```text
# Option B — SQL Editor immediately
# Paste and run: supabase/apply-all-policies.sql
```

Then verify with `supabase/verify-policies.sql` (Query 2 → all `ok`).

**Do not run `supabase:repair` unless** tables already exist and you only need to
sync migration history. After repair, always run `apply-all-policies.sql` or push
migration `00012`.

## Adding a new migration

```powershell
npx supabase migration new your_feature_name
```

Edit the generated file in `supabase/migrations/`, then:

```powershell
npm run supabase:push
```

### Migration checklist

- Use `create table if not exists` and `create index if not exists`
- Use `drop policy if exists` before `create policy` (idempotent)
- Use `drop trigger if exists` before `create trigger`
- Never edit a migration that is already applied on production — add a new one instead

## If tables exist but CLI history is wrong

This happens when SQL was pasted in the **SQL Editor** instead of using `db push`.

```powershell
# 1. Check history (SQL Editor → check-migration-history.sql)
# 2. Mark all current migrations as applied
npm run supabase:repair

# 3. Push any new migrations only
npm run supabase:push

# 4. If policies may be missing, run apply-all-policies.sql in SQL Editor
#    or ensure migration 00012 is applied
```

If you have legacy versions `001`–`004` in history from an old setup:

```powershell
npm run supabase:repair:legacy
npm run supabase:repair
npm run supabase:push
```

## Emergency SQL Editor scripts

Only use when CLI is unavailable:

| Script | Purpose |
|--------|---------|
| `apply-all.sql` | Core 4 tables |
| `apply-college.sql` | College 5 tables |
| `apply-soccer.sql` | Soccer coach + profile tables |
| `apply-user-preferences.sql` | App-wide user preferences |
| `apply-notification-prefs.sql` | Notification settings columns |
| `apply-all-policies.sql` | **Fix all RLS policies** (idempotent) |

After running these manually, you **must** run `npm run supabase:repair` before `supabase:push`, or the CLI will try to re-create existing objects. **Then run `apply-all-policies.sql`** if policies might be missing.

## npm scripts

| Script | What it does |
|--------|----------------|
| `supabase:push` | Apply pending migrations (`supabase db push`) |
| `supabase:migration:list` | Show local vs remote migration status |
| `supabase:repair` | Mark migrations 00000–00011 as applied (does **not** run SQL!) |
| `supabase:repair:legacy` | Revert old 001–004 history entries |
