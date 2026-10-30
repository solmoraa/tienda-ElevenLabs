import { useCallback, useRef, useState } from "react";
import { ConversationProvider, useConversationControls, useConversationStatus } from "@elevenlabs/react";
import AssistantClientTools from "./controllers/assistant/AssistantClientTools";
import { AssistantExperienceProvider, useAssistantExperience } from "./controllers/context/AssistantExperienceContext";
import { CartProvider } from "./controllers/context/CartContext";
import AssistantPanel from "./views/assistant/AssistantPanel";
import CheckoutView from "./views/checkout/CheckoutView";
import HomePage from "./views/home/HomePage";

function Storefront({ assistantOpen, conversationError, conversationMessages, onAssistantVisibilityChange, onConversationError }) {
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
        <AssistantClientTools onAssistantVisibilityChange={onAssistantVisibilityChange} />
        <CheckoutView checkout={storeCheckout} standalone onBack={() => { setStoreCheckout(null); experience.showWelcome(); }} />
      </>
    );
  }

  return (
    <>
      <AssistantClientTools onAssistantVisibilityChange={onAssistantVisibilityChange} />
      <HomePage
        onAssistantVisibilityChange={onAssistantVisibilityChange}
        onConversationError={onConversationError}
      />

      {shouldShowAssistant && (
        <AssistantPanel
          conversationMessages={conversationMessages}
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
  const [conversationMessages, setConversationMessages] = useState([]);
  const messageSequenceRef = useRef(0);

  const resetConversationMessages = useCallback(() => {
    messageSequenceRef.current = 0;
    setConversationMessages([]);
  }, []);

  const handleMessage = useCallback((message) => {
    const content = message?.message?.trim();
    if (!content) return;

    const role = message.source === "user" ? "user" : "assistant";

    setConversationMessages((current) => {
      const lastMessage = current.at(-1);
      const isTranscriptUpdate = lastMessage
        && lastMessage.role === role
        && (content === lastMessage.content || content.startsWith(lastMessage.content) || lastMessage.content.startsWith(content));

      if (isTranscriptUpdate) {
        if (content === lastMessage.content) return current;
        return [...current.slice(0, -1), { ...lastMessage, content }];
      }

      messageSequenceRef.current += 1;
      return [...current, { id: `${role}-${messageSequenceRef.current}`, role, content }];
    });
  }, []);

  return (
    // El Provider habilita los hooks oficiales del SDK en todos sus componentes hijos.
    <ConversationProvider
      serverLocation="global"
      // El estado de la sesión llega directamente desde el SDK. Esto evita
      // depender sólo del callback del botón en navegadores móviles.
      onStatusChange={({ status }) => {
        setAssistantOpen(status === "connecting" || status === "connected");
      }}
      // El SDK entrega transcripciones parciales y finales mediante onMessage.
      // Los fragmentos del mismo turno se actualizan sin duplicarse en pantalla.
      onMessage={handleMessage}
      onConnect={resetConversationMessages}
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
            conversationMessages={conversationMessages}
            onAssistantVisibilityChange={setAssistantOpen}
            onConversationError={setConversationError}
          />
        </AssistantExperienceProvider>
      </CartProvider>
    </ConversationProvider>
  );
}
