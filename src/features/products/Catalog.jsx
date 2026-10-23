import ProductCard from "../../components/ProductCard/ProductCard";
import "./products.css";

export default function Catalog({ products, isLoading = false }) {
  return (
    <section className="catalog" id="coleccion" aria-labelledby="catalog-title">
      <div className="catalog-heading">
        <div>
          <p className="eyebrow">TODO EL CATÁLOGO</p>
          <h2 id="catalog-title">Elegí a tu ritmo.</h2>
        </div>
        <p>Explorá todos los productos disponibles o pedile al asistente una recomendación.</p>
      </div>
      {isLoading ? (
        <p className="catalog-status">Cargando productos...</p>
      ) : (
        <div className="product-grid">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </section>
  );
}
