import { apiRequest } from "./apiClient";

export function getCart(sessionId) {
  return apiRequest(`/carts/${encodeURIComponent(sessionId)}`);
}
