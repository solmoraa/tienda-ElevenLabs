if (-not (Get-Command ngrok -ErrorAction SilentlyContinue)) {
  throw "No se encontró ngrok. Instalalo, configurá su authtoken y abrí una terminal nueva."
}

ngrok http 8001
