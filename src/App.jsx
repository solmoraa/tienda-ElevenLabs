import { useState } from "react";
import { ConversationProvider, useConversationControls, useConversationStatus } from "@elevenlabs/react";
import AssistantClientTools from "./components/AssistantClientTools";
import AssistantPanel from "./components/AssistantPanel";
import Catalog from "./components/Catalog";
import Header from "./components/Header";
import Hero from "./components/Hero";
import CheckoutView from "./components/CheckoutView";
import { AssistantExperienceProvider, useAssistantExperience } from "./context/AssistantExperienceContext";
import { featuredProducts } from "./data/products";

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

  const handleCheckoutReady = (checkout) => {
    setStoreCheckout(checkout);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      <Header />
      <main id="inicio">
        <Hero
          onConversationError={onConversationError}
        />

        <section className="shopping-experience" aria-label="Tienda y asistente">
          <Catalog products={featuredProducts} />
        </section>

        <section className="how-it-works" id="como-funciona" aria-labelledby="how-it-works-title">
          <p className="eyebrow">UNA NUEVA FORMA DE ELEGIR</p>
          <h2 id="how-it-works-title">Decinos qué necesitás.<br />Nosotros hacemos el resto.</h2>
          <ol>
            <li><span>01</span>Contanos qué estás buscando.</li>
            <li><span>02</span>Recibí opciones a tu medida.</li>
            <li><span>03</span>Elegí tu favorita.</li>
          </ol>
        </section>
      </main>
      <footer className="site-footer">DR Sport · Demo de e-commerce conversacional</footer>

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
      // Algunos errores ocurren durante la sesión, no necesariamente dentro del click del botón.
      onError={(error) => {
        console.error("Error de conversación:", error);
        setConversationError("No pudimos conectar con Aurora. Revisá el permiso del micrófono y la configuración de acceso del agente.");
      }}
    >
      <AssistantExperienceProvider>
        <Storefront
          conversationError={conversationError}
          onConversationError={setConversationError}
        />
      </AssistantExperienceProvider>
    </ConversationProvider>
  );
}
