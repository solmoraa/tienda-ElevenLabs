import { createContext, useCallback, useContext, useMemo, useReducer, useRef } from "react";
import { flushSync } from "react-dom";
import { getCheckout } from "../services/checkoutService";
import { getProduct, getProducts } from "../services/productsService";
import { useCart } from "./CartContext";

const AssistantExperienceContext = createContext(null);
const initialState = { checkout: null, error: "", products: [], requestId: 0, selectedColor: null, selectedProductId: null, selectedSize: null, view: "welcome" };

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
    case "PRODUCT_DETAIL_SHOWN": return { ...state, products: [...state.products.filter((item) => item.id !== action.product.id), action.product], selectedColor: action.color ?? action.product.colors?.[0] ?? null, selectedProductId: action.product.id, selectedSize: action.size ?? action.product.sizes?.[0] ?? null, view: "details" };
    case "PRODUCT_SELECTED": {
      const product = state.products.find((item) => item.id === action.productId);
      return { ...state, selectedColor: product?.colors?.[0] ?? null, selectedProductId: action.productId, selectedSize: product?.sizes?.[0] ?? null, view: "details" };
    }
    case "PRODUCT_VARIANT_SELECTED": return { ...state, selectedColor: action.color ?? state.selectedColor, selectedSize: action.size ?? state.selectedSize };
    case "CART_SHOWN": return { ...state, view: "cart" };
    case "CHECKOUT_SHOWN": return { ...state, checkout: action.checkout, view: "checkout" };
    case "ERROR_SHOWN": return { ...state, error: action.message, view: "error" };
    case "WELCOME_SHOWN": return { ...state, error: "", view: "welcome" };
    default: return state;
  }
}

export function AssistantExperienceProvider({ children }) {
  const [state, dispatch] = useReducer(experienceReducer, initialState);
  const nextRequestId = useRef(0);
  const { syncCart } = useCart();

  const selectProduct = useCallback((productId) => (
    transitionDispatch(dispatch, { type: "PRODUCT_SELECTED", productId })
  ), []);

  const showProducts = useCallback(async (productIds) => {
    const requestId = ++nextRequestId.current;
    await transitionDispatch(dispatch, { type: "SEARCH_STARTED", requestId });
    const products = await getProducts(productIds);
    await transitionDispatch(dispatch, { type: "SEARCH_FINISHED", products, requestId });
  }, []);

  const showProductDetail = useCallback(async (productId) => {
    const product = await getProduct(productId);
    await transitionDispatch(dispatch, { type: "PRODUCT_DETAIL_SHOWN", product });
  }, []);

  const showCart = useCallback(async (sessionId) => {
    const cart = await syncCart(sessionId);
    await transitionDispatch(dispatch, { type: "CART_SHOWN" });
    return cart;
  }, [syncCart]);

  const selectProductVariant = useCallback(async (productId, { color, size } = {}) => {
    let product = state.products.find((item) => item.id === productId);
    if (!product) product = await getProduct(productId);
    const canonicalColor = color
      ? product.colors?.find((item) => item.localeCompare(color, "es", { sensitivity: "base" }) === 0)
      : undefined;
    if (color && !canonicalColor) throw new Error(`Color no disponible para ${product.name}.`);
    if (state.selectedProductId !== productId) {
      await transitionDispatch(dispatch, { type: "PRODUCT_DETAIL_SHOWN", product, color: canonicalColor, size });
    } else {
      await transitionDispatch(dispatch, { type: "PRODUCT_VARIANT_SELECTED", color: canonicalColor, size });
    }
    return { product, color: canonicalColor ?? state.selectedColor };
  }, [state.products, state.selectedColor, state.selectedProductId]);

  const showCheckout = useCallback(async (checkoutId) => {
    const checkout = await getCheckout(checkoutId);
    await transitionDispatch(dispatch, { type: "CHECKOUT_SHOWN", checkout });
  }, []);

  const showError = useCallback((message) => (
    transitionDispatch(dispatch, { type: "ERROR_SHOWN", message })
  ), []);

  const showWelcome = useCallback(() => (
    transitionDispatch(dispatch, { type: "WELCOME_SHOWN" })
  ), []);

  const selectedProduct = useMemo(
    () => state.products.find((product) => product.id === state.selectedProductId),
    [state.products, state.selectedProductId],
  );

  const value = useMemo(() => ({
    ...state,
    selectedProduct,
    selectProduct,
    selectProductVariant,
    showCart,
    showCheckout,
    showError,
    showProductDetail,
    showProducts,
    showWelcome,
  }), [selectProduct, selectProductVariant, selectedProduct, showCart, showCheckout, showError, showProductDetail, showProducts, showWelcome, state]);

  return <AssistantExperienceContext.Provider value={value}>{children}</AssistantExperienceContext.Provider>;
}

export function useAssistantExperience() {
  const context = useContext(AssistantExperienceContext);
  if (!context) throw new Error("useAssistantExperience debe usarse dentro de AssistantExperienceProvider.");
  return context;
}
