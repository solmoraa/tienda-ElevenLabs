import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { addCartItem, getCart, removeCartItem, updateCartItem } from "../../services/cartService";
import { formatPrice } from "../../utils/currency";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [], recommendation: null, sessionId: null });

  const syncCart = useCallback(async (sessionId) => {
    const serverCart = await getCart(sessionId);
    setCart({ items: serverCart.items, recommendation: serverCart.recommendation, sessionId: serverCart.session_id });
    return serverCart;
  }, []);

  const applyServerCart = useCallback((serverCart) => {
    setCart({ items: serverCart.items, recommendation: serverCart.recommendation, sessionId: serverCart.session_id });
    return serverCart;
  }, []);

  const addItem = useCallback(async ({ productId, color, size, quantity = 1 }) => {
    if (!cart.sessionId) throw new Error("No hay un carrito activo para modificar.");
    const serverCart = await addCartItem(cart.sessionId, { productId, color, size, quantity });
    return applyServerCart(serverCart);
  }, [applyServerCart, cart.sessionId]);

  const removeItem = useCallback(async ({ productId, color, size, quantity }) => {
    if (!cart.sessionId) throw new Error("No hay un carrito activo para modificar.");
    const serverCart = await removeCartItem(cart.sessionId, productId, { color, size, quantity });
    return applyServerCart(serverCart);
  }, [applyServerCart, cart.sessionId]);

  const updateItem = useCallback(async ({ productId, currentColor, currentSize, color, size }) => {
    if (!cart.sessionId) throw new Error("No hay un carrito activo para modificar.");
    const serverCart = await updateCartItem(cart.sessionId, productId, {
      current_color: currentColor,
      current_size: currentSize,
      ...(color ? { color } : {}),
      ...(size ? { size } : {}),
    });
    return applyServerCart(serverCart);
  }, [applyServerCart, cart.sessionId]);

  const items = useMemo(() => cart.items.map((item) => ({
    quantity: item.quantity,
    product: {
      id: item.product_id,
      name: item.name,
      imageUrl: item.image_url,
      priceValue: item.unit_price,
      price: formatPrice(item.unit_price),
      selectedColor: item.selected_color,
      selectedSize: item.selected_size,
    },
  })), [cart.items]);

  const recommendation = useMemo(() => cart.recommendation && ({
    ...cart.recommendation,
    imageUrl: cart.recommendation.image_url,
    priceValue: cart.recommendation.price,
    price: formatPrice(cart.recommendation.price),
  }), [cart.recommendation]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.product.priceValue * item.quantity, 0),
    [items],
  );

  const value = useMemo(() => ({
    addItem,
    items,
    recommendation,
    removeItem,
    sessionId: cart.sessionId,
    syncCart,
    total,
    updateItem,
  }), [addItem, cart.sessionId, items, recommendation, removeItem, syncCart, total, updateItem]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart debe usarse dentro de CartProvider.");
  return context;
}
