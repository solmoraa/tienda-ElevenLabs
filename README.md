# DR Sport - E-commerce conversacional

Demo de una tienda React con un agente de ventas de ElevenLabs, un servidor MCP y FastAPI. El agente consulta el catálogo, valida stock y administra un carrito que se conserva en memoria mientras el backend está encendido.

## Versión

`1.1.0` - incorpora eliminación de productos del carrito y cambio de color o talle de una variante ya agregada.

## Requisitos

- Git.
- Node.js `20.19+` o `22.12+` (incluye Corepack).
- Python `3.11+`.
- ngrok con cuenta y authtoken configurado.
- Acceso al workspace de ElevenLabs para actualizar la URL MCP de la demo.

No se agrega ninguna API Key de ElevenLabs al frontend ni al repositorio. React usa el Agent ID público para iniciar la conversación.

## Instalación inicial

En PowerShell, dentro de la carpeta donde quieras guardar el proyecto:

```powershell
git clone https://github.com/solmoraa/tienda-ElevenLabs.git
cd tienda-ElevenLabs
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\scripts\setup.ps1
```

Este paso instala las dependencias del frontend y crea `backend\.venv` con las dependencias de FastAPI, Uvicorn y MCP.

## Levantar la demo con voz

Abrí cuatro terminales PowerShell en la raíz del repositorio y mantenelas abiertas.

### 1. Backend FastAPI

```powershell
.\scripts\start-backend.ps1
```

### 2. Túnel público ngrok

```powershell
.\scripts\start-ngrok.ps1
```

Copiá el host que muestra ngrok. Por ejemplo, si aparece:

```text
Forwarding https://ejemplo.ngrok-free.dev -> http://localhost:8001
```

el host es `ejemplo.ngrok-free.dev`.

### 3. MCP Server

Usá el host real de ngrok, sin `https://` ni `/mcp`:

```powershell
.\scripts\start-mcp.ps1 -NgrokHost "ejemplo.ngrok-free.dev"
```

### 4. Frontend React

```powershell
.\scripts\start-frontend.ps1
```

Abrí `http://127.0.0.1:5173`, permití el micrófono y tocá **Hablar con el asistente**.

## Configurar ElevenLabs

En la integración MCP del agente **Asistente de ventas**, configurá:

```text
https://ejemplo.ngrok-free.dev/mcp
```

Elegí HTTP reproducible o Streamable HTTP, probá la conexión y aprobá estas herramientas:

- `buscar_productos`
- `obtener_detalle_producto`
- `consultar_stock`
- `agregar_al_carrito`
- `eliminar_del_carrito`
- `actualizar_variante_carrito`
- `obtener_carrito`
- `preparar_checkout`

En el plan gratuito de ngrok el dominio puede cambiar. Cuando ocurra, repetí los pasos de ngrok y MCP, y reemplazá la URL MCP en ElevenLabs por la nueva URL.

## Verificación rápida

Probá decir:

1. “Busco zapatillas de handball.”
2. “Agregame las negras talle 40.”
3. “Mostrame el carrito.”
4. “Me agregaste mal el talle, cambialo al 41.”
5. “Sacame esa variante del carrito.”

También se puede eliminar una línea con el botón **Eliminar** del carrito.

## Más detalle y solución de problemas

La guía extendida incluye el motivo de cada paso, problemas frecuentes y recomendaciones para presentar la demo: [docs/GUIA_DEMO.md](docs/GUIA_DEMO.md).

> El carrito es intencionalmente en memoria: se vacía cuando se detiene el backend. Para una URL fija en presentaciones futuras, desplegá backend y MCP con HTTPS estable o reservá un dominio de ngrok.
