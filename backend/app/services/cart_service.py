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
        quantities = self._cart_repository.get_quantities(session_id)
        items = [
            CartItem(
                product_id=product_id,
                name=product.name,
                quantity=quantity,
                unit_price=product.price,
                line_total=product.price * quantity,
                currency=product.currency,
                image_url=product.image_url,
            )
            for product_id, quantity in quantities.items()
            if (product := self._product_repository.get_by_id(product_id)) is not None
        ]
        return Cart(session_id=session_id, items=items, total=sum(item.line_total for item in items))

    def add_item(self, session_id: str, item: AddCartItemRequest) -> Cart:
        product = self._product_repository.get_by_id(item.product_id)
        if product is None:
            raise LookupError("Producto no encontrado.")
        if not self._cart_repository.try_add(session_id, item.product_id, item.quantity, product.stock):
            raise ValueError("Stock insuficiente.")
        return self.get_cart(session_id)

    def remove_item(self, session_id: str, product_id: str, quantity: int) -> Cart:
        if not self._cart_repository.remove(session_id, product_id, quantity):
            raise LookupError("El producto no está en el carrito.")
        return self.get_cart(session_id)


cart_service = CartService()
