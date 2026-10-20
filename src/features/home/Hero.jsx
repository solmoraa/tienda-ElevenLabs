import AgentButton from "../assistant/AgentButton";
import "./home.css";

export default function Hero({ onConversationError }) {
  return (
    <section className="assistant-launcher" aria-label="Asistente de compra">
      <AgentButton onConversationError={onConversationError} />
    </section>
  );
}
