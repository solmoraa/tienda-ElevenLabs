import {
  useConversationMode,
  useConversationStatus,
} from "@elevenlabs/react";
import "./AssistantStatus.css";

function getConnectionLabel(status, isSpeaking, isListening) {
  if (status === "connecting") return "Conectando con el asistente";
  if (status === "connected" && isSpeaking) return "El asistente está hablando";
  if (status === "connected" && isListening) return "El asistente está escuchando";
  if (status === "connected") return "Conversación activa";
  return "Panel listo";
}

export default function AssistantStatus({ errorMessage }) {
  const { status } = useConversationStatus();
  const { isSpeaking, isListening } = useConversationMode();

  return (
    <div className="assistant-voice-status" aria-live="polite">
      <span className={`voice-orb ${isSpeaking ? "voice-orb--speaking" : ""}`} aria-hidden="true" />
      <span>{getConnectionLabel(status, isSpeaking, isListening)}</span>
      {errorMessage && <span className="agent-error panel-error">{errorMessage}</span>}
    </div>
  );
}
