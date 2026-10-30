import ProductMedia from "../ProductMedia/ProductMedia";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  return (
    <article className="catalog-product">
      <ProductMedia product={product} className="product-image" />
      <div className="product-copy">
        <p>{product.category}</p>
        <h3>{product.name}</h3>
        <strong>{product.price}</strong>
        <button type="button">Ver producto</button>
      </div>
    </article>
  );
}
