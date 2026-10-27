import { useState } from "react";
import { formatPrice } from "../../utils/currency";
import "./checkout.css";

export default function CheckoutView({ checkout, onBack, standalone = false }) {
  const [paymentSimulated, setPaymentSimulated] = useState(false);

  if (!checkout) return null;

  const handleSubmit = (event) => {
    event.preventDefault();
    setPaymentSimulated(true);
  };

  return (
    <main className={`checkout-page ${standalone ? "checkout-page--standalone" : ""}`} aria-live="polite">
      <header className="checkout-page-header"><span className="brand"><span className="brand-mark">DR</span>DR Sport</span><span>Pago seguro · Demo</span></header>
      <div className="checkout-page-layout">
        <section className="checkout-page-form">
          <p className="assistant-view-kicker">CHECKOUT DE DEMOSTRACIÓN</p>
          <h3>Tu compra está lista.</h3>
          <p className="assistant-view-description">
            Verificamos tu carrito en el servidor. Esta pantalla no procesa pagos ni solicita datos de tarjeta.
          </p>
          <form className="checkout-demo-form" onSubmit={handleSubmit} autoComplete="off">
            <p className="checkout-demo-warning">Demo visual: no ingreses datos personales o bancarios reales. Este formulario no envía ni guarda información.</p>
            <div className="checkout-form-grid">
              <label>Nombre<input type="text" placeholder="Nombre de prueba" /></label>
              <label>Apellido<input type="text" placeholder="Apellido de prueba" /></label>
              <label className="checkout-field-full">Email<input type="email" placeholder="demo@ejemplo.com" /></label>
              <label className="checkout-field-full">Número de tarjeta<input type="text" inputMode="numeric" placeholder="0000 0000 0000 0000" /></label>
              <label>Vencimiento<input type="text" inputMode="numeric" placeholder="MM/AA" /></label>
              <label>CVV<input type="text" inputMode="numeric" placeholder="123" /></label>
            </div>
            <button className="assistant-primary-action" type="submit">Pagar {formatPrice(checkout.total)}</button>
          </form>
          {paymentSimulated && <p className="checkout-simulated-success" role="status">Pago simulado confirmado. No se realizó ningún cobro.</p>}
          <button className="assistant-text-button" type="button" onClick={onBack}>Volver a la tienda</button>
        </section>
        <aside className="checkout-page-summary"><h3>Resumen del pedido</h3><ul className="assistant-cart-list">
          {checkout.items.map((item) => (
            <li key={item.product_id}>
              <span>{item.name} <small>× {item.quantity}</small></span>
              <strong>{formatPrice(item.line_total)}</strong>
            </li>
          ))}
        </ul>
        <p className="cart-total"><span>Total validado</span><strong>{formatPrice(checkout.total)}</strong></p>
        <p className="checkout-demo-notice">Sesión demo: {checkout.checkout_id}</p>
        </aside>
      </div>
    </main>
  );
}
