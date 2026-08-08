# Free ways to expose Ollama for deployed Seldom

When Seldom runs on Vercel, AI requests go to `OLLAMA_BASE_URL`. That URL must be reachable from the internet — not `localhost`.

Use this guide to pick a **free** option for sharing the app with other people.

## Quick comparison

| Option | Cost | Stable URL | Always on | Best for |
|--------|------|------------|-----------|----------|
| **Cloudflare quick tunnel** (`npm run tunnel:ollama`) | Free | No — changes each restart | Only while your PC + tunnel run | Testing |
| **Cloudflare named tunnel** + free domain | Free | Yes | Only while tunnel runs | Small group, you host AI |
| **Tailscale Funnel** | Free tier | Yes | While your PC runs | Friends who use Tailscale |
| **ngrok free** | Free | No on free tier | While tunnel runs | Quick demos |
| **Oracle Cloud free VM** | Free tier | Yes | 24/7 if VM stays up | Best free “always on” for others |

---

## Option 1 — Cloudflare quick tunnel (already in Seldom)

```powershell
cd C:\Users\krist\Projects\seldom
npm run tunnel:ollama
```

Copy the `https://….trycloudflare.com` URL → Vercel env `OLLAMA_BASE_URL`.

**Pros:** Zero setup, already wired in the repo.  
**Cons:** URL changes every restart; your PC must stay on; not suitable as a permanent link for many users.

---

## Option 2 — Cloudflare named tunnel (free, stable URL)

Best free path if you have **any domain on Cloudflare** (including cheap ~$10/yr domains).

### One-time setup

```powershell
# Install (or use seldom\tools\cloudflared.exe)
cloudflared tunnel login
cloudflared tunnel create seldom-ollama
```

Create `%USERPROFILE%\.cloudflared\config.yml`:

```yaml
tunnel: seldom-ollama
credentials-file: C:\Users\krist\.cloudflared\YOUR-TUNNEL-ID.json

ingress:
  - hostname: ollama.yourdomain.com
    service: http://localhost:11434
  - service: http_status:404
```

```powershell
cloudflared tunnel route dns seldom-ollama ollama.yourdomain.com
cloudflared tunnel run seldom-ollama
```

Vercel:

```env
OLLAMA_BASE_URL=https://ollama.yourdomain.com
OLLAMA_MODEL=qwen3:8b
ALLOWED_ORIGINS=https://your-seldom-app.vercel.app
```

**Pros:** Same URL every time; free on Cloudflare.  
**Cons:** Your PC (or a server) must run the tunnel; open Ollama endpoint — add Cloudflare Access if you expose it publicly.

---

## Option 3 — Tailscale Funnel (free)

Good if you and your users already use [Tailscale](https://tailscale.com/).

1. Install Tailscale on your PC.
2. Enable Funnel for port 11434 (see Tailscale docs: “Funnel”).
3. You get a stable `https://….ts.net` URL.
4. Set that as `OLLAMA_BASE_URL` in Vercel.

**Pros:** Free, HTTPS, stable subdomain.  
**Cons:** Still your PC; Funnel exposes a service to the public internet — lock down who can use Seldom via Supabase auth only (AI endpoint itself is still shared).

---

## Option 4 — ngrok (free tier)

```powershell
ngrok http 11434
```

**Pros:** Fast to try.  
**Cons:** Free URLs change; session limits; not ideal for “other people” long term.

---

## Option 5 — Oracle Cloud Always Free VM (best for “other people” 24/7)

Oracle’s free tier includes ARM VMs that can run Ollama 24/7 without your PC.

Rough steps:

1. Create Oracle Cloud account → Always Free Ampere VM (Ubuntu).
2. SSH in, install Ollama: https://ollama.com/download/linux
3. `ollama pull qwen3:8b`
4. Open port 11434 **only to your Vercel IPs** or put Caddy/nginx + basic auth in front (recommended).
5. Set `OLLAMA_BASE_URL=http://YOUR_VM_IP:11434` or `https://ollama.yourdomain.com`.

**Pros:** Actually always on; free tier can handle a few friends.  
**Cons:** Setup effort; you manage the server; need to secure Ollama (don’t leave raw Ollama public).

---

## What to set in Vercel for shared usage

Minimum for production + other users:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
OLLAMA_BASE_URL=https://your-public-ollama-url
OLLAMA_MODEL=qwen3:8b
ALLOWED_ORIGINS=https://your-app.vercel.app
```

After changing env vars: **redeploy** (Vercel dashboard → Redeploy, or `npm run deploy:prod`).

Verify:

```text
https://your-app.vercel.app/api/health        → assistant: true
https://your-app.vercel.app/api/ollama/status → online
```

---

## How “other people” use Seldom

1. You deploy the app to Vercel → share `https://your-app.vercel.app`.
2. They **sign up / sign in** (Supabase) → each gets their own data.
3. All their AI requests hit **your** `OLLAMA_BASE_URL` — you are hosting the model for everyone.
4. For data migration: **Settings → Data → Export/Import**.

---

## Recommended path

| Stage | Do this |
|-------|---------|
| **Now** | Deploy to Vercel; use quick tunnel to test AI on production |
| **This week** | Named Cloudflare tunnel **or** Oracle free VM for a stable URL |
| **Before sharing widely** | Secure Ollama (auth / firewall); set `ALLOWED_ORIGINS` |

See also: `DEPLOY.md`, `npm run tunnel:ollama`, `vercel.env.example`.
