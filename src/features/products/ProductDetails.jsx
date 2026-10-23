import ProductMedia from "../../components/ProductMedia/ProductMedia";
import "./products.css";

export default function ProductDetails({ product, selectedColor, selectedSize, onAddToCart, onBack, onVariantChange }) {
  if (!product) return null;

  const stockLabel = product.stock === 1
    ? "1 par disponible"
    : `${product.stock} pares disponibles`;
  const activeColor = product.colorOptions?.find((option) => option.name === selectedColor) ?? product.colorOptions?.[0];
  const isDefaultColor = activeColor?.name === product.colorOptions?.[0]?.name;

  return (
    <section className="assistant-view" aria-live="polite">
      <div className="assistant-detail-layout">
        <div className="assistant-detail-media">
          <ProductMedia
            key={`${product.id}:${activeColor?.name}`}
            product={product}
            className="assistant-detail-image"
            imageUrl={activeColor?.image_url ?? product.imageUrl}
            videoUrl={isDefaultColor ? product.videoUrl : null}
          />
          {product.colorOptions?.length > 1 && (
            <div className="detail-thumbnails" aria-label="Colores disponibles">
              {product.colorOptions.map((option) => (
                <button
                  className={option.name === activeColor?.name ? "is-selected" : ""}
                  key={option.name}
                  type="button"
                  onClick={() => onVariantChange({ color: option.name })}
                  aria-label={`Ver color ${option.name}`}
                  aria-pressed={option.name === activeColor?.name}
                >
                  <img src={option.image_url} alt="" />
                  <span>{option.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="assistant-detail-copy">
          <p className="assistant-view-kicker">{product.category}</p>
          <h3>{product.name}</h3>
          <strong className="detail-price">{product.price}</strong>
          <div className="detail-selection">
            <span>Color</span>
            <strong>{activeColor?.name}</strong>
          </div>
          <div className="detail-size-picker" aria-label="Elegir talle">
            <span>Talle</span>
            <div>{product.sizes?.map((size) => (
              <button
                className={size === selectedSize ? "is-selected" : ""}
                key={size}
                type="button"
                onClick={() => onVariantChange({ size })}
                aria-pressed={size === selectedSize}
              >{size}</button>
            ))}</div>
          </div>
          <p className="assistant-view-description">{product.description}</p>
          <p className="product-stock">{stockLabel}</p>
          <button
            className="assistant-primary-action"
            type="button"
            disabled={!activeColor?.name || !selectedSize}
            onClick={() => onAddToCart(product, { color: activeColor.name, size: selectedSize })}
          >{selectedSize ? "Agregar al carrito" : "Elegí un talle"}</button>
          <button className="assistant-text-button" type="button" onClick={onBack}>Volver a resultados</button>
        </div>
      </div>
    </section>
  );
}
