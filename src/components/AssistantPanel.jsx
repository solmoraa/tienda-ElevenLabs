import AssistantStatus from "./AssistantStatus";
import AssistantClientTools from "./AssistantClientTools";
import CartView from "./CartView";
import ProductDetails from "./ProductDetails";
import ProductResults from "./ProductResults";
import { useAssistantExperience } from "../context/AssistantExperienceContext";

export default function AssistantPanel({ errorMessage, onClose }) {
  const experience = useAssistantExperience();

  const view = getPanelView(experience);

  return (
    <aside className="assistant-panel" aria-labelledby="assistant-panel-title">
      <AssistantClientTools />
      <header className="assistant-panel-header">
        <div>
          <p className="eyebrow">ASISTENTE RYNX</p>
          <h2 id="assistant-panel-title">Aurora</h2>
        </div>
        <button className="close-panel" type="button" onClick={onClose} aria-label="Ocultar panel del asistente">×</button>
      </header>

      <AssistantStatus errorMessage={errorMessage} />
      {view}
    </aside>
  );
}

function getPanelView(experience) {
  const {
    addSelectedProduct,
    cartItems,
    error,
    lastAddedProduct,
    openCart,
    prepareCheckout,
    products,
    selectProduct,
    selectedProduct,
    showDemoResults,
    showError,
    showWelcome,
    view,
  } = experience;

  if (view === "loading") {
    return <section className="assistant-view assistant-loading" aria-live="polite"><span aria-hidden="true">✦</span><h3>Buscando opciones…</h3><p>Estamos preparando recomendaciones para vos.</p></section>;
  }

  if (view === "results") {
    return <ProductResults products={products} onSelect={selectProduct} onShowWelcome={showWelcome} />;
  }

  if (view === "details") {
    return <ProductDetails product={selectedProduct} onAddToCart={addSelectedProduct} onBack={showDemoResults} />;
  }

  if (view === "confirmation") {
    return <section className="assistant-view" aria-live="polite"><p className="assistant-view-kicker">CARRITO ACTUALIZADO</p><h3>{lastAddedProduct?.name} ya está en tu carrito.</h3><p className="assistant-view-description">Podés seguir explorando o revisar tu selección.</p><button className="assistant-primary-action" type="button" onClick={openCart}>Ver carrito</button><button className="assistant-text-button" type="button" onClick={showDemoResults}>Seguir comprando</button></section>;
  }

  if (view === "cart") {
    return <CartView items={cartItems} onCheckout={prepareCheckout} onContinueShopping={showDemoResults} />;
  }

  if (view === "checkout") {
    return <section className="assistant-view" aria-live="polite"><p className="assistant-view-kicker">CHECKOUT</p><h3>Tu checkout está listo.</h3><p className="assistant-view-description">Esta es una confirmación simulada. En una etapa posterior, el backend generará una URL de pago validada.</p><button className="assistant-primary-action" type="button" onClick={openCart}>Volver al carrito</button></section>;
  }

  if (view === "error") {
    return <section className="assistant-view assistant-state-error" aria-live="polite"><p className="assistant-view-kicker">NO PUDIMOS CONTINUAR</p><h3>Algo salió mal.</h3><p className="assistant-view-description">{error}</p><button className="assistant-primary-action" type="button" onClick={showDemoResults}>Intentar otra vez</button></section>;
  }

  return <section className="assistant-welcome"><span aria-hidden="true">✦</span><h3>Hola, ¿qué estás buscando?</h3><p>Probá el recorrido visual mientras Aurora te acompaña por voz.</p><button className="assistant-primary-action" type="button" onClick={showDemoResults}>Ver recomendaciones</button><button className="assistant-text-button welcome-text-button" type="button" onClick={showError}>Ver estado de error</button></section>;
}
