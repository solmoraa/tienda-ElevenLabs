import { createContext, useContext, useMemo, useReducer } from "react";
import { flushSync } from "react-dom";
import { featuredProducts } from "../data/products";

const API_URL = "http://127.0.0.1:8000/api/v1";
const AssistantExperienceContext = createContext(null);

function formatPrice(value) {
  return `ARS ${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 0 }).format(value)}`;
}

function toPanelProduct(product) {
  const catalogProduct = featuredProducts.find((item) => item.id === product.id);
  return {
    ...product,
    imageUrl: product.image_url,
    videoUrl: catalogProduct?.videoUrl,
    priceValue: product.price,
    price: formatPrice(product.price),
  };
}

const initialState = { cart: [], checkout: null, error: "", products: [], requestId: 0, selectedProductId: null, view: "welcome" };

function transitionDispatch(dispatch, action) {
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

  if (!document.startViewTransition || reduceMotion) {
    dispatch(action);
    return Promise.resolve();
  }

  const transition = document.startViewTransition(() => {
    flushSync(() => dispatch(action));
  });

  return transition.updateCallbackDone;
}

function experienceReducer(state, action) {
  switch (action.type) {
    case "SEARCH_STARTED": return { ...state, error: "", requestId: action.requestId, view: "loading" };
    case "SEARCH_FINISHED": return action.requestId !== state.requestId ? state : { ...state, products: action.products, view: "results" };
    case "PRODUCT_DETAIL_SHOWN": return { ...state, products: action.products, selectedProductId: action.productId, view: "details" };
    case "PRODUCT_SELECTED": return { ...state, selectedProductId: action.productId, view: "details" };
    case "CART_SYNCED": return { ...state, cart: action.items, view: "cart" };
    case "CHECKOUT_SHOWN": return { ...state, checkout: action.checkout, view: "checkout" };
    case "ERROR_SHOWN": return { ...state, error: action.message, view: "error" };
    case "WELCOME_SHOWN": return { ...state, error: "", view: "welcome" };
    default: return state;
  }
}

async function fetchProduct(productId) {
  const response = await fetch(`${API_URL}/products/${encodeURIComponent(productId)}`);
  if (!response.ok) throw new Error("No se pudo cargar el producto.");
  return toPanelProduct(await response.json());
}

export function AssistantExperienceProvider({ children }) {
  const [state, dispatch] = useReducer(experienceReducer, initialState);

  const value = useMemo(() => ({
    ...state,
    cartItems: state.cart.map((item) => ({
      quantity: item.quantity,
      product: { id: item.product_id, name: item.name, imageUrl: item.image_url, priceValue: item.unit_price, price: formatPrice(item.unit_price) },
    })),
    selectedProduct: state.products.find((product) => product.id === state.selectedProductId),
    selectProduct(productId) { transitionDispatch(dispatch, { type: "PRODUCT_SELECTED", productId }); },
    async showProducts(productIds) {
      const requestId = state.requestId + 1;
      await transitionDispatch(dispatch, { type: "SEARCH_STARTED", requestId });
      const products = await Promise.all(productIds.map(fetchProduct));
      await transitionDispatch(dispatch, { type: "SEARCH_FINISHED", products, requestId });
    },
    async showProductDetail(productId) {
      const product = await fetchProduct(productId);
      const products = [...state.products.filter((item) => item.id !== product.id), product];
      await transitionDispatch(dispatch, { type: "PRODUCT_DETAIL_SHOWN", products, productId });
    },
    async showCart(sessionId) {
      const response = await fetch(`${API_URL}/carts/${encodeURIComponent(sessionId)}`);
      if (!response.ok) throw new Error("No se pudo cargar el carrito.");
      const cart = await response.json();
      await transitionDispatch(dispatch, { type: "CART_SYNCED", items: cart.items });
    },
    async showCheckout(checkoutId) {
      const response = await fetch(`${API_URL}/checkouts/${encodeURIComponent(checkoutId)}`);
      if (!response.ok) throw new Error("No se pudo cargar el checkout.");
      await transitionDispatch(dispatch, { type: "CHECKOUT_SHOWN", checkout: await response.json() });
    },
    showError(message) { transitionDispatch(dispatch, { type: "ERROR_SHOWN", message }); },
    showWelcome() { transitionDispatch(dispatch, { type: "WELCOME_SHOWN" }); },
  }), [state]);

  return <AssistantExperienceContext.Provider value={value}>{children}</AssistantExperienceContext.Provider>;
}

export function useAssistantExperience() {
  const context = useContext(AssistantExperienceContext);
  if (!context) throw new Error("useAssistantExperience debe usarse dentro de AssistantExperienceProvider.");
  return context;
}
