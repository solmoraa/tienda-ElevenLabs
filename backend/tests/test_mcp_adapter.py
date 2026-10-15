import httpx

import mcp_server


def test_search_adapter_translates_parameters(monkeypatch) -> None:
    captured: dict[str, object] = {}

    def fake_request(method: str, url: str, **kwargs: object) -> httpx.Response:
        captured.update({"method": method, "url": url, **kwargs})
        return httpx.Response(200, json={"products": [], "count": 0})

    monkeypatch.setattr(mcp_server.httpx, "request", fake_request)

    result = mcp_server.buscar_productos(categoria="outdoor", precio_maximo=100000)

    assert result == {"ok": True, "data": {"products": [], "count": 0}}
    assert captured["method"] == "GET"
    assert captured["url"] == "http://127.0.0.1:8000/api/v1/products"
    assert captured["params"] == {"category": "outdoor", "max_price": 100000, "limit": 10}


def test_cart_adapter_preserves_server_error(monkeypatch) -> None:
    def fake_request(*args: object, **kwargs: object) -> httpx.Response:
        return httpx.Response(409, json={"detail": "Stock insuficiente."})

    monkeypatch.setattr(mcp_server.httpx, "request", fake_request)

    result = mcp_server.agregar_al_carrito("sesion-1", "rynx-street-lime", 4)

    assert result == {"ok": False, "status_code": 409, "error": "Stock insuficiente."}
