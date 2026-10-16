export default function ProductDetails({ product, onAddToCart, onBack }) {
  if (!product) return null;

  return (
    <section className="assistant-view" aria-live="polite">
      <p className="assistant-view-kicker">DETALLE DEL PRODUCTO</p>
      <img className="assistant-detail-image product-photo" src={product.imageUrl} alt={product.name} />
      <p className="product-category">{product.category}</p>
      <h3>{product.name}</h3>
      <strong className="detail-price">{product.price}</strong>
      <p className="assistant-view-description">{product.description}</p>
      <p className="product-variants"><strong>Colores:</strong> {product.colors?.join(" · ")}<br /><strong>Variantes:</strong> {product.variants?.join(" · ")}</p>
      <p className="product-stock">Stock disponible: {product.stock} pares</p>
      <p className="assistant-view-description">Podés pedirle a Aurora que confirme la disponibilidad o usar el botón para solicitárselo.</p>
      <button className="assistant-primary-action" type="button" onClick={() => onAddToCart(product)}>Agregar al carrito</button>
      <button className="assistant-text-button" type="button" onClick={onBack}>Ver otras opciones</button>
    </section>
  );
}
