import AgentButton from "./AgentButton";

export default function Hero({ onConversationError, onShowAssistantPanel }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">COMPRA CONVERSACIONAL</p>
        <h1 id="hero-title">Encontrá lo que buscás, <em>hablando.</em></h1>
        <p className="hero-description">
          Descubrí productos en la tienda o hablá con Aurora para recibir una recomendación personalizada.
        </p>
        <AgentButton
          onConversationError={onConversationError}
          onShowAssistantPanel={onShowAssistantPanel}
        />
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="orb orb-large"></div>
        <div className="orb orb-small"></div>
        <div className="product-shape"><span></span><span></span><span></span></div>
      </div>
    </section>
  );
}
