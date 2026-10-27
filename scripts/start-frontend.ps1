$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendPath = Join-Path $repoRoot "frontend"
$corepack = Get-Command corepack.cmd -ErrorAction SilentlyContinue

if (-not $corepack) {
  throw "No se encontró Corepack. Instalá Node.js 20.19+ o 22.12+ y abrí una terminal nueva."
}

& $corepack.Source pnpm --dir $frontendPath dev
