import { useConversationClientTool } from "@elevenlabs/react";
import { useAssistantExperience } from "../context/AssistantExperienceContext";
import { featuredProducts } from "../data/products";

function waitForRender() {
  return new Promise((resolve) => window.requestAnimationFrame(resolve));
}

export default function AssistantClientTools() {
  const {
    cartItems,
    openCart,
    prepareCheckout,
    selectProduct,
    showDemoResults,
  } = useAssistantExperience();

  // Los nombres son idénticos a los configurados en ElevenLabs.
  useConversationClientTool("mostrar_productos", async () => {
    showDemoResults();
    await waitForRender();
    return "Panel actualizado con tres recomendaciones simuladas: Runner Nova (rynx-runner-black), Trail Terra (rynx-trail-sand) y Street Pulse (rynx-street-lime).";
  });

  useConversationClientTool("mostrar_detalle_producto", async ({ product_id: productId }) => {
    if (!featuredProducts.some((product) => product.id === productId)) {
      return `No existe un producto simulado con el identificador ${productId}.`;
    }

    selectProduct(productId);
    await waitForRender();
    return `Panel actualizado con el detalle del producto ${productId}.`;
  });

  useConversationClientTool("mostrar_carrito", async () => {
    openCart();
    await waitForRender();
    return "Panel actualizado con el carrito simulado del usuario.";
  });

  useConversationClientTool("mostrar_checkout", async () => {
    if (!cartItems.length) {
      return "No se puede mostrar el checkout: el carrito simulado está vacío.";
    }

    prepareCheckout();
    await waitForRender();
    return "Panel actualizado con la vista de checkout simulado. No se inició ningún pago.";
  });

  return null;
}
