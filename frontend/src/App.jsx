import { useCallback, useState } from "react";
import { ConversationProvider, useConversationControls, useConversationStatus } from "@elevenlabs/react";
import AssistantClientTools from "./controllers/assistant/AssistantClientTools";
import { AssistantExperienceProvider, useAssistantExperience } from "./controllers/context/AssistantExperienceContext";
import { CartProvider } from "./controllers/context/CartContext";
import AssistantPanel from "./views/assistant/AssistantPanel";
import CheckoutView from "./views/checkout/CheckoutView";
import HomePage from "./views/home/HomePage";

function Storefront({ assistantOpen, conversationError, onAssistantVisibilityChange, onConversationError }) {
  const { endSession } = useConversationControls();
  const { status } = useConversationStatus();
  const experience = useAssistantExperience();
  const [storeCheckout, setStoreCheckout] = useState(null);
  const isConversationActive = status === "connecting" || status === "connected";
  const shouldShowAssistant = assistantOpen || isConversationActive;

  const handleExitAssistant = async () => {
    try {
      if (status === "connected" || status === "connecting") await endSession();
    } finally {
      onAssistantVisibilityChange(false);
      experience.showWelcome();
    }
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
      <HomePage
        onAssistantVisibilityChange={onAssistantVisibilityChange}
        onConversationError={onConversationError}
      />

      {shouldShowAssistant && (
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
  const [assistantOpen, setAssistantOpen] = useState(false);
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
            assistantOpen={assistantOpen}
            conversationError={conversationError}
            onAssistantVisibilityChange={setAssistantOpen}
            onConversationError={setConversationError}
          />
        </AssistantExperienceProvider>
      </CartProvider>
    </ConversationProvider>
  );
}
