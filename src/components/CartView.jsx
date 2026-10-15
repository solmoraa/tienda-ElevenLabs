function formatPrice(value) {
  return new Intl.NumberFormat("es-AR", {
    currency: "ARS",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);
}

export default function CartView({ items, onCheckout, onContinueShopping }) {
  const total = items.reduce((sum, item) => sum + (item.product.priceValue * item.quantity), 0);

  return (
    <section className="assistant-view" aria-live="polite">
      <p className="assistant-view-kicker">TU CARRITO</p>
      <h3>Tu selección</h3>
      {items.length ? (
        <>
          <ul className="assistant-cart-list">
            {items.map(({ product, quantity }) => (
              <li key={product.id}>
                <span>{product.name} <small>× {quantity}</small></span>
                <strong>{formatPrice(product.priceValue * quantity)}</strong>
              </li>
            ))}
          </ul>
          <p className="cart-total"><span>Total</span><strong>{formatPrice(total)}</strong></p>
          <button className="assistant-primary-action" type="button" onClick={onCheckout}>Preparar checkout</button>
        </>
      ) : (
        <p className="assistant-view-description">Tu carrito está vacío por ahora.</p>
      )}
      <button className="assistant-text-button" type="button" onClick={onContinueShopping}>Seguir viendo productos</button>
    </section>
  );
}
