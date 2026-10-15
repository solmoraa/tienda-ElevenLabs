import AssistantProductCard from "./AssistantProductCard";

export default function ProductResults({ products, onSelect, onShowWelcome }) {
  return (
    <section className="assistant-view" aria-live="polite">
      <p className="assistant-view-kicker">RECOMENDACIONES</p>
      <h3>Encontré estas opciones.</h3>
      <p className="assistant-view-description">Datos simulados para probar el recorrido visual del asistente.</p>
      <div className="assistant-results-list">
        {products.map((product) => (
          <AssistantProductCard key={product.id} product={product} onSelect={onSelect} />
        ))}
      </div>
      <button className="assistant-text-button" type="button" onClick={onShowWelcome}>Volver al inicio</button>
    </section>
  );
}
