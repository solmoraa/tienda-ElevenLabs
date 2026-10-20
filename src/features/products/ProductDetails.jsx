import ProductMedia from "../../components/ProductMedia/ProductMedia";
import "./products.css";

export default function ProductDetails({ product, onAddToCart, onBack }) {
  if (!product) return null;

  const stockLabel = product.stock === 1
    ? "1 par disponible"
    : `${product.stock} pares disponibles`;

  return (
    <section className="assistant-view" aria-live="polite">
      <div className="assistant-detail-layout">
        <div className="assistant-detail-media"><ProductMedia product={product} className="assistant-detail-image" /></div>
        <div className="assistant-detail-copy">
          <p className="assistant-view-kicker">{product.category}</p>
          <h3>{product.name}</h3>
          <strong className="detail-price">{product.price}</strong>
          <div className="detail-option"><span>Color</span><strong>{product.colors?.join(" / ")}</strong></div>
          <div className="detail-option"><span>Talles</span><strong>{product.variants?.join(" / ")}</strong></div>
          <p className="assistant-view-description">{product.description}</p>
          <p className="product-stock">{stockLabel}</p>
          <button className="assistant-primary-action" type="button" onClick={() => onAddToCart(product)}>Agregar al carrito</button>
          <button className="assistant-text-button" type="button" onClick={onBack}>Volver a resultados</button>
        </div>
      </div>
    </section>
  );
}
