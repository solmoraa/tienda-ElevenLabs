param(
  [switch]$SkipNgrokTokenPrompt
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$frontendPath = Join-Path $repoRoot "frontend"
$backendPath = Join-Path $repoRoot "backend"
$pythonPath = Join-Path $backendPath ".venv\Scripts\python.exe"

function Refresh-SessionPath {
  $machinePath = [Environment]::GetEnvironmentVariable("Path", "Machine")
  $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
  $env:Path = "$machinePath;$userPath"
}

function Install-WithWinget {
  param([string]$PackageId, [string]$DisplayName)

  $winget = Get-Command winget.exe -ErrorAction SilentlyContinue
  if (-not $winget) {
    throw "Falta $DisplayName y no se encontró winget para instalarlo automáticamente. Instalá App Installer desde Microsoft Store y ejecutá este script de nuevo."
  }

  Write-Host "Instalando $DisplayName..." -ForegroundColor Cyan
  & $winget.Source install --id $PackageId --exact --silent --accept-package-agreements --accept-source-agreements
  if ($LASTEXITCODE -ne 0) {
    throw "No se pudo instalar $DisplayName con winget."
  }
  Refresh-SessionPath
}

function Ensure-Command {
  param([string]$Command, [string]$PackageId, [string]$DisplayName)

  if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
    Install-WithWinget -PackageId $PackageId -DisplayName $DisplayName
  }

  if (-not (Get-Command $Command -ErrorAction SilentlyContinue)) {
    throw "$DisplayName se instaló pero esta terminal todavía no lo encuentra. Cerrá PowerShell, abrilo de nuevo y ejecutá .\scripts\start-demo.ps1."
  }
}

Ensure-Command -Command "node.exe" -PackageId "OpenJS.NodeJS.LTS" -DisplayName "Node.js LTS"
Ensure-Command -Command "py.exe" -PackageId "Python.Python.3.12" -DisplayName "Python 3.12"
Ensure-Command -Command "ngrok.exe" -PackageId "Ngrok.Ngrok" -DisplayName "ngrok"

$corepack = Get-Command corepack.cmd -ErrorAction SilentlyContinue
if (-not $corepack) {
  throw "Node.js está instalado, pero no se encontró Corepack. Instalá una versión LTS de Node.js 20.19+ o 22.12+ y repetí el comando."
}

$tokenFromEnvironment = $env:NGROK_AUTHTOKEN
$ngrokConfigPaths = @(
  (Join-Path $env:LOCALAPPDATA "ngrok\ngrok.yml"),
  (Join-Path $env:USERPROFILE ".config\ngrok\ngrok.yml"),
  (Join-Path $env:USERPROFILE ".ngrok2\ngrok.yml")
)
$hasNgrokToken = $ngrokConfigPaths | Where-Object {
  (Test-Path -LiteralPath $_) -and (Select-String -LiteralPath $_ -Pattern "^authtoken:" -Quiet)
} | Select-Object -First 1

if ($tokenFromEnvironment) {
  Write-Host "Configurando el authtoken de ngrok proporcionado por la variable NGROK_AUTHTOKEN..." -ForegroundColor Cyan
  & (Get-Command ngrok.exe).Source config add-authtoken $tokenFromEnvironment
} elseif (-not $hasNgrokToken -and -not $SkipNgrokTokenPrompt) {
  Write-Host ""
  Write-Host "ngrok necesita una cuenta gratuita y un authtoken para crear el túnel público que usa ElevenLabs." -ForegroundColor Yellow
  $ngrokToken = Read-Host "Pegá tu authtoken de ngrok o presioná Enter para configurarlo después"
  if ($ngrokToken) {
    & (Get-Command ngrok.exe).Source config add-authtoken $ngrokToken
  }
}

Write-Host "Verificando dependencias del frontend..." -ForegroundColor Cyan
& $corepack.Source pnpm --dir $frontendPath install
if ($LASTEXITCODE -ne 0) {
  throw "No se pudieron instalar las dependencias del frontend."
}

if (-not (Test-Path -LiteralPath $pythonPath)) {
  Write-Host "Creando el entorno virtual de Python..." -ForegroundColor Cyan
  Push-Location $backendPath
  try {
    & (Get-Command py.exe).Source -3 -m venv .venv
  } finally {
    Pop-Location
  }
}

Write-Host "Verificando dependencias del backend..." -ForegroundColor Cyan
& $pythonPath -m pip install -r (Join-Path $backendPath "requirements.txt")
if ($LASTEXITCODE -ne 0) {
  throw "No se pudieron instalar las dependencias del backend."
}

Write-Host ""
Write-Host "Preparación completa. Ejecutá .\scripts\start-demo.ps1 para iniciar la demo." -ForegroundColor Green
