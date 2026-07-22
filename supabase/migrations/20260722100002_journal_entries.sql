-- Seldom: journal_entries table

create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  entry_date date not null default current_date,
  mood text not null check (mood in ('great', 'good', 'okay', 'low', 'rough')),
  energy_level integer not null check (energy_level >= 1 and energy_level <= 5),
  reflection text,
  wins text,
  challenges text,
  tomorrows_focus text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists journal_entries_user_id_idx on public.journal_entries (user_id);
create index if not exists journal_entries_entry_date_idx on public.journal_entries (entry_date desc);

alter table public.journal_entries enable row level security;

create policy "Users can view own journal entries"
  on public.journal_entries for select
  using (auth.uid() = user_id);

create policy "Users can insert own journal entries"
  on public.journal_entries for insert
  with check (auth.uid() = user_id);

create policy "Users can update own journal entries"
  on public.journal_entries for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own journal entries"
  on public.journal_entries for delete
  using (auth.uid() = user_id);

drop trigger if exists journal_entries_set_updated_at on public.journal_entries;

create trigger journal_entries_set_updated_at
  before update on public.journal_entries
  for each row
  execute function public.set_updated_at();
