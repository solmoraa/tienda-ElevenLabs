from ..models import Product
from ..repositories.product_repository import ProductRepository, product_repository


class ProductService:
    def __init__(
        self,
        product_repository: ProductRepository = product_repository,
    ) -> None:
        self._product_repository = product_repository

    def search(self, category: str | None, max_price: int | None, limit: int) -> list[Product]:
        products = self._product_repository.search(category, max_price, 50)
        available_products = [product for product in products if product.stock > 0]
        return available_products[:limit]

    def get_by_id(self, product_id: str) -> Product | None:
        return self._product_repository.get_by_id(product_id)

    def get_available_stock(self, product_id: str) -> int | None:
        product = self.get_by_id(product_id)
        if product is None:
            return None
        return product.stock


product_service = ProductService()
