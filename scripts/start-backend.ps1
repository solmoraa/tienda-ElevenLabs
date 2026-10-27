$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $repoRoot "backend"
$pythonPath = Join-Path $backendPath ".venv\Scripts\python.exe"

if (-not (Test-Path -LiteralPath $pythonPath)) {
  throw "No existe backend\.venv. Ejecutá primero .\scripts\setup.ps1"
}

Set-Location $backendPath
& $pythonPath -m uvicorn app.main:app --host 127.0.0.1 --port 8000
