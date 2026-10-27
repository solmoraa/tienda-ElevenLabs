"""Servidor MCP que adapta la API HTTP de DR Sport para agentes conversacionales."""

import os
import threading
import time
from typing import Annotated, Any

import httpx
from mcp.server.mcpserver import MCPServer
from mcp.server.transport_security import TransportSecuritySettings
from pydantic import Field


API_BASE_URL = os.getenv("RYNX_API_URL", "http://127.0.0.1:8000").rstrip("/")
MCP_ALLOWED_HOST = os.getenv("MCP_ALLOWED_HOST", "").strip()
ADD_DEDUPE_WINDOW_SECONDS = 3.0
_http_client = httpx.Client(
    timeout=httpx.Timeout(8.0, connect=2.0),
    limits=httpx.Limits(max_connections=20, max_keepalive_connections=10, keepalive_expiry=30.0),
    trust_env=False,
)
_recent_cart_additions: dict[tuple[str, str, int, str, str], float] = {}
_cart_add_lock = threading.Lock()

mcp = MCPServer(
    "DR Sport Store MCP",
    instructions=(
        "Herramientas de la tienda DR Sport. Usá los IDs de producto devueltos por "
        "buscar_productos o obtener_detalle_producto. Los importes y el stock "
        "devueltos por estas herramientas son la única fuente de verdad."
    ),
)


def _request(method: str, path: str, **kwargs: Any) -> dict[str, Any]:
    """Llama a FastAPI y convierte fallos esperables en resultados del dominio."""
    try:
        response = _http_client.request(method, f"{API_BASE_URL}{path}", **kwargs)
    except httpx.HTTPError:
        return {
            "ok": False,
            "error": "No se pudo conectar con el servicio de la tienda. Intentá más tarde.",
        }

    if response.is_success:
        return {"ok": True, "data": response.json()}

    try:
        detail = response.json().get("detail", "No se pudo completar la operación.")
    except ValueError:
        detail = "No se pudo completar la operación."
    return {"ok": False, "status_code": response.status_code, "error": detail}


@mcp.tool()
def buscar_productos(
    categoria: str | None = None,
    talle: int | None = None,
    precio_maximo: int | None = None,
    limite: int = 50,
) -> dict[str, Any]:
    """Busca productos por categoría, talle y/o precio máximo expresado en pesos argentinos."""
    params = {"limit": min(max(limite, 1), 50)}
    if categoria:
        params["category"] = categoria
    if talle is not None:
        params["size"] = talle
    if precio_maximo is not None:
        params["max_price"] = precio_maximo
    result = _request("GET", "/api/v1/products", params=params)
    if not result.get("ok"):
        return result

    data = result["data"]
    fields = ("id", "name", "category", "price", "currency", "stock", "subcategories")
    return {
        "ok": True,
        "data": {
            "products": [
                {field: product[field] for field in fields if field in product}
                for product in data.get("products", [])
            ],
            "count": data.get("count", len(data.get("products", []))),
        },
    }


@mcp.tool()
def obtener_detalle_producto(product_id: str) -> dict[str, Any]:
    """Obtiene la ficha completa de un producto usando su ID estable."""
    return _request("GET", f"/api/v1/products/{product_id}")


@mcp.tool()
def consultar_stock(product_id: str) -> dict[str, Any]:
    """Consulta el stock disponible actual de un producto usando su ID estable."""
    return _request("GET", f"/api/v1/products/{product_id}/stock")


@mcp.tool()
def agregar_al_carrito(
    session_id: str,
    product_id: str,
    color: Annotated[str, Field(description="Color elegido explícitamente por el cliente entre los disponibles del producto.")],
    talle: Annotated[str, Field(description="Talle elegido explícitamente por el cliente entre los disponibles del producto.")],
    cantidad: int = 1,
) -> dict[str, Any]:
    """Agrega solo la variante de color y talle elegida por el cliente; devuelve el carrito y una recomendación relacionada."""
    key = (session_id, product_id, cantidad, color, talle)
    now = time.monotonic()
    with _cart_add_lock:
        last_added_at = _recent_cart_additions.get(key)
        if last_added_at is not None and now - last_added_at < ADD_DEDUPE_WINDOW_SECONDS:
            return _request("GET", f"/api/v1/carts/{session_id}")

        result = _request(
            "POST",
            f"/api/v1/carts/{session_id}/items",
            json={
                "product_id": product_id,
                "quantity": cantidad,
                "color": color,
                "size": talle,
            },
        )
        if result.get("ok"):
            _recent_cart_additions[key] = now
        return result


@mcp.tool()
def eliminar_del_carrito(
    session_id: str,
    product_id: str,
    color: Annotated[str, Field(description="Color exacto de la variante que se debe eliminar.")],
    talle: Annotated[str, Field(description="Talle exacto de la variante que se debe eliminar.")],
    cantidad: int = 1,
) -> dict[str, Any]:
    """Elimina una cantidad de una variante exacta del carrito y devuelve el carrito actualizado."""
    return _request(
        "DELETE",
        f"/api/v1/carts/{session_id}/items/{product_id}",
        params={"color": color, "size": talle, "quantity": max(1, cantidad)},
    )


@mcp.tool()
def actualizar_variante_carrito(
    session_id: str,
    product_id: str,
    color_actual: Annotated[str, Field(description="Color actual de la variante que ya está en el carrito.")],
    talle_actual: Annotated[str, Field(description="Talle actual de la variante que ya está en el carrito.")],
    nuevo_color: Annotated[str | None, Field(description="Nuevo color solicitado. Omitilo si solo cambia el talle.")] = None,
    nuevo_talle: Annotated[str | None, Field(description="Nuevo talle solicitado. Omitilo si solo cambia el color.")] = None,
) -> dict[str, Any]:
    """Cambia color y/o talle de una variante exacta conservando su cantidad y validando stock."""
    if not nuevo_color and not nuevo_talle:
        return {"ok": False, "error": "Indicá un nuevo color o un nuevo talle."}

    payload = {"current_color": color_actual, "current_size": talle_actual}
    if nuevo_color:
        payload["color"] = nuevo_color
    if nuevo_talle:
        payload["size"] = nuevo_talle
    return _request("PATCH", f"/api/v1/carts/{session_id}/items/{product_id}", json=payload)


@mcp.tool()
def obtener_carrito(session_id: str) -> dict[str, Any]:
    """Obtiene el carrito actual de una sesión, con artículos y total calculados en el servidor."""
    return _request("GET", f"/api/v1/carts/{session_id}")


@mcp.tool()
def preparar_checkout(session_id: str) -> dict[str, Any]:
    """Valida el carrito y crea una sesión de checkout de demostración. No procesa pagos."""
    return _request("POST", f"/api/v1/carts/{session_id}/checkout")


if __name__ == "__main__":
    allowed_hosts = ["127.0.0.1:*", "localhost:*"]
    if MCP_ALLOWED_HOST:
        allowed_hosts.append(MCP_ALLOWED_HOST)

    mcp.run(
        transport="streamable-http",
        host="127.0.0.1",
        port=8001,
        transport_security=TransportSecuritySettings(
            enable_dns_rebinding_protection=True,
            allowed_hosts=allowed_hosts,
            allowed_origins=[],
        ),
    )
