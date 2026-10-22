from fastapi.testclient import TestClient

from app.main import app
from app.repositories.cart_repository import cart_repository
from app.repositories.checkout_repository import checkout_repository


client = TestClient(app)


def setup_function() -> None:
    cart_repository.reset()
    checkout_repository.reset()


def ids_for(category: str, **params: object) -> set[str]:
    response = client.get("/api/v1/products", params={"category": category, **params})
    assert response.status_code == 200
    return {product["id"] for product in response.json()["products"]}


def test_searches_by_maximum_price() -> None:
    response = client.get("/api/v1/products", params={"category": "handball", "max_price": 110000})
    assert response.status_code == 200
    assert ids_for("handball", max_price=110000) == {"handball-court-azul"}


def test_daily_use_aliases_return_all_casual_models() -> None:
    expected = {"urban-minimal", "heritage-court", "city-platform", "retro-court", "knit-street"}
    for category in ("día a día", "urbano", "casual", "lifestyle"):
        assert ids_for(category) == expected


def test_three_footwear_categories_are_exposed() -> None:
    products = client.get("/api/v1/products", params={"category": "zapatillas"}).json()["products"]
    assert {product["category"] for product in products} == {"Deportivas", "Elegantes", "Outdoor"}
    assert all(product["product_type"] == "calzado" for product in products)


def test_sports_search_returns_every_sports_model() -> None:
    products = client.get("/api/v1/products", params={"category": "deporte"}).json()["products"]
    assert len(products) == 18
    assert {product["category"] for product in products} == {"Deportivas"}
    assert {"run-aero-celeste", "futbol-strike-verde", "handball-court-azul", "tenis-rally-turquesa"} <= {product["id"] for product in products}


def test_generic_sneaker_search_returns_all_footwear_not_accessories() -> None:
    products = client.get("/api/v1/products", params={"category": "zapatillas"}).json()["products"]
    assert len(products) == 24
    assert not any(product["id"].startswith("medias-") for product in products)


def test_size_search_combines_with_category() -> None:
    products = client.get("/api/v1/products", params={"category": "Elegantes", "size": 44}).json()["products"]
    assert {product["id"] for product in products} == {"formal-oxford-negro", "mocasin-signature"}


def test_stiletto_is_one_product_with_two_colors() -> None:
    assert ids_for("stiletto") == {"stiletto-nude-elegance"}
    product = client.get("/api/v1/products/stiletto-nude-elegance").json()
    assert product["name"] == "Stiletto Elegance"
    assert product["colors"] == ["Negro", "Rojo"]
    assert len(product["color_options"]) == 2


def test_batch_endpoint_preserves_requested_order() -> None:
    response = client.get("/api/v1/products/batch", params={"ids": "stiletto-nude-elegance,run-aero-celeste"})
    assert response.status_code == 200
    assert [product["id"] for product in response.json()] == ["stiletto-nude-elegance", "run-aero-celeste"]


def test_all_footwear_has_color_images_and_sizes() -> None:
    summaries = client.get("/api/v1/products", params={"category": "zapatillas"}).json()["products"]
    for summary in summaries:
        product = client.get(f"/api/v1/products/{summary['id']}").json()
        assert product["colors"]
        assert product["sizes"]
        assert len(product["color_options"]) == len(product["colors"])


def test_cart_calculates_price_and_keeps_selected_variant() -> None:
    response = client.post(
        "/api/v1/carts/session-demo/items",
        json={"product_id": "run-aero-celeste", "quantity": 2, "color": "Verde menta", "size": "38"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["total"] == 225800
    assert body["currency"] == "ARS"
    assert body["items"][0]["selected_color"] == "Verde menta"
    assert body["items"][0]["selected_size"] == "38"
    assert "zapatilla_running_verde_menta.png" in body["items"][0]["image_url"]


def test_same_product_different_variants_create_separate_lines() -> None:
    client.post("/api/v1/carts/session-demo/items", json={"product_id": "stiletto-nude-elegance", "color": "Negro", "size": "36"})
    response = client.post("/api/v1/carts/session-demo/items", json={"product_id": "stiletto-nude-elegance", "color": "Rojo", "size": "37"})
    assert response.status_code == 201
    assert len(response.json()["items"]) == 2


def test_cart_rejects_invalid_variant() -> None:
    response = client.post(
        "/api/v1/carts/session-demo/items",
        json={"product_id": "stiletto-nude-elegance", "color": "Verde", "size": "36"},
    )
    assert response.status_code == 409
    assert "Color no disponible" in response.json()["detail"]


def test_cart_rejects_insufficient_stock() -> None:
    response = client.post(
        "/api/v1/carts/session-demo/items",
        json={"product_id": "futbol-titan-fg", "quantity": 5, "color": "Negro, rojo y dorado", "size": "40"},
    )
    assert response.status_code == 409
    assert response.json()["detail"] == "Stock insuficiente."


def test_cart_returns_related_recommendation() -> None:
    football = client.post(
        "/api/v1/carts/football/items",
        json={"product_id": "futbol-strike-verde", "color": "Negro y azul", "size": "41"},
    ).json()
    assert football["recommendation"]["id"] == "medias-futbol-match"
    assert "medias_futbol_negro_azul.png" in football["recommendation"]["image_url"]

    elegant = client.post(
        "/api/v1/carts/elegant/items",
        json={"product_id": "formal-oxford-negro", "color": "Marrón", "size": "42"},
    ).json()
    assert elegant["recommendation"]["id"] == "medias-formales-classic"

    stiletto = client.post(
        "/api/v1/carts/stiletto/items",
        json={"product_id": "stiletto-nude-elegance", "color": "Rojo", "size": "37"},
    ).json()
    assert stiletto["recommendation"]["id"] == "medias-cancan-elegance"


def test_demo_carts_do_not_consume_stock_from_other_sessions() -> None:
    key = ("futbol-titan-fg", "Negro, rojo y dorado", "40")
    assert cart_repository.try_add("first-session", key, 4, 4)
    assert cart_repository.try_add("second-session", key, 4, 4)
    assert "futbol-titan-fg" in ids_for("fútbol")


def test_removes_cart_item() -> None:
    client.post(
        "/api/v1/carts/session-demo/items",
        json={"product_id": "formal-oxford-negro", "quantity": 2, "color": "Negro", "size": "42"},
    )
    response = client.delete("/api/v1/carts/session-demo/items/formal-oxford-negro")
    assert response.status_code == 200
    assert response.json()["items"][0]["quantity"] == 1


def test_checkout_is_created_from_the_server_cart() -> None:
    client.post(
        "/api/v1/carts/session-demo/items",
        json={"product_id": "run-aero-celeste", "quantity": 1, "color": "Celeste", "size": "38"},
    )
    response = client.post("/api/v1/carts/session-demo/checkout")
    assert response.status_code == 201
    body = response.json()
    assert body["total"] == 112900
    assert body["currency"] == "ARS"
    assert body["items"][0]["selected_color"] == "Celeste"
    assert body["is_demo"] is True
    assert body["checkout_url"] == f"/checkout/{body['checkout_id']}"


def test_checkout_rejects_an_empty_cart() -> None:
    response = client.post("/api/v1/carts/session-empty/checkout")
    assert response.status_code == 409
