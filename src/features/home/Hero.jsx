import AgentButton from "../assistant/AgentButton";
import "./home.css";

export default function Hero({ onConversationError }) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow">COMPRA CONVERSACIONAL</p>
        <h1 id="hero-title">Encontrá lo que buscás, <em>hablando.</em></h1>
        <p className="hero-description">
          Descubrí productos en la tienda o hablá con nuestro asistente para recibir una recomendación personalizada.
        </p>
        <AgentButton onConversationError={onConversationError} />
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="orb orb-large"></div>
        <div className="orb orb-small"></div>
        <div className="product-shape"><span></span><span></span><span></span></div>
      </div>
    </section>
  );
}
