import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useConversationControls, useConversationMode } from "@elevenlabs/react";
import AssistantStatus from "../../components/AssistantStatus/AssistantStatus";
import ConversationTranscript from "../../components/ConversationTranscript/ConversationTranscript";
import { useAssistantExperience } from "../../controllers/context/AssistantExperienceContext";
import { useCart } from "../../controllers/context/CartContext";
import CartView from "../cart/CartView";
import ProductDetails from "../products/ProductDetails";
import ProductResults from "../products/ProductResults";
import "./assistant.css";

const overlayStyle = {
  position: "fixed",
  zIndex: 2147483647,
  inset: 0,
  width: "100vw",
  minHeight: "100vh",
  minHeight: "100dvh",
  background: "#fbfbfa",
};

export default function AssistantPanel({ conversationMessages, errorMessage, onCheckoutReady, onClose, variant }) {
  // El portal lleva el overlay directamente al body. Safari iOS deja de
  // depender de cualquier contenedor o contexto de apilamiento de la tienda.
  return createPortal(
    <aside
      className={`assistant-panel ${variant === "overlay" ? "assistant-panel--overlay" : ""}`}
      style={variant === "overlay" ? overlayStyle : undefined}
      aria-label="Asistente de compra"
    >
      <header className="assistant-panel-header">
        <div className="assistant-panel-status">
          <AssistantStatus errorMessage={errorMessage} />
        </div>
        <div className="assistant-panel-mobile-transcript">
          <ConversationTranscript messages={conversationMessages} compact />
        </div>
        <button className="close-panel" type="button" onClick={onClose} aria-label="Finalizar conversación y volver a la tienda">Terminar llamada</button>
      </header>
      <div className="assistant-panel-content">
        <PanelView onCheckoutReady={onCheckoutReady} />
        <div className="assistant-panel-desktop-transcript">
          <ConversationTranscript messages={conversationMessages} />
        </div>
      </div>
    </aside>
    , document.body,
  );
}

function PanelView({ onCheckoutReady }) {
  const experience = useAssistantExperience();
  const { addItem, items: cartItems, recommendation, removeItem, total: cartTotal } = useCart();
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

  const handleBuyNow = (product, selection) => {
    sendContextualUpdate(
      `El cliente pulsó "Comprar ahora" para ${product.name} (product_id=${product.id}), color ${selection.color}, talle ${selection.size}. Es una compra directa: agregá exactamente una unidad mediante MCP y, si resulta exitosa, prepará y mostrá inmediatamente el checkout. No muestres el carrito como paso intermedio.`,
    );
    sendUserMessage(`Quiero comprar ahora una unidad: product_id=${product.id}, color=${selection.color}, talle=${selection.size}.`);
  };

  const handleVariantChange = async (selection) => {
    await selectProductVariant(selectedProduct.id, selection);
    const detail = [selection.color && `color ${selection.color}`, selection.size && `talle ${selection.size}`].filter(Boolean).join(" y ");
    sendContextualUpdate(`El cliente seleccionó manualmente ${detail} para ${selectedProduct.name} (product_id=${selectedProduct.id}). Usá esa variante si luego pide agregarlo.`);
  };

  const handleRemoveItem = async ({ product, quantity }) => {
    try {
      await removeItem({
        productId: product.id,
        color: product.selectedColor,
        size: product.selectedSize,
        quantity,
      });
      sendContextualUpdate(
        `El cliente eliminó del carrito ${product.name} (product_id=${product.id}), color ${product.selectedColor}, talle ${product.selectedSize}. El carrito ya está actualizado.`,
      );
    } catch (removeError) {
      console.error("No se pudo eliminar el producto del carrito:", removeError);
    }
  };

  const notifyQuantityChange = (action, product, quantity) => {
    sendContextualUpdate(
      `El cliente ${action} una unidad de ${product.name} (product_id=${product.id}), color ${product.selectedColor}, talle ${product.selectedSize}. El carrito ya está actualizado: cantidad actual ${quantity}.`,
    );
  };

  const handleIncreaseItem = async ({ product, quantity }) => {
    try {
      const cart = await addItem({
        productId: product.id,
        color: product.selectedColor,
        size: product.selectedSize,
        quantity: 1,
      });
      const item = cart.items.find((current) => current.product_id === product.id && current.selected_color === product.selectedColor && current.selected_size === product.selectedSize);
      notifyQuantityChange("agregó", product, item?.quantity ?? quantity + 1);
    } catch (addError) {
      console.error("No se pudo agregar una unidad al carrito:", addError);
    }
  };

  const handleDecreaseItem = async ({ product }) => {
    try {
      const cart = await removeItem({
        productId: product.id,
        color: product.selectedColor,
        size: product.selectedSize,
        quantity: 1,
      });
      const item = cart.items.find((current) => current.product_id === product.id && current.selected_color === product.selectedColor && current.selected_size === product.selectedSize);
      notifyQuantityChange("quitó", product, item?.quantity ?? 0);
    } catch (removeError) {
      console.error("No se pudo quitar una unidad del carrito:", removeError);
    }
  };

  if (view === "loading") return <section className="assistant-view assistant-loading" aria-live="polite"><h3>Buscando opciones…</h3><p>Consultando productos reales.</p></section>;
  if (view === "results") return <ProductResults products={products} onSelect={handleProductSelection} onShowWelcome={showWelcome} />;
  if (view === "details") return <ProductDetails product={selectedProduct} selectedColor={selectedColor} selectedSize={selectedSize} onVariantChange={handleVariantChange} onAddToCart={handleAddToCart} onBuyNow={handleBuyNow} onBack={() => showProducts(products.map((product) => product.id))} />;
  if (view === "cart") return <CartView items={cartItems} recommendation={recommendation} total={cartTotal} onDecreaseItem={handleDecreaseItem} onIncreaseItem={handleIncreaseItem} onRemoveItem={handleRemoveItem} onViewRecommendation={() => showProductDetail(recommendation.id, { color: recommendation.suggested_color })} onCheckout={() => sendUserMessage("Quiero pagar mi carrito y confirmar el checkout.")} onContinueShopping={showWelcome} />;
  if (view === "checkout") return <section className="assistant-view assistant-loading" aria-live="polite"><span className="voice-orb voice-orb--speaking" /><h3>Abriendo el pago…</h3></section>;
  if (view === "error") return <section className="assistant-view assistant-state-error" aria-live="polite"><p className="assistant-view-kicker">NO PUDIMOS CONTINUAR</p><h3>Algo salió mal.</h3><p className="assistant-view-description">{error}</p></section>;
  return <section className="assistant-welcome"><span className={`voice-orb voice-orb--hero ${isSpeaking ? "voice-orb--speaking" : ""}`} aria-hidden="true" /><h3>{isSpeaking ? "Hablando…" : isListening ? "Escuchando…" : "Conversación activa"}</h3><p>Contale al asistente qué estás buscando.</p></section>;
}
