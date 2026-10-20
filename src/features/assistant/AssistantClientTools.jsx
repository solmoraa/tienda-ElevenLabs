import { useConversationClientTool } from "@elevenlabs/react";
import { useAssistantExperience } from "../../context/AssistantExperienceContext";

function waitForRender() {
  return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

function parseProductIds(productIds) {
  return String(productIds ?? "").split(",").map((id) => id.trim()).filter(Boolean);
}

export default function AssistantClientTools() {
  const { showCart, showCheckout, showError, showProductDetail, showProducts } = useAssistantExperience();

  useConversationClientTool("mostrar_productos", async ({ product_ids: productIds }) => {
    try {
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
      await showProductDetail(productId);
      await waitForRender();
      return `Panel actualizado con el detalle real del producto ${productId}.`;
    } catch {
      showError("No pudimos cargar el detalle real del producto.");
      return "No se pudo actualizar el detalle en pantalla.";
    }
  });

  useConversationClientTool("mostrar_carrito", async ({ session_id: sessionId }) => {
    try {
      await showCart(sessionId);
      await waitForRender();
      return "Panel actualizado con el carrito real de esta conversación.";
    } catch {
      showError("No pudimos cargar el carrito real.");
      return "No se pudo actualizar el carrito en pantalla.";
    }
  });

  useConversationClientTool("mostrar_checkout", async ({ checkout_id: checkoutId }) => {
    try {
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
