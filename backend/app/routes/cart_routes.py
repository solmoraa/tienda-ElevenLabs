from typing import Annotated

from fastapi import APIRouter, Path, Query

from ..controllers.cart_controller import cart_controller
from ..models import AddCartItemRequest, Cart


router = APIRouter(prefix="/api/v1/carts", tags=["carts"])
SessionId = Annotated[str, Path(min_length=1, max_length=120)]


@router.get("/{session_id}", response_model=Cart)
def read_cart(session_id: SessionId) -> Cart:
    return cart_controller.read_cart(session_id)


@router.post("/{session_id}/items", response_model=Cart, status_code=201)
def add_cart_item(session_id: SessionId, item: AddCartItemRequest) -> Cart:
    return cart_controller.add_item(session_id, item)


@router.delete("/{session_id}/items/{product_id}", response_model=Cart)
def delete_cart_item(
    session_id: SessionId,
    product_id: str,
    quantity: int = Query(default=1, ge=1, le=10),
) -> Cart:
    return cart_controller.remove_item(session_id, product_id, quantity)
