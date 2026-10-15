import { createContext, useContext, useMemo, useReducer, useRef } from "react";
import { featuredProducts } from "../data/products";

const AssistantExperienceContext = createContext(null);

const initialState = {
  cart: [],
  error: "",
  lastAddedProductId: null,
  products: [],
  requestId: 0,
  selectedProductId: null,
  view: "welcome",
};

function experienceReducer(state, action) {
  switch (action.type) {
    case "SEARCH_STARTED":
      return { ...state, error: "", requestId: action.requestId, view: "loading" };
    case "SEARCH_FINISHED":
      // Ignora resultados de una búsqueda anterior que terminaron más tarde.
      if (action.requestId !== state.requestId) return state;
      return { ...state, products: action.products, view: "results" };
    case "PRODUCT_SELECTED":
      return { ...state, selectedProductId: action.productId, view: "details" };
    case "PRODUCT_ADDED": {
      const existingItem = state.cart.find((item) => item.productId === action.productId);
      const cart = existingItem
        ? state.cart.map((item) => item.productId === action.productId
          ? { ...item, quantity: item.quantity + 1 }
          : item)
        : [...state.cart, { productId: action.productId, quantity: 1 }];

      return {
        ...state,
        cart,
        lastAddedProductId: action.productId,
        view: "confirmation",
      };
    }
    case "CART_OPENED":
      return { ...state, view: "cart" };
    case "CHECKOUT_PREPARED":
      return state.cart.length
        ? { ...state, view: "checkout" }
        : { ...state, error: "Todavía no agregaste productos al carrito.", view: "error" };
    case "ERROR_SHOWN":
      return { ...state, error: action.message, view: "error" };
    case "WELCOME_SHOWN":
      return { ...state, error: "", view: "welcome" };
    default:
      return state;
  }
}

export function AssistantExperienceProvider({ children }) {
  const [state, dispatch] = useReducer(experienceReducer, initialState);
  const latestRequestId = useRef(0);

  const value = useMemo(() => {
    const getProduct = (productId) => featuredProducts.find((product) => product.id === productId);

    return {
      ...state,
      cartItems: state.cart.map((item) => ({ ...item, product: getProduct(item.productId) })),
      selectedProduct: getProduct(state.selectedProductId),
      lastAddedProduct: getProduct(state.lastAddedProductId),
      showDemoResults() {
        const requestId = latestRequestId.current + 1;
        latestRequestId.current = requestId;
        dispatch({ type: "SEARCH_STARTED", requestId });

        // Simula una respuesta asíncrona: más adelante vendrá del backend/MCP.
        window.setTimeout(() => {
          dispatch({ type: "SEARCH_FINISHED", products: featuredProducts, requestId });
        }, 650);
      },
      selectProduct(productId) {
        dispatch({ type: "PRODUCT_SELECTED", productId });
      },
      addSelectedProduct() {
        if (state.selectedProductId) {
          dispatch({ type: "PRODUCT_ADDED", productId: state.selectedProductId });
        }
      },
      openCart() {
        dispatch({ type: "CART_OPENED" });
      },
      prepareCheckout() {
        dispatch({ type: "CHECKOUT_PREPARED" });
      },
      showError() {
        dispatch({
          type: "ERROR_SHOWN",
          message: "No pudimos obtener recomendaciones. Este es un estado visual de prueba.",
        });
      },
      showWelcome() {
        dispatch({ type: "WELCOME_SHOWN" });
      },
    };
  }, [state]);

  return (
    <AssistantExperienceContext.Provider value={value}>
      {children}
    </AssistantExperienceContext.Provider>
  );
}

export function useAssistantExperience() {
  const context = useContext(AssistantExperienceContext);

  if (!context) {
    throw new Error("useAssistantExperience debe usarse dentro de AssistantExperienceProvider.");
  }

  return context;
}
