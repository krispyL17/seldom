# Oracle Cloud + Ollama + Cloudflare — full setup for Seldom

Run **Qwen 2.5 3B** on a free always-on VM so Vercel users get AI **without installing Ollama** and **without your home PC staying on**.

**Time:** ~45–90 minutes first time (Oracle signup + VM + tunnel).

**Result:** Stable `https://ollama.yourdomain.com` → set as `OLLAMA_BASE_URL` on Vercel.

---

## What you are building

```text
User browser → Seldom (Vercel) → /api/assistant/chat → OLLAMA_BASE_URL
                                                          ↓
                                            Cloudflare Tunnel (HTTPS)
                                                          ↓
                                            Oracle VM → Ollama :11434
                                                          ↓
                                            qwen2.5:3b (~1.9 GB)
```

Each signed-in user gets their **own data** (Supabase). All AI requests share **one** Ollama server you host.

---

## Prerequisites

| Item | Notes |
|------|--------|
| **Oracle Cloud account** | Free tier — credit card for verification, Always Free resources don’t expire |
| **Domain on Cloudflare** | ~$10/yr anywhere; point DNS to Cloudflare — **recommended** for stable HTTPS URL |
| **Seldom on Vercel** | Already deployed; see `DEPLOY.md` |
| **Supabase** | Auth + DB configured |

**Oracle free limits (2026):** Ampere A1 — about **2 OCPUs + 12 GB RAM** total. `qwen2.5:3b` fits comfortably (~2 GB model + headroom).

---

## Part 1 — Create the Oracle VM

### 1.1 Sign up and pick region

1. Go to [https://www.oracle.com/cloud/free/](https://www.oracle.com/cloud/free/) and create a tenancy.
2. Note your **home region** (e.g. `us-ashburn-1`). Create the VM **only** in that region for Always Free.

If you see **Out of host capacity**, try another **availability domain** in the same region, or a different home region when signing up.

### 1.2 Create a compute instance

1. Oracle Console → **Compute** → **Instances** → **Create instance**.
2. **Name:** `seldom-ollama`
3. **Image:** Ubuntu 24.04 **Minimal** (aarch64 / ARM64).
4. **Shape:** Click **Change shape** → **Ampere** → **VM.Standard.A1.Flex**
   - **OCPUs:** 2 (or 1 if you want headroom for a second tiny VM later)
   - **Memory (GB):** 12 (or 6 if using 1 OCPU — still enough for 3B)
5. **Networking:** Use default VCN; assign a **public IPv4**.
6. **SSH keys:** Generate or upload your public key — you need this to log in.
7. **Create**.

Wait until state is **Running**. Copy the **public IP**.

### 1.3 SSH in

From PowerShell (replace key path and IP):

```powershell
ssh -i C:\Users\krist\.ssh\oracle_key ubuntu@YOUR_VM_PUBLIC_IP
```

First login on Ubuntu cloud images is usually user `ubuntu`.

### 1.4 Basic server prep

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl ca-certificates ufw

# Optional: allow SSH only from your IP (replace YOUR_IP)
# sudo ufw allow from YOUR_IP to any port 22
sudo ufw allow OpenSSH
sudo ufw enable
```

**Do not** open port `11434` to the public internet. Cloudflare Tunnel connects locally on the VM.

---

## Part 2 — Install Ollama

### 2.1 Install (ARM64 Ubuntu)

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

Verify:

```bash
ollama --version
```

### 2.2 Keep Ollama on localhost only

Edit the systemd override so Ollama is **not** exposed on `0.0.0.0`:

```bash
sudo mkdir -p /etc/systemd/system/ollama.service.d
sudo tee /etc/systemd/system/ollama.service.d/override.conf << 'EOF'
[Service]
Environment="OLLAMA_HOST=127.0.0.1:11434"
EOF

sudo systemctl daemon-reload
sudo systemctl enable ollama
sudo systemctl restart ollama
sudo systemctl status ollama
```

Test locally on the VM:

```bash
curl http://127.0.0.1:11434/api/tags
```

You should get JSON (`{"models":[]}` before pulling).

---

## Part 3 — Install `qwen2.5:3b`

### 3.1 Pull the model

```bash
ollama pull qwen2.5:3b
```

Download is ~**1.9 GB**. On a free VM this can take several minutes.

### 3.2 Verify name (important for Seldom)

Seldom uses **`OLLAMA_MODEL` exactly as `ollama list` shows it**:

```bash
ollama list
```

Expected line:

```text
qwen2.5:3b    ...    ~1.9 GB
```

Quick test:

```bash
ollama run qwen2.5:3b "Say hello in one sentence."
```

Exit with `/bye` or Ctrl+D.

API test:

```bash
curl http://127.0.0.1:11434/api/chat -d '{
  "model": "qwen2.5:3b",
  "messages": [{"role": "user", "content": "Hi"}],
  "stream": false
}'
```

### 3.3 Optional: embeddings model

If you use semantic memory and want a dedicated embed model:

```bash
ollama pull nomic-embed-text
```

Set on Vercel: `OLLAMA_EMBED_MODEL=nomic-embed-text`. Otherwise Seldom defaults embed model to the chat model.

---

## Part 4 — Cloudflare Tunnel (stable HTTPS URL)

You need a domain on Cloudflare (e.g. `yourdomain.com`). Subdomain example: `ollama.yourdomain.com`.

### 4.1 Install cloudflared on the VM

```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64 \
  -o cloudflared
chmod +x cloudflared
sudo mv cloudflared /usr/local/bin/cloudflared
cloudflared --version
```

### 4.2 Authenticate and create tunnel

Run on the VM (opens a browser URL — paste the URL on your PC if SSH has no browser):

```bash
cloudflared tunnel login
cloudflared tunnel create seldom-ollama
```

Note the **tunnel UUID** and credentials path (e.g. `/home/ubuntu/.cloudflared/<UUID>.json`).

### 4.3 Config file

```bash
nano ~/.cloudflared/config.yml
```

```yaml
tunnel: seldom-ollama
credentials-file: /home/ubuntu/.cloudflared/YOUR-TUNNEL-UUID.json

ingress:
  - hostname: ollama.yourdomain.com
    service: http://127.0.0.1:11434
  - service: http_status:404
```

Replace `YOUR-TUNNEL-UUID` and `ollama.yourdomain.com`.

### 4.4 DNS route

```bash
cloudflared tunnel route dns seldom-ollama ollama.yourdomain.com
```

### 4.5 Run tunnel as a service

```bash
sudo cloudflared --config /home/ubuntu/.cloudflared/config.yml service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
sudo systemctl status cloudflared
```

From your PC, test (no auth yet):

```bash
curl https://ollama.yourdomain.com/api/tags
```

You should see your models including `qwen2.5:3b`.

### 4.6 Lock down the public Ollama URL (strongly recommended)

Raw public Ollama lets anyone burn your CPU. Pick **one**:

**A — Cloudflare Access (free for small teams)**  
Zero Trust → Access → application for `ollama.yourdomain.com` → service token → set headers on Vercel if you add support, or use Cloudflare to restrict by IP.

**B — API key via reverse proxy (matches Seldom `OLLAMA_API_KEY`)**  
Add Caddy/nginx on the VM in front of Ollama with Bearer auth, or use Cloudflare Workers. Seldom already sends `Authorization: Bearer` when `OLLAMA_API_KEY` is set.

**Minimum for friends-only:** Rely on Seldom Supabase login + obscure URL is **not** enough — still add Access or API key.

---

## Part 5 — Configure Vercel (Seldom production)

Vercel Dashboard → your project → **Settings** → **Environment Variables** → **Production** (and Preview if you want):

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_APP_URL=https://seldom-nine.vercel.app
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
OLLAMA_BASE_URL=https://ollama.yourdomain.com
OLLAMA_MODEL=qwen2.5:3b
ALLOWED_ORIGINS=https://seldom-nine.vercel.app
```

Optional:

```env
OLLAMA_EMBED_MODEL=nomic-embed-text
OLLAMA_API_KEY=sk-your-long-random-secret
```

**Rules:**

- `OLLAMA_MODEL` must match `ollama list` **exactly** → `qwen2.5:3b`
- No trailing slash on `OLLAMA_BASE_URL`
- After changes: **Redeploy** (`npm run deploy:prod` or Vercel → Deployments → Redeploy)

---

## Part 6 — Verify Seldom

```text
https://YOUR-APP.vercel.app/api/health
→ assistant: true

https://YOUR-APP.vercel.app/api/ollama/status
→ online: true, model: "qwen2.5:3b", baseUrl: your tunnel URL

https://YOUR-APP.vercel.app/settings/ai
→ Status Online
```

In the app: open **Assistant** and send a message.

---

## Part 7 — Maintenance

### After VM reboot

Both services should auto-start:

```bash
sudo systemctl status ollama
sudo systemctl status cloudflared
```

### Update Ollama

```bash
curl -fsSL https://ollama.com/install.sh | sh
sudo systemctl restart ollama
```

### Update the model

```bash
ollama pull qwen2.5:3b
```

### Logs

```bash
sudo journalctl -u ollama -f
sudo journalctl -u cloudflared -f
```

### Monitor RAM

```bash
free -h
```

If RAM is tight, remove unused models:

```bash
ollama list
ollama rm some-other-model
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Oracle **Out of capacity** | Different AD/region; try off-peak; retry next day |
| `ollama pull` OOM | Use `qwen2.5:1.5b` or `qwen2.5:0.5b`; ensure 12 GB shape |
| Vercel **503 Ollama unavailable** | Tunnel running? `curl https://ollama.yourdomain.com/api/tags` from PC |
| Wrong model name | Run `ollama list` on VM; copy exact tag to `OLLAMA_MODEL` |
| Slow replies | Normal on free ARM CPU (~5–15 tok/s for 3B); one user at a time is realistic |
| Tunnel works, Seldom doesn’t | Redeploy after env change; check `ALLOWED_ORIGINS` |
| Auth errors with API key | Match `OLLAMA_API_KEY` on Vercel and your proxy |

---

## Quick reference

| Component | Value |
|-----------|--------|
| Model pull | `ollama pull qwen2.5:3b` |
| Vercel model env | `OLLAMA_MODEL=qwen2.5:3b` |
| Ollama listen | `127.0.0.1:11434` (tunnel only) |
| Public URL | `https://ollama.yourdomain.com` |
| Local dev (your PC) | `OLLAMA_BASE_URL=http://localhost:11434` in `.env.local` |

See also: `DEPLOY.md`, `docs/FREE-OLLAMA-URL.md`, `docs/STARTUP.md`, `vercel.env.example`.
