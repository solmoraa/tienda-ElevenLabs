import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { getCart } from "../services/cartService";
import { formatPrice } from "../utils/currency";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], sessionId: null });

  const syncCart = useCallback(async (sessionId) => {
    const serverCart = await getCart(sessionId);
    setCart({ items: serverCart.items, sessionId: serverCart.session_id });
    return serverCart;
  }, []);

  const items = useMemo(() => cart.items.map((item) => ({
    quantity: item.quantity,
    product: {
      id: item.product_id,
      name: item.name,
      imageUrl: item.image_url,
      priceValue: item.unit_price,
      price: formatPrice(item.unit_price),
    },
  })), [cart.items]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.product.priceValue * item.quantity, 0),
    [items],
  );

  const value = useMemo(() => ({
    items,
    sessionId: cart.sessionId,
    syncCart,
    total,
  }), [cart.sessionId, items, syncCart, total]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider.");
  return context;
}
