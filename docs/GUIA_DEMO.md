# Guía de instalación y demostración

Esta guía permite levantar DR Sport en otra computadora Windows sin rutas personales ni configuración manual de Python o React.

## Requisitos

- Git.
- Node.js `20.19+` o `22.12+`.
- Python `3.11+`.
- ngrok con cuenta y authtoken configurado, solo para usar el agente de voz.
- Acceso al workspace de ElevenLabs para actualizar temporalmente la URL MCP cuando ngrok cambie de dominio.

No se debe colocar una API Key de ElevenLabs en React. El frontend usa el Agent ID público para iniciar la conversación.

## Instalación inicial

```powershell
git clone https://github.com/solmoraa/tienda-ElevenLabs.git
cd tienda-ElevenLabs
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\scripts\setup.ps1
```

El script instala dependencias del frontend y crea `backend\.venv` con FastAPI, Uvicorn, MCP y los demás paquetes necesarios.

## Mostrar la experiencia completa con ElevenLabs

ElevenLabs está en la nube y no puede llamar directamente al `localhost` de la computadora que hace la demo. Ngrok publica temporalmente el MCP Server local.

### Inicio recomendado: un único comando

Desde la raíz del repositorio ejecutá:

```powershell
.\scripts\start-demo.ps1
```

El script abre el backend, ngrok, el MCP Server y el frontend en ventanas separadas. También detecta el host HTTPS de ngrok y lo utiliza para iniciar MCP. Al finalizar, copiá la URL MCP que imprime el script y configurala en ElevenLabs.

Los pasos manuales siguientes son una alternativa para diagnosticar cada proceso por separado.

Abrí cuatro terminales PowerShell en la raíz del proyecto.

### 1. API FastAPI

```powershell
.\scripts\start-backend.ps1
```

### 2. Túnel público ngrok

```powershell
.\scripts\start-ngrok.ps1
```

Copiá el host de la línea que muestra ngrok. Ejemplo:

```text
Forwarding https://ejemplo.ngrok-free.dev -> http://localhost:8001
```

El host es `ejemplo.ngrok-free.dev`.

### 3. MCP Server

```powershell
.\scripts\start-mcp.ps1 -NgrokHost "ejemplo.ngrok-free.dev"
```

Usá el host real de ngrok, sin `https://` ni `/mcp`.

### 4. Frontend

```powershell
.\scripts\start-frontend.ps1
```

Abrí `http://127.0.0.1:5173`, permití el micrófono y tocá **Hablar con el asistente**.

## Configuración en ElevenLabs

En la integración MCP del agente **Asistente de ventas**, usá:

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

Si ngrok cambia de dominio, repetí los pasos de ngrok, MCP y actualización de URL en ElevenLabs.

## Guion de prueba

1. “Busco zapatillas de handball.”
2. “Agregame las negras talle 40.”
3. “Mostrame el carrito.”
4. “Me agregaste mal el talle, cambialo al 41.”
5. “Sacame esa variante del carrito.”

También se puede eliminar una línea directamente desde el botón **Eliminar** del carrito.

## Problemas frecuentes

| Problema | Acción |
| --- | --- |
| Falta `backend\.venv\Scripts\python.exe` | Ejecutar `.\scripts\setup.ps1`. |
| No se reconoce `corepack` | Instalar Node.js compatible y abrir una terminal nueva. |
| No abre el frontend | Verificar que el puerto 5173 esté libre y ejecutar `start-frontend.ps1`. |
| ElevenLabs no conecta | Verificar backend, ngrok y MCP; la URL debe terminar en `/mcp`. |
| Falla el host MCP | Pasar solo el host de ngrok a `-NgrokHost`. |
| El agente no llama una herramienta nueva | Reiniciar MCP, volver a probar la integración y aprobar la herramienta. |

## Recomendación para presentaciones futuras

Ngrok gratuito cambia de URL. Para no modificar ElevenLabs en cada demo, desplegá FastAPI y el MCP Server en un hosting con URL HTTPS estable, o usá un dominio reservado de ngrok. Esa URL se configura una sola vez en ElevenLabs.
