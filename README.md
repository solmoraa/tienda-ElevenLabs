# DR Sport - E-commerce conversacional

Demo de e-commerce en React con un agente de ventas de ElevenLabs, Client Tools, FastAPI y un servidor MCP. El agente busca productos, valida stock y modifica un carrito en memoria.

## Inicio en una computadora nueva

En PowerShell:

~~~powershell
git clone https://github.com/solmoraa/tienda-ElevenLabs.git
cd tienda-ElevenLabs
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\scripts\start-demo.ps1
~~~

Ese es el único comando propio del proyecto para iniciar la demo. La primera ejecución instala o prepara lo que falte; las siguientes reutilizan lo ya disponible.

Al terminar, abrí http://localhost:5173, aceptá el micrófono y tocá **Hablar con el asistente**.

## Qué instala y prepara automáticamente

El comando start-demo llama a setup y después abre las cuatro ventanas de la demo:

1. Node.js LTS, solo si falta, mediante winget.
2. Python 3.12, solo si falta, mediante winget.
3. ngrok, solo si falta, mediante winget.
4. Dependencias de React, Vite y el SDK @elevenlabs/react.
5. El entorno virtual backend/.venv, solo si no existe.
6. Dependencias Python: FastAPI, Uvicorn y MCP.
7. Backend, túnel HTTPS de ngrok, MCP Server y frontend.

Se necesita Windows 10/11 con winget (App Installer), Git, Internet, permiso para instalar software, micrófono y una cuenta de ngrok. El primer arranque solicita el authtoken de ngrok si no está configurado. No se guarda una API Key de ElevenLabs ni un token secreto en el repositorio.

## Configuración única del dueño en ElevenLabs

Antes de entregar el proyecto, configurá localhost:5173 en la allowlist de Security del agente. Es un host fijo: funciona para cualquier computadora que abra la demo en localhost y tu jefe no deberá modificarlo.

La URL MCP es distinta. ElevenLabs necesita una URL HTTPS pública para llamar a las herramientas; no puede llegar al localhost de la computadora que está haciendo la demo.

Ngrok gratuito cambia de dominio. El script muestra la URL MCP actual y la usa para iniciar el servidor local, pero no puede cambiar la URL guardada en ElevenLabs sin credenciales administrativas del agente.

Para que tu jefe no toque ElevenLabs en una presentación, configurá antes una URL HTTPS estable:

- Recomendado: desplegar FastAPI y MCP en un hosting con HTTPS estable.
- Alternativa: usar un dominio reservado de ngrok y ejecutar ngrok con la cuenta que posee ese dominio.

Sin una URL estable, el agente podrá hablar, pero no podrá usar las herramientas MCP hasta que alguien actualice la URL en ElevenLabs.

## Prueba rápida

1. “Busco zapatillas de handball.”
2. “Agregame las negras talle 40.”
3. “Mostrame el carrito.”
4. Usá + para sumar una unidad o − para quitar una.
5. “Me agregaste mal el talle, cambialo al 41.”

## Documentación completa

Leé [docs/GUIA_DEMO.md](docs/GUIA_DEMO.md) para entender la arquitectura, la configuración previa de ElevenLabs, variables opcionales y problemas frecuentes.
