from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes.cart_routes import router as cart_router
from .routes.checkout_routes import router as checkout_router
from .routes.product_routes import router as product_router


app = FastAPI(
    title="Rynx Store Demo API",
    version="0.1.0",
    description="API de demostración para catálogo, stock y carritos por sesión.",
)

app.include_router(product_router)
app.include_router(cart_router)
app.include_router(checkout_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
