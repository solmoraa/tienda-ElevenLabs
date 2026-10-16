from fastapi import HTTPException

from ..models import Product, ProductSearchResponse, StockResponse
from ..services.product_service import ProductService, product_service


class ProductController:
    def __init__(self, service: ProductService = product_service) -> None:
        self._service = service

    def list_products(self, category: str | None, max_price: int | None, limit: int) -> ProductSearchResponse:
        products = self._service.search(category, max_price, limit)
        return ProductSearchResponse(products=products, count=len(products))

    def read_product(self, product_id: str) -> Product:
        product = self._service.get_by_id(product_id)
        if product is None:
            raise HTTPException(status_code=404, detail="Producto no encontrado.")
        return product

    def read_stock(self, product_id: str) -> StockResponse:
        available = self._service.get_available_stock(product_id)
        if available is None:
            raise HTTPException(status_code=404, detail="Producto no encontrado.")
        return StockResponse(product_id=product_id, available=available)


product_controller = ProductController()
