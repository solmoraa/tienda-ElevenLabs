"""Servidor MCP que adapta la API HTTP de Rynx para agentes conversacionales."""

import os
from typing import Any

import httpx
from mcp.server.mcpserver import MCPServer
from mcp.server.transport_security import TransportSecuritySettings


API_BASE_URL = os.getenv("RYNX_API_URL", "http://127.0.0.1:8000").rstrip("/")
MCP_ALLOWED_HOST = os.getenv("MCP_ALLOWED_HOST", "").strip()

mcp = MCPServer(
    "Rynx Store MCP",
    instructions=(
        "Herramientas de la tienda Rynx. Usá los IDs de producto devueltos por "
        "buscar_productos o obtener_detalle_producto. Los importes y el stock "
        "devueltos por estas herramientas son la única fuente de verdad."
    ),
)


def _request(method: str, path: str, **kwargs: Any) -> dict[str, Any]:
    """Llama a FastAPI y convierte fallos esperables en resultados del dominio."""
    try:
        response = httpx.request(method, f"{API_BASE_URL}{path}", timeout=10.0, **kwargs)
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
    precio_maximo: int | None = None,
    limite: int = 10,
) -> dict[str, Any]:
    """Busca productos por categoría y/o precio máximo expresado en pesos argentinos."""
    params = {"limit": min(max(limite, 1), 50)}
    if categoria:
        params["category"] = categoria
    if precio_maximo is not None:
        params["max_price"] = precio_maximo
    return _request("GET", "/api/v1/products", params=params)


@mcp.tool()
def obtener_detalle_producto(product_id: str) -> dict[str, Any]:
    """Obtiene la ficha completa de un producto usando su ID estable."""
    return _request("GET", f"/api/v1/products/{product_id}")


@mcp.tool()
def consultar_stock(product_id: str) -> dict[str, Any]:
    """Consulta el stock disponible actual de un producto usando su ID estable."""
    return _request("GET", f"/api/v1/products/{product_id}/stock")


@mcp.tool()
def agregar_al_carrito(session_id: str, product_id: str, cantidad: int = 1) -> dict[str, Any]:
    """Agrega un producto al carrito de una sesión y devuelve el carrito validado por el servidor."""
    return _request(
        "POST",
        f"/api/v1/carts/{session_id}/items",
        json={"product_id": product_id, "quantity": cantidad},
    )


@mcp.tool()
def obtener_carrito(session_id: str) -> dict[str, Any]:
    """Obtiene el carrito actual de una sesión, con artículos y total calculados en el servidor."""
    return _request("GET", f"/api/v1/carts/{session_id}")


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
