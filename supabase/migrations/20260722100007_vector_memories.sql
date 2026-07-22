-- Seldom: semantic vector memory (production — Supabase pgvector)
-- Replaces local SQLite + Ollama for Vercel deployment.
-- Embeddings: OpenAI text-embedding-3-small (1536 dimensions)

create extension if not exists vector with schema extensions;

create table if not exists public.memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  title text not null,
  text text not null,
  importance integer not null check (importance >= 1 and importance <= 10),
  source_id text,
  embedding extensions.vector(1536) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists memories_user_id_idx on public.memories (user_id);
create index if not exists memories_category_idx on public.memories (category);
create index if not exists memories_created_at_idx on public.memories (created_at desc);
create index if not exists memories_embedding_idx on public.memories
  using hnsw (embedding extensions.vector_cosine_ops);

alter table public.memories enable row level security;

drop policy if exists "Users can view own memories" on public.memories;
drop policy if exists "Users can insert own memories" on public.memories;
drop policy if exists "Users can update own memories" on public.memories;
drop policy if exists "Users can delete own memories" on public.memories;

create policy "Users can view own memories"
  on public.memories for select using (auth.uid() = user_id);
create policy "Users can insert own memories"
  on public.memories for insert with check (auth.uid() = user_id);
create policy "Users can update own memories"
  on public.memories for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own memories"
  on public.memories for delete using (auth.uid() = user_id);

drop trigger if exists memories_set_updated_at on public.memories;
create trigger memories_set_updated_at
  before update on public.memories
  for each row execute function public.set_updated_at();

-- Semantic search scoped to the authenticated user (RLS + auth.uid())
create or replace function public.match_memories(
  query_embedding extensions.vector(1536),
  match_count int default 8,
  match_threshold float default 0.2
)
returns table (
  id uuid,
  category text,
  title text,
  text text,
  importance int,
  created_at timestamptz,
  similarity float
)
language sql stable
security invoker
set search_path = public, extensions
as $$
  select
    m.id,
    m.category,
    m.title,
    m.text,
    m.importance,
    m.created_at,
    1 - (m.embedding <=> query_embedding) as similarity
  from public.memories m
  where m.user_id = auth.uid()
    and 1 - (m.embedding <=> query_embedding) > match_threshold
  order by m.embedding <=> query_embedding
  limit match_count;
$$;

grant execute on function public.match_memories(extensions.vector, int, float) to authenticated;
