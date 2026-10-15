from fastapi import HTTPException

from ..models import AddCartItemRequest, Cart
from ..services.cart_service import CartService, cart_service


class CartController:
    def __init__(self, service: CartService = cart_service) -> None:
        self._service = service

    def read_cart(self, session_id: str) -> Cart:
        return self._service.get_cart(session_id)

    def add_item(self, session_id: str, item: AddCartItemRequest) -> Cart:
        try:
            return self._service.add_item(session_id, item)
        except LookupError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error
        except ValueError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error

    def remove_item(self, session_id: str, product_id: str, quantity: int) -> Cart:
        try:
            return self._service.remove_item(session_id, product_id, quantity)
        except LookupError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error


cart_controller = CartController()
