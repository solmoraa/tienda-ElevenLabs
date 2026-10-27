from collections import defaultdict
from threading import RLock


CartKey = tuple[str, str, str]


class CartRepository:
    """Persistencia en memoria de carritos, separada por producto, color y talle."""

    def __init__(self) -> None:
        self._carts: dict[str, dict[CartKey, int]] = defaultdict(dict)
        self._last_added: dict[str, CartKey] = {}
        self._lock = RLock()

    def get_state(self, session_id: str) -> tuple[dict[CartKey, int], CartKey | None]:
        with self._lock:
            return self._carts[session_id].copy(), self._last_added.get(session_id)

    def try_add(self, session_id: str, key: CartKey, quantity: int, stock: int) -> bool:
        with self._lock:
            cart = self._carts[session_id]
            current_quantity = cart.get(key, 0)
            product_quantity = sum(value for cart_key, value in cart.items() if cart_key[0] == key[0])
            if quantity > stock - product_quantity:
                return False
            cart[key] = current_quantity + quantity
            self._last_added[session_id] = key
            return True

    def remove(self, session_id: str, product_id: str, quantity: int) -> bool:
        with self._lock:
            cart = self._carts.get(session_id)
            if not cart:
                return False
            key = next((cart_key for cart_key in cart if cart_key[0] == product_id), None)
            if key is None:
                return False
            remaining = cart[key] - quantity
            if remaining > 0:
                cart[key] = remaining
            else:
                del cart[key]
            if self._last_added.get(session_id) == key:
                self._last_added.pop(session_id, None)
            return True

    def reset(self) -> None:
        with self._lock:
            self._carts.clear()
            self._last_added.clear()


cart_repository = CartRepository()
