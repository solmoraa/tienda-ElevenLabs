# Guía de entrega y demostración

Esta guía permite entregar DR Sport a una persona que no participó del desarrollo. El objetivo es que clone el repositorio y ejecute un solo comando.

## Preparación única antes de entregar

En ElevenLabs, abrí el agente **Asistente de ventas** y agregá este host en Security > allowlist:

~~~text
localhost:5173
~~~

ElevenLabs verifica el hostname de origen antes de abrir la conversación. localhost:5173 sirve para cualquier computadora; no depende de tu PC.

El agente también necesita una URL HTTPS para su MCP Server. ElevenLabs no puede acceder al localhost del equipo de tu jefe.

### La limitación de ngrok gratuito

Ngrok gratuito da una URL temporal. El script la detecta y arranca el MCP correctamente, pero no puede cambiar por sí mismo la URL que el agente tiene guardada: eso exigiría administrar el agente con una credencial de ElevenLabs.

Por eso hay dos modos:

- **Desarrollo:** usá ngrok gratuito y actualizá manualmente la URL MCP en ElevenLabs cada vez que cambie.
- **Entrega sin tocar ElevenLabs:** configurá antes una URL estable. Puede ser FastAPI/MCP desplegados en hosting, o un dominio reservado de ngrok.

No compartas una API Key de ElevenLabs ni tu authtoken personal de ngrok dentro del repositorio.

## Inicio con un solo comando

En una computadora Windows:

~~~powershell
git clone https://github.com/solmoraa/tienda-ElevenLabs.git
cd tienda-ElevenLabs
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\scripts\start-demo.ps1
~~~

No es necesario ejecutar setup por separado: start-demo lo llama automáticamente.

Abrí después:

~~~text
http://localhost:5173
~~~

Aceptá el micrófono para iniciar la conversación.

## Qué hace start-demo

| Paso | Qué hace | Cuándo se repite |
| --- | --- | --- |
| Node.js LTS | Lo instala con winget si falta. | Luego solo verifica. |
| Python 3.12 | Lo instala con winget si falta. | Luego solo verifica. |
| ngrok | Lo instala con winget si falta. | Luego solo verifica. |
| Authtoken ngrok | Lo pide si todavía no está configurado. | ngrok lo guarda en el perfil del usuario. |
| Frontend | Ejecuta pnpm install para verificar React, Vite y @elevenlabs/react. | Reutiliza paquetes ya resueltos. |
| Backend | Crea backend/.venv si falta e instala/verifica paquetes Python. | El entorno se reutiliza. |
| Demo | Abre FastAPI, ngrok, MCP y Vite en ventanas separadas. | En cada demostración. |

El script muestra una URL como:

~~~text
URL MCP actual: https://ejemplo.ngrok-free.dev/mcp
~~~

Esa URL debe coincidir con la configuración MCP del agente para que se ejecuten las herramientas:

- buscar_productos
- obtener_detalle_producto
- consultar_stock
- agregar_al_carrito
- eliminar_del_carrito
- actualizar_variante_carrito
- obtener_carrito
- preparar_checkout

La integración se configura como HTTP reproducible o Streamable HTTP.

## Variables opcionales

| Variable | Uso |
| --- | --- |
| NGROK_AUTHTOKEN | Evita que el instalador pregunte el token de ngrok. |
| NGROK_DOMAIN | Usa un dominio reservado de ngrok en lugar de uno temporal. |

Ejemplo:

~~~powershell
$env:NGROK_DOMAIN = "demo-tuempresa.ngrok.app"
.\scripts\start-demo.ps1
~~~

El dominio debe pertenecer a la cuenta de ngrok usada en esa computadora.

## Prueba funcional

1. Pedí zapatillas de handball.
2. Agregá una variante.
3. Mostrá el carrito.
4. Usá el botón + para sumar la misma variante.
5. Usá − para quitar solo una unidad.
6. Usá Eliminar para sacar toda la línea.
7. Pedí cambiar color o talle por voz.
8. Pedí finalizar la compra.

## Solución de problemas

| Problema | Solución |
| --- | --- |
| Falta winget | Instalá App Installer desde Microsoft Store y repetí el comando. |
| ngrok pide autenticación | Creá una cuenta gratuita y pegá el authtoken cuando se solicite. |
| El agente habla pero no usa el carrito | La URL MCP configurada no coincide con la URL actual. Usá URL estable o actualizá la integración MCP. |
| No funciona el micrófono | Permití micrófono para localhost en el navegador. |
| ElevenLabs rechaza la sesión | Agregá localhost:5173 a la allowlist del agente. |
| El carrito se vacía | Es esperado: la persistencia actual es en memoria. |

## Recomendación final

Para una presentación donde la persona no tenga que tocar ElevenLabs, desplegá backend y MCP con una URL HTTPS fija y configurala una sola vez en el agente. Con ngrok gratuito no existe una forma segura de evitar que la URL cambie entre demostraciones.
