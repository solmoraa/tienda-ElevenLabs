import { formatPrice } from "../../utils/currency";
import "./cart.css";

export default function CartView({ items, total, onCheckout, onContinueShopping }) {
  return (
    <section className="assistant-view" aria-live="polite">
      <p className="assistant-view-kicker">TU CARRITO</p>
      <h3>Tu selección</h3>
      {items.length ? (
        <>
          <ul className="assistant-cart-list">
            {items.map(({ product, quantity }) => (
              <li key={product.id}>
                <img src={product.imageUrl} alt="" />
                <span><strong>{product.name}</strong><small>{product.category || "DR Sport"} · Cantidad {quantity}</small></span>
                <strong>{formatPrice(product.priceValue * quantity)}</strong>
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
