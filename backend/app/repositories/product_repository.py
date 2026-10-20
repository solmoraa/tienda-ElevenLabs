from ..models import Product


# La coma se conserva literal: Vite no encuentra el archivo si llega como %2C.
IMAGE_BASE = "/products/Imagen%20de%20ChatGPT%2016%20oct%202026, "


def image(file_name: str) -> str:
    return f"{IMAGE_BASE}{file_name}.png"


class ProductRepository:
    """Acceso en memoria al catálogo de calzado de demostración."""

    def __init__(self) -> None:
        products = [
            Product(
                id="run-aero-celeste",
                name="Aero Flow Celeste",
                category="running",
                price=112900,
                stock=50,
                image_url=image("11_40_03-1"),
                images=[image("11_40_03-1"), image("11_40_04-2")],
                colors=["Blanco hielo", "Celeste"],
                variants=["Talles 35 al 40", "Horma regular"],
                description="Zapatilla de running liviana con capellada de malla respirable, mediasuela acolchada y base flexible para entrenamientos urbanos de ritmo constante.",
            ),
            Product(
                id="futbol-strike-verde",
                name="Strike Pro Verde",
                category="fútbol",
                price=128500,
                # Inventario holgado para que las conversaciones de la demo no
                # agoten el producto después de unas pocas pruebas.
                stock=50,
                image_url=image("11_40_05-3"),
                images=[image("11_40_05-3"), image("11_40_06-4")],
                colors=["Negro", "Verde lima"],
                variants=["Talles 39 al 45", "Tapones para césped natural"],
                description="Botín de fútbol de perfil ágil con tapones marcados, empeine texturado para mejorar el contacto con la pelota y sujeción firme en cambios de dirección.",
            ),
            Product(
                id="handball-court-azul",
                name="Court Drive Azul",
                category="handball",
                price=106900,
                stock=30,
                image_url=image("11_40_07-5"),
                images=[image("11_40_07-5"), image("11_40_08-6")],
                colors=["Blanco", "Azul eléctrico", "Naranja"],
                variants=["Talles 36 al 44", "Suela indoor antideslizante"],
                description="Modelo para handball con suela de goma de tracción indoor, refuerzos laterales y estabilidad para frenadas, pivotes y despegues rápidos.",
            ),
            Product(
                id="formal-oxford-negro",
                name="Oxford Clásico Negro",
                category="zapatos de hombre",
                price=119900,
                stock=20,
                image_url=image("11_40_09-7"),
                images=[image("11_40_09-7"), image("11_40_10-8")],
                colors=["Negro"],
                variants=["Talles 39 al 45", "Cordones negros"],
                description="Zapato formal de silueta Oxford con puntera marcada, acabado liso y suela de perfil bajo; una opción sobria para oficina, eventos y trajes.",
            ),
            Product(
                id="stiletto-nude-elegance",
                name="Stiletto Nude Elegance",
                category="tacos mujer",
                price=134900,
                stock=4,
                image_url=image("11_40_12-9"),
                images=[image("11_40_12-9"), image("11_40_13-10")],
                colors=["Nude"],
                variants=["Talles 35 al 40", "Taco alto fino"],
                description="Stiletto nude de punta fina y taco alto estilizado, pensado para looks de fiesta, eventos o una combinación elegante de día y noche.",
            ),
            Product(
                id="run-pace-coral",
                name="Pace Max Coral",
                category="running",
                price=124900,
                stock=45,
                image_url=image("11_41_51-1"),
                images=[image("11_41_51-1"), image("11_41_51-2")],
                colors=["Negro grafito", "Coral"],
                variants=["Talles 36 al 45", "Horma amplia"],
                description="Zapatilla de running con amortiguación generosa, malla ventilada y detalles reflectivos para sumar comodidad en rodajes y entrenamientos diarios.",
            ),
            Product(
                id="tenis-rally-turquesa",
                name="Rally Court Turquesa",
                category="tenis",
                price=121500,
                stock=25,
                image_url=image("11_41_53-3"),
                images=[image("11_41_53-3"), image("11_41_53-4")],
                colors=["Blanco", "Turquesa", "Azul marino"],
                variants=["Talles 36 al 44", "Suela para cancha dura"],
                description="Zapatilla de tenis con base estable, refuerzo en talón y dibujo de suela de alta tracción para acompañar desplazamientos laterales y cambios de ritmo.",
            ),
            Product(
                id="stiletto-rojo-nocturno",
                name="Stiletto Rojo Nocturno",
                category="tacos mujer",
                price=142900,
                stock=2,
                image_url=image("11_41_55-5"),
                images=[image("11_41_55-5"), image("11_41_56-6")],
                colors=["Rojo brillante"],
                variants=["Talles 35 al 40", "Taco alto fino"],
                description="Stiletto rojo brillante de punta fina, diseñado para ser protagonista en salidas, fiestas y ocasiones especiales con un acabado llamativo.",
            ),
        ]
        self._products = {product.id: product for product in products}

    def search(self, category: str | None, max_price: int | None, limit: int) -> list[Product]:
        normalized_category = category.strip().casefold() if category else None
        products = list(self._products.values())
        if normalized_category:
            aliases = {
                "dia a dia": "running",
                "día a día": "running",
                "uso diario": "running",
                "diario": "running",
                "urbano": "running",
                "urbanas": "running",
                "casual": "running",
                "lifestyle": "running",
                "correr": "running",
                "running": "running",
                "futbol": "fútbol",
                "fútbol": "fútbol",
                "indoor": "handball",
                "formal": "zapatos de hombre",
                "elegante": "zapatos de hombre",
                "salir": "tacos mujer",
                "fiesta": "tacos mujer",
                "tacos": "tacos mujer",
            }
            category_filter = aliases.get(normalized_category, normalized_category)
            products = [product for product in products if category_filter in product.category.casefold()]
        if max_price is not None:
            products = [product for product in products if product.price <= max_price]
        return products[:limit]

    def get_by_id(self, product_id: str) -> Product | None:
        return self._products.get(product_id)


product_repository = ProductRepository()
