# Backend FastAPI de demostración

Este servicio es independiente de React y ElevenLabs. Expone el catálogo ficticio y carritos aislados por `session_id`. Los datos viven en memoria: al detener el servidor, los carritos se reinician.

## Arquitectura por capas

```text
app/
├── routes/         # Define rutas HTTP y valida parámetros de transporte.
├── controllers/    # Traduce resultados de negocio a respuestas HTTP.
├── services/       # ProductService y CartService: stock, carrito y totales.
├── repositories/   # ProductRepository y CartRepository en memoria.
├── models.py       # Contratos Pydantic compartidos.
└── main.py         # Crea FastAPI y registra las rutas.
```

Cuando se incorpore una base de datos, se reemplazará el repositorio en memoria; rutas, controladores y servicios podrán conservarse.

> Todos los comandos de este documento se ejecutan desde `backend/`. Para iniciar React, consultá el [README principal](../README.md) y usá `frontend/`.

## Preparación

Con Python 3.11 o superior instalado, desde `backend/`:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
```

Si PowerShell no permite activar el entorno, no hace falta activarlo:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Ejecutar

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

Abrí `http://127.0.0.1:8000/docs` para probar los endpoints desde Swagger UI.

## Endpoints

- `GET /health`
- `GET /api/v1/products?category=&max_price=&limit=`
- `GET /api/v1/products/{product_id}`
- `GET /api/v1/products/{product_id}/stock`
- `GET /api/v1/carts/{session_id}`
- `POST /api/v1/carts/{session_id}/items` con `{ "product_id": "...", "quantity": 1 }`
- `DELETE /api/v1/carts/{session_id}/items/{product_id}?quantity=1`
- `POST /api/v1/carts/{session_id}/checkout` para crear un checkout de demostración validado por el servidor.
- `GET /api/v1/checkouts/{checkout_id}` para leer esa sesión de checkout.

## Pruebas

```powershell
.\.venv\Scripts\python.exe -m pytest
```

## Servidor MCP (etapa 6)

El servidor MCP expone la API como herramientas para un agente: `buscar_productos`, `obtener_detalle_producto`, `consultar_stock`, `agregar_al_carrito`, `eliminar_del_carrito`, `actualizar_variante_carrito`, `obtener_carrito` y `preparar_checkout`. No guarda datos ni calcula precios: delega esas responsabilidades en FastAPI.

En una primera terminal iniciá FastAPI:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

En otra terminal, desde `backend/`, iniciá el MCP:

```powershell
.\.venv\Scripts\python.exe mcp_server.py
```

Si lo exponés por ngrok, agregá el dominio que ngrok te asignó (sin `https://` ni `/mcp`) para que el SDK MCP acepte el host público:

```powershell
$env:MCP_ALLOWED_HOST = "tu-dominio.ngrok-free.dev"
.\.venv\Scripts\python.exe mcp_server.py
```

El endpoint MCP será `http://127.0.0.1:8001/mcp`. Esta URL sirve para pruebas locales, pero ElevenLabs no puede alcanzar `localhost`: en la configuración remota se debe usar una URL HTTPS pública que redirija a este servicio, con autenticación antes de producción.

### Configuración manual en ElevenLabs

1. Habilitá MCP para el workspace si aparece el aviso de aceptación.
2. En **MCP server integrations**, elegí **Add Custom MCP Server**.
3. Ingresá una URL HTTPS pública terminada en `/mcp`; no uses `127.0.0.1` ni `localhost`.
4. Probá la conexión y verificá que se descubran las seis herramientas, incluida `preparar_checkout`.
5. Adjuntá la integración al agente de ventas y elegí aprobación granular: lectura automática para búsquedas/detalles/stock/carrito y aprobación para `agregar_al_carrito` y `preparar_checkout` mientras sea una demo.

No configures todavía el agente con esta URL local.
