# DR Sport — E-commerce conversacional

Demo de una tienda React con un agente de ventas de ElevenLabs y un servidor MCP local. El agente puede buscar productos, consultar stock y administrar un carrito en memoria.

## Versión

`1.1.0` — incorpora la eliminación de productos del carrito y el cambio de color o talle de una variante ya agregada.

## Estructura

```text
backend/                  API FastAPI y servidor MCP
frontend/                 Aplicación React/Vite
  src/models/             Datos y entidades del dominio
  src/views/              Pantallas y presentación visual
  src/controllers/        Estado, eventos y Client Tools
  src/services/           Comunicación con la API
  src/components/         Componentes visuales reutilizables
```

> Ejecutá los comandos de React desde `frontend/` y los de FastAPI/MCP desde `backend/`.

## Qué se necesita

- Node.js (incluye Corepack).
- Python 3.11 o superior.
- Una cuenta y el ejecutable de [ngrok](https://ngrok.com/).
- El agente de ElevenLabs configurado con el servidor MCP público de ngrok.

> El carrito se guarda solamente en memoria: al detener el backend se vacía.

## Primera instalación

Abrí PowerShell en la carpeta del frontend:

```powershell
cd C:\Users\HP\Downloads\Ecommerce-ElevenLabs\tienda-ElevenLabs\frontend
```

Instalá el frontend:

```powershell
& "C:\Program Files\nodejs\corepack.cmd" pnpm install
```

Creá e instalá el entorno Python del backend (solo la primera vez):

```powershell
cd ..\backend
py -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
cd ..
```

## Levantar todo para probar al agente

Usá cuatro terminales de PowerShell y mantenelas abiertas durante la prueba. Ejecutá los comandos en este orden.

### 1. Backend de la tienda — terminal 1

```powershell
cd C:\Users\HP\Downloads\Ecommerce-ElevenLabs\tienda-ElevenLabs\backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Debe aparecer `Uvicorn running on http://127.0.0.1:8000`.

Comprobación rápida: abrí `http://127.0.0.1:8000/docs`.

### 2. Túnel público de ngrok — terminal 2

```powershell
ngrok http 8001
```

Ngrok mostrará una línea similar a esta:

```text
Forwarding https://item-hastily-release.ngrok-free.dev -> http://localhost:8001
```

En ElevenLabs, el servidor MCP debe usar esta URL agregando `/mcp` al final:

```text
https://item-hastily-release.ngrok-free.dev/mcp
```

Si ngrok muestra otro subdominio, detené el MCP con `Ctrl+C`, reemplazá el valor de `MCP_ALLOWED_HOST` por el nuevo host y volvé a iniciarlo. Después actualizá la URL del servidor MCP en ElevenLabs.

### 3. Servidor MCP — terminal 3

El MCP usa el backend anterior internamente y se publica en el puerto `8001`.

```powershell
cd C:\Users\HP\Downloads\Ecommerce-ElevenLabs\tienda-ElevenLabs\backend
$env:MCP_ALLOWED_HOST = "item-hastily-release.ngrok-free.dev"
.\.venv\Scripts\python.exe mcp_server.py
```

Reemplazá `item-hastily-release.ngrok-free.dev` por el host que mostró ngrok, si fuera distinto. No cierres esta terminal.

### 4. Frontend React — terminal 4

```powershell
cd C:\Users\HP\Downloads\Ecommerce-ElevenLabs\tienda-ElevenLabs\frontend
& "C:\Program Files\nodejs\corepack.cmd" pnpm dev
```

Abrí la URL que indique Vite, normalmente:

```text
http://localhost:5173
```

Aceptá el permiso de micrófono y probá una conversación nueva:

1. “Busco zapatillas negras para correr sobre cemento.”
2. “Agregá la primera al carrito.”
3. “Mostrame el carrito.”

## Configuración necesaria en ElevenLabs

El agente de ventas debe tener asociado el servidor MCP de ngrok y las herramientas aprobadas:

- `buscar_productos`
- `obtener_detalle_producto`
- `consultar_stock`
- `agregar_al_carrito`
- `eliminar_del_carrito`
- `actualizar_variante_carrito`
- `obtener_carrito`
- `preparar_checkout`

Si el servidor tiene la política **Require approval per tool**, aprobá esas herramientas en ElevenLabs antes de probar. Si no están aprobadas, el agente no podrá ejecutarlas.

## Si algo falla

| Síntoma | Qué revisar |
| --- | --- |
| El frontend no abre | Verificá que `pnpm dev` siga corriendo y usá la URL exacta que muestra Vite. |
| `npm` o `pnpm` no se reconoce | Abrí una terminal nueva luego de instalar Node.js y ejecutá los comandos con `corepack.cmd` como se muestra arriba. |
| ElevenLabs no conecta al MCP | Confirmá que el backend, el MCP y ngrok estén abiertos; verificá la URL pública terminada en `/mcp`. |
| Error de host de MCP | El valor de `MCP_ALLOWED_HOST` debe ser exactamente el host de ngrok, sin `https://` ni `/mcp`. |
| El agente no puede agregar al carrito | Aprobá las herramientas MCP en ElevenLabs y verificá que `consultar_stock` y `agregar_al_carrito` estén disponibles. |
| El agente no puede quitar un producto o cambiar talle/color | Reiniciá el MCP, actualizá la integración MCP en ElevenLabs y aprobá `eliminar_del_carrito` y `actualizar_variante_carrito`. |
| El carrito aparece vacío después de reiniciar | Es normal: la persistencia actual es en memoria. |

## Detener los servicios

En cada terminal, presioná `Ctrl+C`. Al detener el backend se pierde el carrito de demostración actual.
