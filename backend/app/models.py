from typing import Annotated

from pydantic import BaseModel, Field


ProductId = Annotated[str, Field(min_length=1, max_length=100)]
SessionId = Annotated[str, Field(min_length=1, max_length=120)]


class Product(BaseModel):
    id: ProductId
    name: str
    category: str
    price: int = Field(ge=0, description="Precio entero en pesos argentinos.")
    currency: str = "ARS"
    stock: int = Field(ge=0)
    image_url: str
    images: list[str] = Field(min_length=1)
    colors: list[str] = Field(min_length=1)
    color_options: list["ProductColor"] = Field(min_length=1)
    sizes: list[str] = Field(min_length=1)
    subcategories: list[str] = Field(default_factory=list)
    product_type: str = "calzado"
    variants: list[str] = Field(default_factory=list)
    description: str
    recommended_product_id: ProductId | None = None


class ProductColor(BaseModel):
    name: str
    image_url: str


class ProductSummary(BaseModel):
    id: ProductId
    name: str
    category: str
    price: int = Field(ge=0)
    currency: str = "ARS"
    stock: int = Field(ge=0)
    image_url: str
    subcategories: list[str] = Field(default_factory=list)
    product_type: str = "calzado"
    suggested_color: str | None = None


class ProductSearchResponse(BaseModel):
    products: list[ProductSummary]
    count: int


class StockResponse(BaseModel):
    product_id: ProductId
    available: int = Field(ge=0)


class AddCartItemRequest(BaseModel):
    product_id: ProductId
    quantity: int = Field(default=1, ge=1, le=10)
    color: str = Field(min_length=1)
    size: str = Field(min_length=1)


class UpdateCartItemRequest(BaseModel):
    current_color: str = Field(min_length=1)
    current_size: str = Field(min_length=1)
    color: str | None = Field(default=None, min_length=1)
    size: str | None = Field(default=None, min_length=1)


class CartItem(BaseModel):
    product_id: ProductId
    name: str
    quantity: int = Field(ge=1)
    unit_price: int = Field(ge=0)
    line_total: int = Field(ge=0)
    currency: str
    image_url: str
    selected_color: str
    selected_size: str


class Cart(BaseModel):
    session_id: SessionId
    items: list[CartItem]
    total: int = Field(ge=0)
    currency: str = "ARS"
    recommendation: ProductSummary | None = None


class CheckoutSession(BaseModel):
    checkout_id: str
    session_id: SessionId
    items: list[CartItem]
    total: int = Field(ge=0)
    currency: str = "ARS"
    checkout_url: str
    is_demo: bool = True
