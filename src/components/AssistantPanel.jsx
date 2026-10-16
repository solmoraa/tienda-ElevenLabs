import AssistantStatus from "./AssistantStatus";
import CartView from "./CartView";
import CheckoutView from "./CheckoutView";
import ProductDetails from "./ProductDetails";
import ProductResults from "./ProductResults";
import { useAssistantExperience } from "../context/AssistantExperienceContext";
import { useConversationControls } from "@elevenlabs/react";

export default function AssistantPanel({ errorMessage, onClose, variant }) {
  const experience = useAssistantExperience();

  return (
    <aside className={`assistant-panel ${variant === "overlay" ? "assistant-panel--overlay" : ""}`} aria-labelledby="assistant-panel-title">
      <header className="assistant-panel-header">
        <div><p className="eyebrow">ASISTENTE RYNX</p><h2 id="assistant-panel-title">Aurora</h2></div>
        <button className="close-panel" type="button" onClick={onClose} aria-label="Finalizar conversación y volver a la tienda">Finalizar conversación</button>
      </header>
      <AssistantStatus errorMessage={errorMessage} />
      <PanelView experience={experience} />
    </aside>
  );
}

function PanelView({ experience }) {
  const { cartItems, checkout, error, products, selectedProduct, selectProduct, showWelcome, view } = experience;
  const { sendContextualUpdate, sendUserMessage } = useConversationControls();

  const handleProductSelection = (productId) => {
    const product = products.find((item) => item.id === productId);
    selectProduct(productId);

    if (product) {
      sendContextualUpdate(
        `El cliente seleccionó visualmente el producto ${product.name} (product_id=${product.id}). Si pide agregarlo, usá este product_id exacto y seguí el flujo de stock y carrito mediante MCP.`
      );
    }
  };

  const handleAddToCart = (product) => {
    sendContextualUpdate(
      `El cliente pulsó "Agregar al carrito" para ${product.name} (product_id=${product.id}). Es una solicitud explícita: verificá el stock y, si corresponde, agregalo al carrito mediante MCP.`
    );
    sendUserMessage(`Quiero agregar al carrito el producto con product_id=${product.id}.`);
  };

  if (view === "loading") return <section className="assistant-view assistant-loading" aria-live="polite"><h3>Buscando opciones…</h3><p>Consultando productos reales.</p></section>;
  if (view === "results") return <ProductResults products={products} onSelect={handleProductSelection} onShowWelcome={showWelcome} />;
  if (view === "details") return <ProductDetails product={selectedProduct} onAddToCart={handleAddToCart} onBack={() => experience.showProducts(products.map((product) => product.id))} />;
  if (view === "cart") return <CartView items={cartItems} onCheckout={() => sendUserMessage("Quiero pagar mi carrito y confirmar el checkout.")} onContinueShopping={showWelcome} />;
  if (view === "checkout") return <CheckoutView checkout={checkout} onBack={() => experience.showCart(checkout.session_id)} />;
  if (view === "error") return <section className="assistant-view assistant-state-error" aria-live="polite"><p className="assistant-view-kicker">NO PUDIMOS CONTINUAR</p><h3>Algo salió mal.</h3><p className="assistant-view-description">{error}</p></section>;
  return <section className="assistant-welcome"><span aria-hidden="true">✦</span><h3>Hola, ¿qué estás buscando?</h3><p>Contale a Aurora qué necesitás y te mostrará resultados reales.</p></section>;
}
