import ProductCard from "../../components/ProductCard/ProductCard";
import "./products.css";

export default function Catalog({ products }) {
  return (
    <section className="catalog" id="coleccion" aria-labelledby="catalog-title">
      <div className="catalog-heading">
        <div>
          <p className="eyebrow">COLECCIÓN DESTACADA</p>
          <h2 id="catalog-title">Elegí a tu ritmo.</h2>
        </div>
        <p>Este catálogo sigue siendo independiente de las recomendaciones del asistente.</p>
      </div>
      <div className="product-grid">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
