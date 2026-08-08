# Deploying Seldom (Ollama + Vercel)

Seldom uses **Ollama** for all AI and **Vercel serverless functions** for `/api/*`.

## Quick start (local — use this first)

```powershell
# 1. Pull model (wait for manifest/download to finish)
ollama pull qwen3:8b

# 2. One-time Vercel link
npx vercel link

# 3. Environment
copy .env.example .env.local
# Fill Supabase + OLLAMA_MODEL=qwen3:8b (match `ollama list` exactly)

# 4. Verify everything
npm run deploy:check

# 5. Run full stack (frontend + API)
npm run dev:vercel
```

Open **http://localhost:3000** — not `:5173`.

Full step-by-step: **`docs/STARTUP.md`** (local Ollama → public tunnel).

Email confirmation fix: **`docs/SUPABASE-AUTH.md`**.

Free public Ollama URLs: **`docs/FREE-OLLAMA-URL.md`**.

| Check | URL |
|-------|-----|
| Health | http://localhost:3000/api/health |
| Ollama status | http://localhost:3000/api/ollama/status |
| AI settings UI | http://localhost:3000/settings/ai |

`assistant: true` in `/api/health` means AI is ready.

## Required environment variables

| Variable | Local | Production (Vercel) |
|----------|-------|---------------------|
| `VITE_SUPABASE_URL` | ✓ | ✓ |
| `VITE_SUPABASE_ANON_KEY` | ✓ | ✓ |
| `SUPABASE_URL` | same | same |
| `SUPABASE_ANON_KEY` | same | same |
| `OLLAMA_MODEL` | e.g. `qwen3:8b` | exact name from `ollama list` |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | **Public URL** reachable by Vercel |
| `OLLAMA_EMBED_MODEL` | optional | optional |
| `OLLAMA_API_KEY` | optional | if Ollama is behind auth |
| `ALLOWED_ORIGINS` | optional | your production domain(s) |

Copy keys from `vercel.env.example` into the Vercel dashboard, or run:

```powershell
npx vercel env pull .env.local
```

## Production deploy

**Important:** Vercel runs in the cloud. `http://localhost:11434` only works with `vercel dev` on your PC. For production you need Ollama reachable over the network:

- **Option A — Tunnel (easiest for personal use):** Cloudflare Tunnel / ngrok / Tailscale Funnel → expose local Ollama → set `OLLAMA_BASE_URL` to the tunnel URL in Vercel env.
- **Option B — VPS:** Run Ollama on a server with a public or VPN URL.

```powershell
npm run deploy:check    # local pre-flight
npm run build           # must pass
npm run deploy:prod     # vercel --prod

Production URL: **https://seldom-nine.vercel.app**

If `vercel` fails with TLS/certificate errors on Windows, run:

```powershell
$env:NODE_OPTIONS='--use-system-ca'
npm run deploy:prod
```

## Free Ollama URL for other users

See **`docs/FREE-OLLAMA-URL.md`** — Cloudflare tunnel, Tailscale Funnel, ngrok, and Oracle free VM options.
```

After deploy:

```
https://YOUR-APP.vercel.app/api/health
https://YOUR-APP.vercel.app/api/ollama/status
```

## Database

Push Supabase migrations before first use:

```powershell
npm run supabase:push
```

Optional dev SQL: `supabase/apply-athlete-development.sql`

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Blank page on `:3000` | Hard refresh; ensure `vercel dev` not plain `vite` |
| API 503 | Ollama not running or model name mismatch |
| AI Offline badge | Settings → AI status → Retry; check `OLLAMA_MODEL` |
| Production AI fails | `OLLAMA_BASE_URL` must not be localhost |
| CORS errors | Set `ALLOWED_ORIGINS` to your app URL |

## npm scripts

| Script | Purpose |
|--------|---------|
| `npm run dev:vercel` | Local app + API (recommended) |
| `npm run deploy:check` | Verify env + Ollama + optional API |
| `npm run deploy:prod` | Production deploy to Vercel |
