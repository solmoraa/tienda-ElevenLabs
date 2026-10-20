import { apiRequest } from "./apiClient";

export function getCheckout(checkoutId) {
  return apiRequest(`/checkouts/${encodeURIComponent(checkoutId)}`);
}
