export default function AssistantProductCard({ product, onSelect }) {
  return (
    <article className="assistant-product-card">
      <img className="assistant-product-image product-photo" src={product.imageUrl} alt="" />
      <div>
        <p>{product.category}</p>
        <h3>{product.name}</h3>
        <strong>{product.price}</strong>
      </div>
      <button type="button" onClick={() => onSelect(product.id)}>Ver detalle</button>
    </article>
  );
}
