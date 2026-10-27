$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$setupScript = Join-Path $PSScriptRoot "setup.ps1"
$backendScript = Join-Path $PSScriptRoot "start-backend.ps1"
$ngrokScript = Join-Path $PSScriptRoot "start-ngrok.ps1"
$mcpScript = Join-Path $PSScriptRoot "start-mcp.ps1"
$frontendScript = Join-Path $PSScriptRoot "start-frontend.ps1"

& $setupScript

function Start-DemoTerminal {
  param([string[]]$Arguments)
  Start-Process powershell.exe -ArgumentList $Arguments | Out-Null
}

Start-DemoTerminal @("-NoExit", "-ExecutionPolicy", "Bypass", "-File", $backendScript)
Start-DemoTerminal @("-NoExit", "-ExecutionPolicy", "Bypass", "-File", $ngrokScript)

$ngrokUrl = $null
for ($attempt = 1; $attempt -le 30; $attempt += 1) {
  try {
    $tunnels = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 2
    $ngrokUrl = ($tunnels.tunnels | Where-Object { $_.public_url -like "https://*" } | Select-Object -First 1).public_url
    if ($ngrokUrl) { break }
  } catch {
    Start-Sleep -Seconds 1
  }
}

if (-not $ngrokUrl) {
  throw "No se pudo obtener el túnel de ngrok. Revisá la ventana de ngrok y ejecutá start-mcp.ps1 manualmente con el host público."
}

$ngrokHost = ([Uri]$ngrokUrl).Host
Start-DemoTerminal @("-NoExit", "-ExecutionPolicy", "Bypass", "-File", $mcpScript, "-NgrokHost", $ngrokHost)
Start-DemoTerminal @("-NoExit", "-ExecutionPolicy", "Bypass", "-File", $frontendScript)

Write-Host ""
Write-Host "Demo iniciada." -ForegroundColor Green
Write-Host "Abrí: http://localhost:5173"
Write-Host "URL MCP actual: $ngrokUrl/mcp" -ForegroundColor Yellow
Write-Host ""
Write-Host "Si esta URL no coincide con la configurada en ElevenLabs, el agente podrá hablar pero no podrá ejecutar herramientas MCP." -ForegroundColor Yellow
Write-Host "Para evitar ese paso en cada demo, usá una URL HTTPS estable (dominio reservado de ngrok o despliegue del backend/MCP)."
