import { useConversationClientTool } from "@elevenlabs/react";
import { useAssistantExperience } from "../context/AssistantExperienceContext";

function waitForRender() {
  return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

function parseProductIds(productIds) {
  return String(productIds ?? "").split(",").map((id) => id.trim()).filter(Boolean);
}

export default function AssistantClientTools({ onAssistantVisibilityChange }) {
  const { selectProductVariant, showCart, showCheckout, showError, showProductDetail, showProducts } = useAssistantExperience();

  useConversationClientTool("mostrar_productos", async ({ product_ids: productIds }) => {
    try {
      // Si el agente pudo llamar una Client Tool, la interfaz debe quedar
      // visible incluso si Safari demoró en propagar el estado de WebRTC.
      onAssistantVisibilityChange(true);
      const ids = parseProductIds(productIds);
      if (!ids.length) throw new Error("La herramienta no recibió productos.");
      await showProducts(ids);
      await waitForRender();
      return "Panel actualizado con productos reales del catálogo.";
    } catch {
      showError("No pudimos cargar las recomendaciones reales.");
      return "No se pudo actualizar el panel de productos.";
    }
  });

  useConversationClientTool("mostrar_detalle_producto", async ({ product_id: productId }) => {
    try {
      onAssistantVisibilityChange(true);
      await showProductDetail(productId);
      await waitForRender();
      return `Panel actualizado con el detalle real del producto ${productId}.`;
    } catch {
      showError("No pudimos cargar el detalle real del producto.");
      return "No se pudo actualizar el detalle en pantalla.";
    }
  });

  useConversationClientTool("seleccionar_color_producto", async ({ color, product_id: productId }) => {
    try {
      onAssistantVisibilityChange(true);
      const selection = await selectProductVariant(productId, { color });
      await waitForRender();
      return `Color ${selection.color} seleccionado para ${selection.product.name}.`;
    } catch (error) {
      return error instanceof Error ? error.message : "No se pudo cambiar el color en pantalla.";
    }
  });

  useConversationClientTool("mostrar_carrito", async ({ session_id: sessionId }) => {
    try {
      onAssistantVisibilityChange(true);
      const cart = await showCart(sessionId);
      await waitForRender();
      const related = cart.recommendation;
      return related
        ? `Panel actualizado con el carrito real. También se muestra la recomendación ${related.name}, color sugerido ${related.suggested_color} (product_id=${related.id}); ofrecela una sola vez antes del checkout.`
        : "Panel actualizado con el carrito real de esta conversación.";
    } catch {
      showError("No pudimos cargar el carrito real.");
      return "No se pudo actualizar el carrito en pantalla.";
    }
  });

  useConversationClientTool("mostrar_checkout", async ({ checkout_id: checkoutId }) => {
    try {
      onAssistantVisibilityChange(true);
      await showCheckout(checkoutId);
      await waitForRender();
      return "La pantalla muestra el checkout de demostración validado por el servidor.";
    } catch {
      showError("No pudimos cargar el checkout de demostración.");
      return "No se pudo actualizar la pantalla de checkout.";
    }
  });

  return null;
}
