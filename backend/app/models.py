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
    description: str


class ProductSearchResponse(BaseModel):
    products: list[Product]
    count: int


class StockResponse(BaseModel):
    product_id: ProductId
    available: int = Field(ge=0)


class AddCartItemRequest(BaseModel):
    product_id: ProductId
    quantity: int = Field(default=1, ge=1, le=10)


class CartItem(BaseModel):
    product_id: ProductId
    name: str
    quantity: int = Field(ge=1)
    unit_price: int = Field(ge=0)
    line_total: int = Field(ge=0)
    currency: str
    image_url: str


class Cart(BaseModel):
    session_id: SessionId
    items: list[CartItem]
    total: int = Field(ge=0)
    currency: str = "ARS"
