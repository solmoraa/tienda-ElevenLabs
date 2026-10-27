$ErrorActionPreference = "Stop"

if (-not (Get-Command ngrok -ErrorAction SilentlyContinue)) {
  throw "No se encontró ngrok. Ejecutá .\scripts\setup.ps1 para instalarlo y configurarlo."
}

if ($env:NGROK_DOMAIN) {
  ngrok http --domain $env:NGROK_DOMAIN 8001
} else {
  ngrok http 8001
}
