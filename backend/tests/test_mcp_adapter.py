import httpx

import mcp_server


def test_search_adapter_translates_parameters(monkeypatch) -> None:
    captured: dict[str, object] = {}

    def fake_request(method: str, url: str, **kwargs: object) -> httpx.Response:
        captured.update({"method": method, "url": url, **kwargs})
        return httpx.Response(200, json={"products": [], "count": 0})

    monkeypatch.setattr(mcp_server.httpx, "request", fake_request)

    result = mcp_server.buscar_productos(categoria="outdoor", talle=40, precio_maximo=100000)

    assert result == {"ok": True, "data": {"products": [], "count": 0}}
    assert captured["method"] == "GET"
    assert captured["url"] == "http://127.0.0.1:8000/api/v1/products"
    assert captured["params"] == {
        "category": "outdoor",
        "size": 40,
        "max_price": 100000,
        "limit": 50,
    }


def test_cart_adapter_preserves_server_error(monkeypatch) -> None:
    def fake_request(*args: object, **kwargs: object) -> httpx.Response:
        return httpx.Response(409, json={"detail": "Stock insuficiente."})

    monkeypatch.setattr(mcp_server.httpx, "request", fake_request)

    result = mcp_server.agregar_al_carrito("sesion-1", "rynx-street-lime", 4, "Negro", "40")

    assert result == {"ok": False, "status_code": 409, "error": "Stock insuficiente."}


def test_cart_adapter_deduplicates_immediate_repeated_add(monkeypatch) -> None:
    calls: list[tuple[str, str]] = []
    mcp_server._recent_cart_additions.clear()

    def fake_request(method: str, url: str, **kwargs: object) -> httpx.Response:
        calls.append((method, url))
        return httpx.Response(200, json={"session_id": "sesion-1", "items": []})

    monkeypatch.setattr(mcp_server.httpx, "request", fake_request)

    first = mcp_server.agregar_al_carrito("sesion-1", "run-aero-celeste")
    second = mcp_server.agregar_al_carrito("sesion-1", "run-aero-celeste", 1)

    assert first["ok"] is True
    assert second["ok"] is True
    assert calls == [
        ("POST", "http://127.0.0.1:8000/api/v1/carts/sesion-1/items"),
        ("GET", "http://127.0.0.1:8000/api/v1/carts/sesion-1"),
    ]


def test_cart_adapter_sends_color_and_size(monkeypatch) -> None:
    captured: dict[str, object] = {}
    mcp_server._recent_cart_additions.clear()

    def fake_request(method: str, url: str, **kwargs: object) -> httpx.Response:
        captured.update({"method": method, "url": url, **kwargs})
        return httpx.Response(200, json={"session_id": "sesion-1", "items": []})

    monkeypatch.setattr(mcp_server.httpx, "request", fake_request)
    result = mcp_server.agregar_al_carrito("sesion-1", "run-aero-celeste", 1, "Verde menta", "38")

    assert result["ok"] is True
    assert captured["json"] == {
        "product_id": "run-aero-celeste",
        "quantity": 1,
        "color": "Verde menta",
        "size": "38",
    }
