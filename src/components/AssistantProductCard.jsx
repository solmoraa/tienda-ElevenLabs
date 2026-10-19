import AssistantProductMedia from "./AssistantProductMedia";

export default function AssistantProductCard({ product, onSelect }) {
  return (
    <article className="assistant-product-card">
      <AssistantProductMedia product={product} className="assistant-product-image" decorative />
      <div>
        <p>{product.category}</p>
        <h3>{product.name}</h3>
        <strong>{product.price}</strong>
      </div>
      <button type="button" onClick={() => onSelect(product.id)}>Ver detalle</button>
    </article>
  );
}
