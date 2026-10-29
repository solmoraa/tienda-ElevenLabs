from fastapi import APIRouter, Query

from ..controllers.product_controller import product_controller
from ..models import Product, ProductSearchResponse, StockResponse


router = APIRouter(prefix="/api/v1/products", tags=["products"])


@router.get("", response_model=ProductSearchResponse)
def list_products(
    category: str | None = Query(default=None, min_length=1, max_length=100),
    size: int | None = Query(default=None, ge=20, le=60),
    max_price: float | None = Query(default=None, ge=0),
    limit: int = Query(default=50, ge=1, le=50),
) -> ProductSearchResponse:
    return product_controller.list_products(category, size, max_price, limit)


@router.get("/batch", response_model=list[Product])
def read_products(
    ids: str = Query(min_length=1, max_length=4000),
) -> list[Product]:
    product_ids = list(dict.fromkeys(value.strip() for value in ids.split(",") if value.strip()))
    return product_controller.read_products(product_ids)


@router.get("/{product_id}", response_model=Product)
def read_product(product_id: str) -> Product:
    return product_controller.read_product(product_id)


@router.get("/{product_id}/stock", response_model=StockResponse)
def read_stock(product_id: str) -> StockResponse:
    return product_controller.read_stock(product_id)
