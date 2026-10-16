from typing import Annotated

from fastapi import APIRouter, Path

from ..controllers.checkout_controller import checkout_controller
from ..models import CheckoutSession


router = APIRouter(prefix="/api/v1", tags=["checkout"])
SessionId = Annotated[str, Path(min_length=1, max_length=120)]
CheckoutId = Annotated[str, Path(min_length=1, max_length=100)]


@router.post("/carts/{session_id}/checkout", response_model=CheckoutSession, status_code=201)
def create_checkout(session_id: SessionId) -> CheckoutSession:
    return checkout_controller.create(session_id)


@router.get("/checkouts/{checkout_id}", response_model=CheckoutSession)
def read_checkout(checkout_id: CheckoutId) -> CheckoutSession:
    return checkout_controller.read(checkout_id)
