import unicodedata

from ..models import AddCartItemRequest, Cart, CartItem, UpdateCartItemRequest
from ..repositories.cart_repository import CartRepository, cart_repository
from ..repositories.product_repository import ProductRepository, product_repository


class CartService:
    FALLBACK_SOCKS_ID = "medias-outdoor-tres-cuartos"

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
                related, related_option = self._recommendation_for(source_product, last_added[1])
                if related and related_option:
                    recommendation = self._product_repository.summary(
                        related,
                        image_url=related_option.image_url,
                        suggested_color=related_option.name,
                    )

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

    def remove_item(
        self,
        session_id: str,
        product_id: str,
        quantity: int,
        color: str | None = None,
        size: str | None = None,
    ) -> Cart:
        product = self._product_repository.get_by_id(product_id)
        if product is None:
            raise LookupError("Producto no encontrado.")

        key = self._resolve_cart_key(session_id, product, color, size)
        if not self._cart_repository.remove(session_id, key, quantity):
            raise LookupError("El producto no está en el carrito.")
        return self.get_cart(session_id)

    def update_item(self, session_id: str, product_id: str, item: UpdateCartItemRequest) -> Cart:
        product = self._product_repository.get_by_id(product_id)
        if product is None:
            raise LookupError("Producto no encontrado.")

        source = self._resolve_cart_key(session_id, product, item.current_color, item.current_size)
        target = (
            product_id,
            self._canonical_choice(item.color, product.colors, "color") if item.color else source[1],
            self._canonical_choice(item.size, product.sizes, "talle") if item.size else source[2],
        )
        result = self._cart_repository.replace_variant(session_id, source, target, product.stock)
        if result == "not_found":
            raise LookupError("El producto no está en el carrito.")
        if result == "insufficient_stock":
            raise ValueError("Stock insuficiente para cambiar esa variante.")
        return self.get_cart(session_id)

    def _resolve_cart_key(self, session_id: str, product, color: str | None, size: str | None) -> tuple[str, str, str]:
        quantities, _ = self._cart_repository.get_state(session_id)
        candidates = [key for key in quantities if key[0] == product.id]
        if not candidates:
            raise LookupError("El producto no está en el carrito.")
        if color is not None:
            canonical_color = self._canonical_choice(color, product.colors, "color")
            candidates = [key for key in candidates if key[1] == canonical_color]
        if size is not None:
            canonical_size = self._canonical_choice(size, product.sizes, "talle")
            candidates = [key for key in candidates if key[2] == canonical_size]
        if not candidates:
            raise LookupError("No encontramos esa variante en el carrito.")
        if len(candidates) > 1:
            raise ValueError("Indicá color y talle para identificar la variante a modificar.")
        return candidates[0]

    @classmethod
    def _canonical_choice(cls, requested: str | None, choices: list[str], label: str) -> str:
        if not requested:
            raise ValueError(f"Falta seleccionar {label}. Opciones: {', '.join(choices)}.")
        normalized_requested = cls._normalize(requested)
        match = next((choice for choice in choices if cls._normalize(choice) == normalized_requested), None)
        if match is None:
            raise ValueError(f"{label.capitalize()} no disponible. Opciones: {', '.join(choices)}.")
        return match

    def _recommendation_for(self, source_product, source_color: str):
        """Prioriza el accesorio correspondiente y usa medias neutras si no combina."""
        related = self._product_repository.get_by_id(source_product.recommended_product_id)
        if related is None:
            return None, None

        related_option, score = self._best_matching_option(related, source_color)
        if score > 0:
            return related, related_option

        fallback = self._product_repository.get_by_id(self.FALLBACK_SOCKS_ID)
        if fallback is None:
            return related, related_option

        neutral_color = self._neutral_fallback_color(source_color)
        fallback_option = next(
            (option for option in fallback.color_options if self._normalize(option.name) == neutral_color),
            fallback.color_options[0],
        )
        return fallback, fallback_option

    @classmethod
    def _matching_option(cls, product, source_color: str):
        option, _ = cls._best_matching_option(product, source_color)
        return option

    @classmethod
    def _best_matching_option(cls, product, source_color: str):
        aliases = {
            "celeste": {"azul", "turquesa", "blanco"},
            "menta": {"menta", "verde", "gris"},
            "lavanda": {"lavanda", "violeta", "rosa", "blanco"},
            "violeta": {"lavanda", "violeta", "rosa"},
            "rosa": {"rosa", "lavanda", "blanco"},
            "coral": {"rojo", "rosa"},
            "beige": {"beige", "nude", "blanco", "gris"},
            "crema": {"crema", "blanco", "beige", "gris"},
            "rojo": {"rojo", "bordo"},
            "bordo": {"bordo", "rojo"},
            "oliva": {"verde"},
            "lima": {"lima", "verde"},
        }
        source_tokens = set(cls._normalize(source_color).replace(",", " ").split())
        expanded_tokens = set(source_tokens)
        for token in source_tokens:
            expanded_tokens.update(aliases.get(token, set()))
        scored_options = [
            (
                option,
                len(expanded_tokens & set(cls._normalize(option.name).replace(",", " ").split())),
            )
            for option in product.color_options
        ]
        return max(scored_options, key=lambda item: item[1])

    @classmethod
    def _neutral_fallback_color(cls, source_color: str) -> str:
        tokens = set(cls._normalize(source_color).replace(",", " ").split())
        if "negro" in tokens:
            return "negro"
        if "blanco" in tokens:
            return "blanco"

        dark_tones = {"grafito", "marino", "marron", "bordo", "oliva", "azul", "rojo"}
        light_tones = {"beige", "crema", "nude", "celeste", "lavanda", "rosa", "menta", "turquesa"}
        if tokens & dark_tones:
            return "negro"
        if tokens & light_tones:
            return "blanco"
        return "negro"

    @staticmethod
    def _normalize(value: str) -> str:
        normalized = unicodedata.normalize("NFKD", str(value).strip().casefold())
        return "".join(character for character in normalized if not unicodedata.combining(character))


cart_service = CartService()
