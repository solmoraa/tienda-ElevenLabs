from ..models import Product


class ProductRepository:
    """Acceso al catálogo ficticio de productos."""

    def __init__(self) -> None:
        self._products: dict[str, Product] = {
            "rynx-runner-black": Product(
                id="rynx-runner-black",
                name="Runner Nova",
                category="zapatillas urbanas",
                price=89900,
                stock=8,
                image_url="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
                description="Amortiguación liviana y una silueta versátil para todos los días.",
            ),
            "rynx-trail-sand": Product(
                id="rynx-trail-sand",
                name="Trail Terra",
                category="outdoor",
                price=96500,
                stock=5,
                image_url="https://images.unsplash.com/photo-1551698618-1dfe5d97d256?auto=format&fit=crop&w=900&q=80",
                description="Tracción reforzada y capellada resistente para escapadas al aire libre.",
            ),
            "rynx-street-lime": Product(
                id="rynx-street-lime",
                name="Street Pulse",
                category="edición limitada",
                price=78400,
                stock=3,
                image_url="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80",
                description="Un modelo de perfil bajo, liviano y con detalles de alto contraste.",
            ),
        }

    def search(self, category: str | None, max_price: int | None, limit: int) -> list[Product]:
        normalized_category = category.strip().casefold() if category else None
        products = list(self._products.values())
        if normalized_category:
            products = [product for product in products if normalized_category in product.category.casefold()]
        if max_price is not None:
            products = [product for product in products if product.price <= max_price]
        return products[:limit]

    def get_by_id(self, product_id: str) -> Product | None:
        return self._products.get(product_id)


product_repository = ProductRepository()
