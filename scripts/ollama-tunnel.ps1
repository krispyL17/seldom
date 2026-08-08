# Starts a Cloudflare quick tunnel to local Ollama (port 11434).
# Usage from project root:
#   npm run tunnel:ollama
# Or in PowerShell:
#   .\scripts\ollama-tunnel.ps1

$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$cloudflared = Join-Path $projectRoot 'tools\cloudflared.exe'

if (-not (Test-Path $cloudflared)) {
  Write-Host 'cloudflared not found. Downloading to tools\cloudflared.exe ...' -ForegroundColor Yellow
  New-Item -ItemType Directory -Force -Path (Split-Path $cloudflared) | Out-Null
  $url = 'https://github.com/cloudflare/cloudflared/releases/download/2026.7.3/cloudflared-windows-amd64.exe'
  Invoke-WebRequest -Uri $url -OutFile $cloudflared -UseBasicParsing
}

# Make cloudflared available as a command in this PowerShell session.
$toolsDir = Split-Path $cloudflared
if ($env:PATH -notlike "*$toolsDir*") {
  $env:PATH = "$toolsDir;$env:PATH"
}

Write-Host ''
Write-Host 'Starting Cloudflare quick tunnel to http://localhost:11434' -ForegroundColor Cyan
Write-Host 'Copy the https://....trycloudflare.com URL into Vercel as OLLAMA_BASE_URL.' -ForegroundColor Cyan
Write-Host 'Keep this window open while production AI is in use.' -ForegroundColor Yellow
Write-Host ''

& $cloudflared tunnel --url http://localhost:11434
