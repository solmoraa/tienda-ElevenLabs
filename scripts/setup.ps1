$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendPath = Join-Path $repoRoot "frontend"
$backendPath = Join-Path $repoRoot "backend"
$pythonPath = Join-Path $backendPath ".venv\Scripts\python.exe"

if (-not (Get-Command py -ErrorAction SilentlyContinue)) {
  throw "No se encontró Python. Instalá Python 3.11 o superior y volvé a ejecutar este script."
}

$corepack = Get-Command corepack.cmd -ErrorAction SilentlyContinue
if (-not $corepack) {
  throw "No se encontró Corepack. Instalá Node.js 20.19+ o 22.12+ y abrí una terminal nueva."
}

Write-Host "Instalando dependencias del frontend..." -ForegroundColor Cyan
& $corepack.Source pnpm --dir $frontendPath install

if (-not (Test-Path -LiteralPath $pythonPath)) {
  Write-Host "Creando entorno virtual de Python..." -ForegroundColor Cyan
  Push-Location $backendPath
  try {
    py -3 -m venv .venv
  } finally {
    Pop-Location
  }
}

Write-Host "Instalando dependencias del backend..." -ForegroundColor Cyan
& $pythonPath -m pip install -r (Join-Path $backendPath "requirements.txt")

Write-Host "Listo. Consultá el README para levantar backend, ngrok, MCP y frontend." -ForegroundColor Green
