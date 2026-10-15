export default function AssistantProductCard({ product, onSelect }) {
  return (
    <article className="assistant-product-card">
      <div className={`assistant-product-image product-image--${product.accent}`} aria-hidden="true">
        {product.icon}
      </div>
      <div>
        <p>{product.category}</p>
        <h3>{product.name}</h3>
        <strong>{product.price}</strong>
      </div>
      <button type="button" onClick={() => onSelect(product.id)}>Ver detalle</button>
    </article>
  );
}
