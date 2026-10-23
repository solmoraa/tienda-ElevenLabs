import "./ProductCard.css";

export default function ProductCard({ product }) {
  return (
    <article className="catalog-product">
      <img
        className="product-image product-photo"
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
        decoding="async"
      />
      <div className="product-copy">
        <p>{product.category}</p>
        <h3>{product.name}</h3>
        <strong>{product.price}</strong>
        <button type="button">Ver producto</button>
      </div>
    </article>
  );
}
