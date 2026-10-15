from collections import defaultdict
from threading import RLock


class CartRepository:
    """Persistencia en memoria de carritos por sesión."""

    def __init__(self) -> None:
        self._carts: dict[str, dict[str, int]] = defaultdict(dict)
        self._lock = RLock()

    def get_quantities(self, session_id: str) -> dict[str, int]:
        with self._lock:
            return self._carts[session_id].copy()

    def reserved_quantity(self, product_id: str) -> int:
        with self._lock:
            return sum(cart.get(product_id, 0) for cart in self._carts.values())

    def try_add(self, session_id: str, product_id: str, quantity: int, stock: int) -> bool:
        with self._lock:
            reserved = sum(cart.get(product_id, 0) for cart in self._carts.values())
            if quantity > stock - reserved:
                return False
            cart = self._carts[session_id]
            cart[product_id] = cart.get(product_id, 0) + quantity
            return True

    def remove(self, session_id: str, product_id: str, quantity: int) -> bool:
        with self._lock:
            cart = self._carts.get(session_id)
            if not cart or product_id not in cart:
                return False
            remaining = cart[product_id] - quantity
            if remaining > 0:
                cart[product_id] = remaining
            else:
                del cart[product_id]
            return True

    def reset(self) -> None:
        with self._lock:
            self._carts.clear()


cart_repository = CartRepository()
