import { formatPrice } from "../utils/currency";
import { apiRequest } from "./apiClient";

const productVideos = {
  "run-aero-celeste": "/videos/running-celeste.mp4",
  "futbol-strike-verde": "/videos/botin-strike-negro.mp4",
};

function normalizeProduct(product) {
  return {
    ...product,
    colorOptions: product.color_options ?? [],
    imageUrl: product.image_url,
    priceValue: product.price,
    price: formatPrice(product.price),
    videoUrl: productVideos[product.id],
  };
}

export async function getProduct(productId) {
  const product = await apiRequest(`/products/${encodeURIComponent(productId)}`);
  return normalizeProduct(product);
}

export async function getProducts(productIds) {
  const ids = [...new Set(productIds)].filter(Boolean);
  if (!ids.length) return [];
  const products = await apiRequest(`/products/batch?ids=${encodeURIComponent(ids.join(","))}`);
  return products.map(normalizeProduct);
}
