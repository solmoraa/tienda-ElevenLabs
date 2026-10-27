import { useCallback, useState } from "react";
import { ConversationProvider, useConversationControls, useConversationStatus } from "@elevenlabs/react";
import AssistantClientTools from "./features/assistant/AssistantClientTools";
import AssistantPanel from "./features/assistant/AssistantPanel";
import CheckoutView from "./features/checkout/CheckoutView";
import HomePage from "./features/home/HomePage";
import { AssistantExperienceProvider, useAssistantExperience } from "./context/AssistantExperienceContext";
import { CartProvider } from "./context/CartContext";

function Storefront({ conversationError, onConversationError }) {
  const { endSession } = useConversationControls();
  const { status } = useConversationStatus();
  const experience = useAssistantExperience();
  const [storeCheckout, setStoreCheckout] = useState(null);
  const isConversationActive = status === "connecting" || status === "connected";

  const handleExitAssistant = async () => {
    if (status === "connected" || status === "connecting") await endSession();
    experience.showWelcome();
  };

  const handleCheckoutReady = useCallback((checkout) => {
    setStoreCheckout(checkout);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (storeCheckout) {
    return (
      <>
        <AssistantClientTools />
        <CheckoutView checkout={storeCheckout} standalone onBack={() => { setStoreCheckout(null); experience.showWelcome(); }} />
      </>
    );
  }

  return (
    <>
      <AssistantClientTools />
      <HomePage onConversationError={onConversationError} />

      {isConversationActive && (
        <AssistantPanel
          errorMessage={conversationError}
          onCheckoutReady={handleCheckoutReady}
          onClose={handleExitAssistant}
          variant="overlay"
        />
      )}
    </>
  );
}

export default function App() {
  const [conversationError, setConversationError] = useState("");

  return (
    // El Provider habilita los hooks oficiales del SDK en todos sus componentes hijos.
    <ConversationProvider
      serverLocation="global"
      // Algunos errores ocurren durante la sesión, no necesariamente dentro del click del botón.
      onError={(error) => {
        console.error("Error de conversación:", error);
        setConversationError("No pudimos conectar con el asistente. Revisá el permiso del micrófono y la configuración de acceso del agente.");
      }}
    >
      <CartProvider>
        <AssistantExperienceProvider>
          <Storefront
            conversationError={conversationError}
            onConversationError={setConversationError}
          />
        </AssistantExperienceProvider>
      </CartProvider>
    </ConversationProvider>
  );
}
