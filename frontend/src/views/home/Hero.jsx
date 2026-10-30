import AgentButton from "../assistant/AgentButton";
import "./home.css";

export default function Hero({ onAssistantVisibilityChange, onConversationError }) {
  return (
    <section className="assistant-launcher" aria-label="Asistente de compra">
      <AgentButton
        onAssistantVisibilityChange={onAssistantVisibilityChange}
        onConversationError={onConversationError}
      />
    </section>
  );
}
