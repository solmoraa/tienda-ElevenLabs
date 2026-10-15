export default function ProductDetails({ product, onAddToCart, onBack }) {
  if (!product) return null;

  return (
    <section className="assistant-view" aria-live="polite">
      <p className="assistant-view-kicker">DETALLE DEL PRODUCTO</p>
      <div className={`assistant-detail-image product-image--${product.accent}`} aria-hidden="true">{product.icon}</div>
      <p className="product-category">{product.category}</p>
      <h3>{product.name}</h3>
      <strong className="detail-price">{product.price}</strong>
      <p className="assistant-view-description">{product.description}</p>
      <p className="product-stock">Stock disponible: {product.stock} pares</p>
      <button className="assistant-primary-action" type="button" onClick={onAddToCart}>Agregar al carrito</button>
      <button className="assistant-text-button" type="button" onClick={onBack}>Ver otras opciones</button>
    </section>
  );
}
