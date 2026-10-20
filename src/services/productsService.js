import { featuredProducts } from "../mockdata/products";
import { formatPrice } from "../utils/currency";
import { apiRequest } from "./apiClient";

export async function getProduct(productId) {
  const encodedProductId = encodeURIComponent(productId);
  const [product, stock] = await Promise.all([
    apiRequest(`/products/${encodedProductId}`),
    apiRequest(`/products/${encodedProductId}/stock`),
  ]);
  const catalogProduct = featuredProducts.find((item) => item.id === product.id);

  return {
    ...product,
    stock: stock.available,
    imageUrl: product.image_url,
    videoUrl: catalogProduct?.videoUrl,
    priceValue: product.price,
    price: formatPrice(product.price),
  };
}

export function getProducts(productIds) {
  return Promise.all(productIds.map(getProduct));
}
