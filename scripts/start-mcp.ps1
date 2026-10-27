param(
  [Parameter(Mandatory)]
  [string]$NgrokHost
)

$ErrorActionPreference = "Stop"

if ($NgrokHost -match "^https?://" -or $NgrokHost -match "/") {
  throw "Usá solo el host de ngrok, por ejemplo: ejemplo.ngrok-free.dev"
}

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendPath = Join-Path $repoRoot "backend"
$pythonPath = Join-Path $backendPath ".venv\Scripts\python.exe"

if (-not (Test-Path -LiteralPath $pythonPath)) {
  throw "No existe backend\.venv. Ejecutá primero .\scripts\setup.ps1"
}

$env:MCP_ALLOWED_HOST = $NgrokHost
Set-Location $backendPath
& $pythonPath mcp_server.py
