import { formatPrice } from "../../utils/currency";
import "./cart.css";

export default function CartView({ items, recommendation, total, onCheckout, onContinueShopping, onDecreaseItem, onIncreaseItem, onRemoveItem, onViewRecommendation }) {
  return (
    <section className="assistant-view" aria-live="polite">
      <p className="assistant-view-kicker">TU CARRITO</p>
      <h3>Tu selección</h3>
      {items.length ? (
        <>
          {recommendation && (
            <button className="cart-recommendation" type="button" onClick={onViewRecommendation}>
              <span className="cart-recommendation-badge">COMPLETÁ TU COMPRA</span>
              <img src={recommendation.imageUrl} alt="" />
              <span><strong>{recommendation.name}</strong><small>{recommendation.suggested_color ? `${recommendation.suggested_color} · ` : ""}{recommendation.price} · Ver detalle</small></span>
            </button>
          )}
          <ul className="assistant-cart-list">
            {items.map(({ product, quantity }) => (
              <li key={`${product.id}:${product.selectedColor}:${product.selectedSize}`}>
                <img src={product.imageUrl} alt="" />
                <span><strong>{product.name}</strong><small>Color {product.selectedColor} · Talle {product.selectedSize} · Cantidad {quantity}</small></span>
                <div className="cart-line-actions">
                  <strong>{formatPrice(product.priceValue * quantity)}</strong>
                  <div className="cart-quantity-control" aria-label={`Cantidad de ${product.name}`}>
                    <button type="button" onClick={() => onDecreaseItem({ product, quantity })} aria-label={`Quitar una unidad de ${product.name}`}>−</button>
                    <output aria-label={`${quantity} unidades`}>{quantity}</output>
                    <button type="button" onClick={() => onIncreaseItem({ product, quantity })} aria-label={`Agregar una unidad de ${product.name}`}>+</button>
                  </div>
                  <button type="button" onClick={() => onRemoveItem({ product, quantity })}>Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
          <p className="cart-total"><span>Total</span><strong>{formatPrice(total)}</strong></p>
          <button className="assistant-primary-action" type="button" onClick={onCheckout}>Finalizar compra</button>
        </>
      ) : (
        <p className="assistant-view-description">Tu carrito está vacío por ahora.</p>
      )}
      <button className="assistant-text-button" type="button" onClick={onContinueShopping}>Seguir viendo productos</button>
    </section>
  );
}
