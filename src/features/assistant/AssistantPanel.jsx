import { useEffect } from "react";
import { useConversationControls, useConversationMode } from "@elevenlabs/react";
import AssistantStatus from "../../components/AssistantStatus/AssistantStatus";
import { useAssistantExperience } from "../../context/AssistantExperienceContext";
import { useCart } from "../../context/CartContext";
import CartView from "../cart/CartView";
import ProductDetails from "../products/ProductDetails";
import ProductResults from "../products/ProductResults";
import "./assistant.css";

export default function AssistantPanel({ errorMessage, onCheckoutReady, onClose, variant }) {
  return (
    <aside className={`assistant-panel ${variant === "overlay" ? "assistant-panel--overlay" : ""}`} aria-label="Asistente de compra">
      <header className="assistant-panel-header">
        <AssistantStatus errorMessage={errorMessage} />
        <button className="close-panel" type="button" onClick={onClose} aria-label="Finalizar conversación y volver a la tienda">Terminar llamada</button>
      </header>
      <PanelView onCheckoutReady={onCheckoutReady} />
    </aside>
  );
}

function PanelView({ onCheckoutReady }) {
  const experience = useAssistantExperience();
  const { items: cartItems, recommendation, total: cartTotal } = useCart();
  const { checkout, error, products, selectedColor, selectedProduct, selectedSize, selectProduct, selectProductVariant, showProductDetail, showProducts, showWelcome, view } = experience;
  const { sendContextualUpdate, sendUserMessage } = useConversationControls();
  const { isListening, isSpeaking } = useConversationMode();

  useEffect(() => {
    if (view === "checkout" && checkout) onCheckoutReady(checkout);
  }, [checkout, onCheckoutReady, view]);

  const handleProductSelection = (productId) => {
    const product = products.find((item) => item.id === productId);
    selectProduct(productId);

    if (product) {
      sendContextualUpdate(
        `El cliente seleccionó visualmente el producto ${product.name} (product_id=${product.id}). Si pide agregarlo, usá este product_id exacto y seguí el flujo de stock y carrito mediante MCP.`,
      );
    }
  };

  const handleAddToCart = (product, selection) => {
    sendContextualUpdate(
      `El cliente pulsó "Agregar al carrito" para ${product.name} (product_id=${product.id}), color ${selection.color}, talle ${selection.size}. Es una solicitud explícita: agregá exactamente una unidad mediante MCP con esos datos y luego mostrale el carrito.`,
    );
    sendUserMessage(`Quiero agregar una unidad al carrito: product_id=${product.id}, color=${selection.color}, talle=${selection.size}.`);
  };

  const handleVariantChange = async (selection) => {
    await selectProductVariant(selectedProduct.id, selection);
    const detail = [selection.color && `color ${selection.color}`, selection.size && `talle ${selection.size}`].filter(Boolean).join(" y ");
    sendContextualUpdate(`El cliente seleccionó manualmente ${detail} para ${selectedProduct.name} (product_id=${selectedProduct.id}). Usá esa variante si luego pide agregarlo.`);
  };

  if (view === "loading") return <section className="assistant-view assistant-loading" aria-live="polite"><h3>Buscando opciones…</h3><p>Consultando productos reales.</p></section>;
  if (view === "results") return <ProductResults products={products} onSelect={handleProductSelection} onShowWelcome={showWelcome} />;
  if (view === "details") return <ProductDetails product={selectedProduct} selectedColor={selectedColor} selectedSize={selectedSize} onVariantChange={handleVariantChange} onAddToCart={handleAddToCart} onBack={() => showProducts(products.map((product) => product.id))} />;
  if (view === "cart") return <CartView items={cartItems} recommendation={recommendation} total={cartTotal} onViewRecommendation={() => showProductDetail(recommendation.id, { color: recommendation.suggested_color })} onCheckout={() => sendUserMessage("Quiero pagar mi carrito y confirmar el checkout.")} onContinueShopping={showWelcome} />;
  if (view === "checkout") return <section className="assistant-view assistant-loading" aria-live="polite"><span className="voice-orb voice-orb--speaking" /><h3>Abriendo el pago…</h3></section>;
  if (view === "error") return <section className="assistant-view assistant-state-error" aria-live="polite"><p className="assistant-view-kicker">NO PUDIMOS CONTINUAR</p><h3>Algo salió mal.</h3><p className="assistant-view-description">{error}</p></section>;
  return <section className="assistant-welcome"><span className={`voice-orb voice-orb--hero ${isSpeaking ? "voice-orb--speaking" : ""}`} aria-hidden="true" /><h3>{isSpeaking ? "Hablando…" : isListening ? "Escuchando…" : "Conversación activa"}</h3><p>Contale al asistente qué estás buscando.</p></section>;
}
