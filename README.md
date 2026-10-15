# Rynx — E-commerce conversacional

Segunda versión del frontend: una aplicación React controlada por el SDK oficial `@elevenlabs/react`. Reemplaza por completo el widget HTML embebido.

## Qué incluye

- Un botón de conversación propio, escrito en React.
- `ConversationProvider`, `useConversationControls` y `useConversationStatus`.
- Inicio y finalización de una sesión de voz mediante el Agent ID público.
- Estado visual de conexión, espera y error.
- Sin claves API ni backend: esto requiere que el agente sea público y admita conexiones por Agent ID.

## Estructura

```text
src/
├── App.jsx       # Tienda y botón de conversación
├── main.jsx      # Punto de entrada de React
└── styles.css    # Estilos responsive
index.html        # Documento de Vite
```

## Ejecutar localmente

Este proyecto usa `pnpm`. Si PowerShell bloquea scripts, ejecutalo mediante Corepack:

```powershell
& "C:\Program Files\nodejs\corepack.cmd" pnpm dev
```

Vite mostrará una URL local, normalmente `http://localhost:5173`. Abrila en el navegador y pulsá **Hablar con nuestro asistente**. El navegador solicitará permiso para utilizar el micrófono antes de conectar la conversación.

## Verificación

1. El botón debe decir **Hablar con Aurora** antes de iniciar.
2. Al pulsarlo, aceptá el permiso de micrófono cuando el navegador lo solicite.
3. Mientras conecta mostrará **Conectando...**.
4. Una vez conectada la conversación, mostrará **Finalizar conversación**.
5. Al finalizar, vuelve al estado inicial.

Para que el agente acepte la conexión, verificá su acceso público y la lista de permitidos desde ElevenLabs. Nunca agregues una API key al código del navegador.
