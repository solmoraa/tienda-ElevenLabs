import {
  useConversationInput,
  useConversationMode,
  useConversationStatus,
} from "@elevenlabs/react";

function getConnectionLabel(status, isSpeaking, isListening) {
  if (status === "connecting") return "Conectando con Aurora";
  if (status === "connected" && isSpeaking) return "Aurora está hablando";
  if (status === "connected" && isListening) return "Aurora está escuchando";
  if (status === "connected") return "Conversación activa";
  return "Panel listo";
}

export default function AssistantStatus({ errorMessage }) {
  const { message, status } = useConversationStatus();
  const { isSpeaking, isListening } = useConversationMode();
  const { isMuted, setMuted } = useConversationInput();
  const isConnected = status === "connected";

  return (
    <>
      <p className="connection-status"><span></span>{getConnectionLabel(status, isSpeaking, isListening)}</p>

      {isConnected && (
        <button className="mute-button" type="button" onClick={() => setMuted(!isMuted)}>
          {isMuted ? "Activar micrófono" : "Silenciar micrófono"}
        </button>
      )}

      {message && <p className="conversation-message">{message}</p>}
      {errorMessage && <p className="agent-error panel-error">{errorMessage}</p>}
    </>
  );
}
