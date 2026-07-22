# Deploying Seldom on Vercel

Seldom on Vercel runs the **AI on demand** — no Ollama, no local sidecars. Each chat message triggers `/api/assistant/chat`, which embeds the query, searches Supabase pgvector memory, runs trusted web search, and calls OpenAI.

## One-time setup

### 1. Push database migrations

```powershell
npm run supabase:push
```

This creates the `memories` table with pgvector (migration `20260722100007`).

### 2. Connect Vercel

```powershell
npx vercel link
```

### 3. Set environment variables

In **Vercel Dashboard → Project → Settings → Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_URL` | Same as above |
| `SUPABASE_ANON_KEY` | Same as above |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `OPENAI_CHAT_MODEL` | `gpt-4o-mini` (optional) |
| `OPENAI_EMBED_MODEL` | `text-embedding-3-small` (optional) |

### 4. Deploy

```powershell
npx vercel --prod
```

Or connect your GitHub repo for automatic deploys on push.

## How it works

```
User sends message
  → POST /api/assistant/chat (with Supabase JWT)
  → OpenAI embedding
  → Supabase match_memories()
  → Trusted web search (if needed)
  → OpenAI chat completion
  → Response to UI
```

No startup commands. No `npm run services`. The function cold-starts on first message (~1–2s), then stays warm.

## Local full-stack dev

Test the same API routes locally:

```powershell
# Copy .env.example → .env.local and fill in keys
npm run dev:vercel
```

This runs Vite + API routes together (like production).

## Local sidecar mode (optional)

Without OpenAI keys, use the legacy local stack:

```powershell
npm run services   # memory + search sidecars
npm run dev        # Vite only — falls back to stub replies
```

## Verify deployment

After deploy, visit:

```
https://your-app.vercel.app/api/health
```

Should return `{ "ok": true, "assistant": true }`.
