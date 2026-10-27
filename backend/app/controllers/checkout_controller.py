from fastapi import HTTPException

from ..models import CheckoutSession
from ..services.checkout_service import CheckoutService, checkout_service


class CheckoutController:
    def __init__(self, service: CheckoutService = checkout_service) -> None:
        self._service = service

    def create(self, session_id: str) -> CheckoutSession:
        try:
            return self._service.create(session_id)
        except ValueError as error:
            raise HTTPException(status_code=409, detail=str(error)) from error

    def read(self, checkout_id: str) -> CheckoutSession:
        try:
            return self._service.get_by_id(checkout_id)
        except LookupError as error:
            raise HTTPException(status_code=404, detail=str(error)) from error


checkout_controller = CheckoutController()
