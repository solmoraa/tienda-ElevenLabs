from fastapi.testclient import TestClient

from app.main import app
from app.repositories.cart_repository import cart_repository
from app.repositories.checkout_repository import checkout_repository


client = TestClient(app)


def setup_function() -> None:
    cart_repository.reset()
    checkout_repository.reset()


def test_searches_by_maximum_price() -> None:
    response = client.get("/api/v1/products", params={"category": "handball", "max_price": 110000})
    assert response.status_code == 200
    body = response.json()
    assert body["count"] == 1
    assert body["products"][0]["id"] == "handball-court-azul"


def test_daily_use_aliases_return_running_shoes() -> None:
    for category in ("día a día", "urbano", "casual", "lifestyle"):
        response = client.get("/api/v1/products", params={"category": category})
        assert response.status_code == 200
        body = response.json()
        assert body["count"] == 2
        assert {product["category"] for product in body["products"]} == {"running"}


def test_search_hides_products_without_available_stock() -> None:
    assert cart_repository.try_add("reserve-all", "stiletto-rojo-nocturno", 2, 2)

    response = client.get("/api/v1/products", params={"category": "tacos"})

    assert response.status_code == 200
    body = response.json()
    assert body["count"] == 1
    assert body["products"][0]["id"] == "stiletto-nude-elegance"


def test_cart_calculates_price_on_the_server() -> None:
    response = client.post(
        "/api/v1/carts/session-demo/items",
        json={"product_id": "run-aero-celeste", "quantity": 2},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["total"] == 225800
    assert body["currency"] == "ARS"
    assert body["items"][0]["unit_price"] == 112900
    assert body["items"][0]["currency"] == "ARS"


def test_cart_rejects_insufficient_stock() -> None:
    response = client.post(
        "/api/v1/carts/session-demo/items",
        json={"product_id": "stiletto-rojo-nocturno", "quantity": 3},
    )
    assert response.status_code == 409
    assert response.json()["detail"] == "Stock insuficiente."


def test_removes_cart_item() -> None:
    client.post(
        "/api/v1/carts/session-demo/items",
        json={"product_id": "formal-oxford-negro", "quantity": 2},
    )
    response = client.delete("/api/v1/carts/session-demo/items/formal-oxford-negro")
    assert response.status_code == 200
    assert response.json()["items"][0]["quantity"] == 1


def test_checkout_is_created_from_the_server_cart() -> None:
    client.post(
        "/api/v1/carts/session-demo/items",
        json={"product_id": "run-aero-celeste", "quantity": 1},
    )
    response = client.post("/api/v1/carts/session-demo/checkout")
    assert response.status_code == 201
    body = response.json()
    assert body["total"] == 112900
    assert body["currency"] == "ARS"
    assert body["items"][0]["currency"] == "ARS"
    assert body["is_demo"] is True
    assert body["checkout_url"] == f"/checkout/{body['checkout_id']}"


def test_checkout_rejects_an_empty_cart() -> None:
    response = client.post("/api/v1/carts/session-empty/checkout")
    assert response.status_code == 409
