import unicodedata

from ..models import AddCartItemRequest, Cart, CartItem
from ..repositories.cart_repository import CartRepository, cart_repository
from ..repositories.product_repository import ProductRepository, product_repository


class CartService:
    def __init__(
        self,
        cart_repository: CartRepository = cart_repository,
        product_repository: ProductRepository = product_repository,
    ) -> None:
        self._cart_repository = cart_repository
        self._product_repository = product_repository

    def get_cart(self, session_id: str) -> Cart:
        quantities, last_added = self._cart_repository.get_state(session_id)
        items: list[CartItem] = []
        for (product_id, color, size), quantity in quantities.items():
            product = self._product_repository.get_by_id(product_id)
            if product is None:
                continue
            image_url = next(
                (option.image_url for option in product.color_options if option.name == color),
                product.image_url,
            )
            items.append(CartItem(
                product_id=product_id,
                name=product.name,
                quantity=quantity,
                unit_price=product.price,
                line_total=product.price * quantity,
                currency=product.currency,
                image_url=image_url,
                selected_color=color,
                selected_size=size,
            ))

        recommendation = None
        if last_added:
            source_product = self._product_repository.get_by_id(last_added[0])
            if source_product and source_product.recommended_product_id:
                related = self._product_repository.get_by_id(source_product.recommended_product_id)
                if related:
                    related_image = self._matching_image(related, last_added[1])
                    recommendation = self._product_repository.summary(related, image_url=related_image)

        return Cart(
            session_id=session_id,
            items=items,
            total=sum(item.line_total for item in items),
            recommendation=recommendation,
        )

    def add_item(self, session_id: str, item: AddCartItemRequest) -> Cart:
        product = self._product_repository.get_by_id(item.product_id)
        if product is None:
            raise LookupError("Producto no encontrado.")

        color = self._canonical_choice(item.color, product.colors, "color")
        size = self._canonical_choice(item.size, product.sizes, "talle")
        if not self._cart_repository.try_add(
            session_id,
            (item.product_id, color, size),
            item.quantity,
            product.stock,
        ):
            raise ValueError("Stock insuficiente.")
        return self.get_cart(session_id)

    def remove_item(self, session_id: str, product_id: str, quantity: int) -> Cart:
        if not self._cart_repository.remove(session_id, product_id, quantity):
            raise LookupError("El producto no está en el carrito.")
        return self.get_cart(session_id)

    @classmethod
    def _canonical_choice(cls, requested: str | None, choices: list[str], label: str) -> str:
        if not requested:
            return choices[0]
        normalized_requested = cls._normalize(requested)
        match = next((choice for choice in choices if cls._normalize(choice) == normalized_requested), None)
        if match is None:
            raise ValueError(f"{label.capitalize()} no disponible. Opciones: {', '.join(choices)}.")
        return match

    @classmethod
    def _matching_image(cls, product, source_color: str) -> str:
        source_tokens = set(cls._normalize(source_color).replace(",", " ").split())
        best_option = max(
            product.color_options,
            key=lambda option: len(source_tokens & set(cls._normalize(option.name).replace(",", " ").split())),
        )
        return best_option.image_url

    @staticmethod
    def _normalize(value: str) -> str:
        normalized = unicodedata.normalize("NFKD", str(value).strip().casefold())
        return "".join(character for character in normalized if not unicodedata.combining(character))


cart_service = CartService()
