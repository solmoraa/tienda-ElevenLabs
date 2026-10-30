import { useEffect, useState } from "react";
import Catalog from "../products/Catalog";
import Footer from "../layout/Footer";
import Header from "../layout/Header";
import { featuredProducts } from "../../models/products";
import { getCatalogProducts } from "../../services/productsService";
import Hero from "./Hero";
import "./home.css";

export default function HomePage({ onAssistantVisibilityChange, onConversationError }) {
  const [products, setProducts] = useState([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    getCatalogProducts()
      .then((catalogProducts) => {
        if (isActive) setProducts(catalogProducts);
      })
      .catch((error) => {
        console.error("No pudimos cargar el catálogo completo:", error);
        if (isActive) setProducts(featuredProducts);
      })
      .finally(() => {
        if (isActive) setIsCatalogLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <>
      <Header />
      <main id="inicio">
        <Hero
          onAssistantVisibilityChange={onAssistantVisibilityChange}
          onConversationError={onConversationError}
        />

        <section className="shopping-experience" aria-label="Tienda y asistente">
          <Catalog products={products} isLoading={isCatalogLoading} />
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
      <Footer />
    </>
  );
}
