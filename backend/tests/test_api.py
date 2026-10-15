from fastapi.testclient import TestClient

from app.main import app
from app.repositories.cart_repository import cart_repository


client = TestClient(app)


def setup_function() -> None:
    cart_repository.reset()


def test_searches_by_maximum_price() -> None:
    response = client.get("/api/v1/products", params={"max_price": 90000})
    assert response.status_code == 200
    body = response.json()
    assert body["count"] == 2
    assert {product["id"] for product in body["products"]} == {"rynx-runner-black", "rynx-street-lime"}


def test_cart_calculates_price_on_the_server() -> None:
    response = client.post(
        "/api/v1/carts/session-demo/items",
        json={"product_id": "rynx-runner-black", "quantity": 2},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["total"] == 179800
    assert body["items"][0]["unit_price"] == 89900


def test_cart_rejects_insufficient_stock() -> None:
    response = client.post(
        "/api/v1/carts/session-demo/items",
        json={"product_id": "rynx-street-lime", "quantity": 4},
    )
    assert response.status_code == 409
    assert response.json()["detail"] == "Stock insuficiente."


def test_removes_cart_item() -> None:
    client.post(
        "/api/v1/carts/session-demo/items",
        json={"product_id": "rynx-trail-sand", "quantity": 2},
    )
    response = client.delete("/api/v1/carts/session-demo/items/rynx-trail-sand")
    assert response.status_code == 200
    assert response.json()["items"][0]["quantity"] == 1
