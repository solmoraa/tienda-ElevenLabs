import { featuredProducts } from "../mockdata/products";
import { formatPrice } from "../utils/currency";
import { apiRequest } from "./apiClient";

export async function getProduct(productId) {
  const product = await apiRequest(`/products/${encodeURIComponent(productId)}`);
  const catalogProduct = featuredProducts.find((item) => item.id === product.id);

  return {
    ...product,
    imageUrl: product.image_url,
    videoUrl: catalogProduct?.videoUrl,
    priceValue: product.price,
    price: formatPrice(product.price),
  };
}

export function getProducts(productIds) {
  return Promise.all(productIds.map(getProduct));
}
