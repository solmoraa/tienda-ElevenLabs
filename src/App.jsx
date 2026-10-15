import { useState } from "react";
import { ConversationProvider } from "@elevenlabs/react";
import AssistantPanel from "./components/AssistantPanel";
import Catalog from "./components/Catalog";
import Header from "./components/Header";
import Hero from "./components/Hero";
import { AssistantExperienceProvider } from "./context/AssistantExperienceContext";
import { featuredProducts } from "./data/products";

function Storefront({ conversationError, onConversationError }) {
  const [isAssistantPanelVisible, setIsAssistantPanelVisible] = useState(true);

  return (
    <>
      <Header />
      <main id="inicio">
        <Hero
          onConversationError={onConversationError}
          onShowAssistantPanel={() => setIsAssistantPanelVisible(true)}
        />

        <section className="shopping-experience" aria-label="Tienda y asistente">
          <Catalog products={featuredProducts} />

          {isAssistantPanelVisible ? (
            <AssistantPanel
              errorMessage={conversationError}
              onClose={() => setIsAssistantPanelVisible(false)}
            />
          ) : (
            <button
              className="show-assistant-panel"
              type="button"
              onClick={() => setIsAssistantPanelVisible(true)}
            >
              <span aria-hidden="true">✦</span>
              Mostrar panel del asistente
            </button>
          )}
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
      <footer className="site-footer">Rynx · Demo de e-commerce conversacional</footer>
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
