import { apiRequest } from "./apiClient";

export function getCart(sessionId) {
  return apiRequest(`/carts/${encodeURIComponent(sessionId)}`);
}

export function addCartItem(sessionId, { productId, color, size, quantity = 1 }) {
  return apiRequest(`/carts/${encodeURIComponent(sessionId)}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product_id: productId, color, size, quantity }),
  });
}

export function removeCartItem(sessionId, productId, { color, size, quantity }) {
  const query = new URLSearchParams({ color, size, quantity: String(quantity) });
  return apiRequest(
    `/carts/${encodeURIComponent(sessionId)}/items/${encodeURIComponent(productId)}?${query}`,
    { method: "DELETE" },
  );
}

export function updateCartItem(sessionId, productId, payload) {
  return apiRequest(`/carts/${encodeURIComponent(sessionId)}/items/${encodeURIComponent(productId)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
