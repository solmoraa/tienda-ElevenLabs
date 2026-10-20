import Catalog from "../products/Catalog";
import Footer from "../layout/Footer";
import Header from "../layout/Header";
import { featuredProducts } from "../../mockdata/products";
import Hero from "./Hero";
import "./home.css";

export default function HomePage({ onConversationError }) {
  return (
    <>
      <Header />
      <main id="inicio">
        <Hero onConversationError={onConversationError} />

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
      <Footer />
    </>
  );
}
