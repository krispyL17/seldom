# Start Seldom with AI — local then public

## Part A — Local (you only)

### Terminal 1 — Ollama

Ollama usually runs in the background after install. Verify:

```powershell
ollama list
ollama pull qwen3:8b
curl http://localhost:11434/api/tags
```

If that fails, open the **Ollama** app from the Start menu.

### Terminal 2 — App

```powershell
cd C:\Users\krist\Projects\seldom
copy .env.example .env.local
# Fill Supabase keys; keep:
#   OLLAMA_BASE_URL=http://localhost:11434
#   OLLAMA_MODEL=qwen3:8b
#   VITE_APP_URL=http://localhost:3000

npm run deploy:check
npm run dev:vercel
```

Open **http://localhost:3000** → Settings → AI → status should be online.

---

## Part B — Public (other people on Vercel)

Your deployed site cannot use `localhost`. You expose Ollama with a tunnel **you** run.

### 1. Keep Ollama running (Terminal 1)

Same as above.

### 2. Start tunnel (Terminal 2 — leave open)

```powershell
cd C:\Users\krist\Projects\seldom
npm run tunnel:ollama
```

Copy the **new** `https://….trycloudflare.com` URL every time you start this.

### 3. Vercel env (one-time per URL change)

Dashboard → seldom → Settings → Environment Variables:

| Variable | Value |
|----------|--------|
| `OLLAMA_BASE_URL` | `https://YOUR-NEW-URL.trycloudflare.com` |
| `OLLAMA_MODEL` | `qwen3:8b` |
| `VITE_APP_URL` | `https://seldom-nine.vercel.app` |

**Redeploy** after changes.

### 4. Verify

```text
https://seldom-nine.vercel.app/api/health     → "assistant": true
https://seldom-nine.vercel.app/api/ollama/status
```

Tunnel closed = AI offline for everyone (HTTP 530).

---

## Quick commands

| Command | Purpose |
|---------|---------|
| `npm run dev:vercel` | Local app + API |
| `npm run tunnel:ollama` | Public tunnel to Ollama |
| `npm run deploy:check` | Verify env + Ollama |
| `npm run deploy:prod` | Deploy to Vercel |

Stable URL options: see `docs/FREE-OLLAMA-URL.md`.
