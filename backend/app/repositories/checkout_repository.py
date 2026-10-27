from .cart_repository import CartRepository, cart_repository


class CheckoutRepository:
    def __init__(self, cart_repository: CartRepository = cart_repository) -> None:
        self._cart_repository = cart_repository
        self._checkouts: dict[str, str] = {}

    def create(self, checkout_id: str, session_id: str) -> None:
        self._checkouts[checkout_id] = session_id

    def get_session_id(self, checkout_id: str) -> str | None:
        return self._checkouts.get(checkout_id)

    def reset(self) -> None:
        self._checkouts.clear()


checkout_repository = CheckoutRepository()
