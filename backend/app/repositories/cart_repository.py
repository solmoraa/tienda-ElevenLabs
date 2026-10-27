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

    def remove(self, session_id: str, key: CartKey, quantity: int) -> bool:
        with self._lock:
            cart = self._carts.get(session_id)
            if not cart or key not in cart:
                return False
            remaining = cart[key] - quantity
            if remaining > 0:
                cart[key] = remaining
            else:
                del cart[key]
            if self._last_added.get(session_id) == key:
                self._last_added.pop(session_id, None)
            return True

    def replace_variant(self, session_id: str, source: CartKey, target: CartKey, stock: int) -> str:
        with self._lock:
            cart = self._carts.get(session_id)
            if not cart or source not in cart:
                return "not_found"

            quantity = cart[source]
            if source == target:
                return "updated"

            product_quantity_without_source = sum(
                value for key, value in cart.items() if key[0] == source[0] and key != source
            )
            if product_quantity_without_source + quantity > stock:
                return "insufficient_stock"

            del cart[source]
            cart[target] = cart.get(target, 0) + quantity
            if self._last_added.get(session_id) == source:
                self._last_added[session_id] = target
            return "updated"

    def reset(self) -> None:
        with self._lock:
            self._carts.clear()
            self._last_added.clear()


cart_repository = CartRepository()
