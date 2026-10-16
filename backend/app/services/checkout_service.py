from uuid import uuid4

from ..models import Cart, CheckoutSession
from ..repositories.checkout_repository import CheckoutRepository, checkout_repository
from .cart_service import CartService, cart_service


class CheckoutService:
    def __init__(
        self,
        cart_service: CartService = cart_service,
        checkout_repository: CheckoutRepository = checkout_repository,
    ) -> None:
        self._cart_service = cart_service
        self._checkout_repository = checkout_repository

    def create(self, session_id: str) -> CheckoutSession:
        cart = self._cart_service.get_cart(session_id)
        if not cart.items:
            raise ValueError("No se puede preparar el checkout con un carrito vacío.")

        checkout_id = f"demo_{uuid4().hex}"
        self._checkout_repository.create(checkout_id, session_id)
        return self._to_session(checkout_id, cart)

    def get_by_id(self, checkout_id: str) -> CheckoutSession:
        session_id = self._checkout_repository.get_session_id(checkout_id)
        if session_id is None:
            raise LookupError("La sesión de checkout no existe o expiró.")
        return self._to_session(checkout_id, self._cart_service.get_cart(session_id))

    @staticmethod
    def _to_session(checkout_id: str, cart: Cart) -> CheckoutSession:
        return CheckoutSession(
            checkout_id=checkout_id,
            session_id=cart.session_id,
            items=cart.items,
            total=cart.total,
            currency=cart.currency,
            checkout_url=f"/checkout/{checkout_id}",
        )


checkout_service = CheckoutService()
