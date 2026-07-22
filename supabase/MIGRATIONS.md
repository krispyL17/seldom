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

Run `supabase/verify-tables.sql` in **SQL Editor**. Query 2 should show all 9 tables as `yes`:

- `tasks`, `goals`, `journal_entries`, `training_sessions`
- `colleges`, `college_activities`, `college_awards`, `college_projects`, `college_user_data`

Query 3 should list migration versions `20260722100000` through `20260722100005`.

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

After running these manually, you **must** run `npm run supabase:repair` before `supabase:push`, or the CLI will try to re-create existing objects.

## npm scripts

| Script | What it does |
|--------|----------------|
| `supabase:push` | Apply pending migrations (`supabase db push`) |
| `supabase:migration:list` | Show local vs remote migration status |
| `supabase:repair` | Mark migrations 00000–00004 as applied |
| `supabase:repair:legacy` | Revert old 001–004 history entries |
