import { useState } from "react";
import { useConversationControls, useConversationStatus } from "@elevenlabs/react";

// Identificador público del agente configurado por la usuaria en ElevenLabs.
const AGENT_ID = "agent_4301m4zxq778fc3aky579g2w12e9";

export default function AgentButton({ onConversationError, onShowAssistantPanel }) {
  // Acciones oficiales para abrir y cerrar una sesión de voz.
  const { startSession, endSession } = useConversationControls();
  // Estado reactivo: disconnected, connecting o connected.
  const { status } = useConversationStatus();
  const [errorMessage, setErrorMessage] = useState("");

  const isConnected = status === "connected";
  const isConnecting = status === "connecting";

  const handleConversation = async () => {
    setErrorMessage("");
    onConversationError("");

    try {
      if (isConnected) {
        await endSession();
        return;
      }

      onShowAssistantPanel();
      // Pedimos el permiso de forma explícita para poder explicar el motivo al usuario.
      await requestMicrophonePermission();
      // Para un agente público basta su Agent ID; nunca se expone una API key en el navegador.
      await startSession({ agentId: AGENT_ID });
    } catch (error) {
      console.error("Error al iniciar la conversación:", error);
      const message = getReadableError(error);
      setErrorMessage(message);
      onConversationError(message);
    }
  };

  return (
    <div className="agent-button-area" aria-live="polite">
      <button
        className={`agent-button ${isConnected ? "agent-button--active" : ""}`}
        type="button"
        onClick={handleConversation}
        disabled={isConnecting}
      >
        <span aria-hidden="true">{isConnected ? "■" : "✦"}</span>
        {isConnected ? "Finalizar conversación" : isConnecting ? "Conectando..." : "Hablar con nuestro asistente"}
      </button>
      <p>{isConnected ? "Aurora está conectada." : "Al iniciar, el navegador solicitará acceso al micrófono."}</p>
      {errorMessage && <p className="agent-error">{errorMessage}</p>}
    </div>
  );
}

async function requestMicrophonePermission() {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("Tu navegador no permite acceder al micrófono.");
  }

  const microphoneStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  // Solo verificamos el permiso. El SDK abre su propia captura al iniciar la sesión.
  microphoneStream.getTracks().forEach((track) => track.stop());
}

function getReadableError(error) {
  if (error?.name === "NotAllowedError") {
    return "Necesitamos permiso para usar el micrófono. Permitilo desde el navegador e intentá nuevamente.";
  }

  if (error?.name === "NotFoundError") {
    return "No encontramos un micrófono disponible. Conectá uno e intentá nuevamente.";
  }

  return "No pudimos iniciar la conversación. Revisá el permiso del micrófono y el acceso del agente.";
}
