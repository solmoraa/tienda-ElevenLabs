import unicodedata
from urllib.parse import quote

from ..models import Product, ProductColor, ProductSummary


def asset(file_name: str) -> str:
    """Devuelve una URL estable para un archivo de public/products."""
    return f"/products/{quote(file_name, safe=',._-')}"


def sizes(first: int, last: int) -> list[str]:
    return [str(value) for value in range(first, last + 1)]


def product(
    *, product_id: str, name: str, category: str, subcategories: list[str],
    price: int, stock: int, color_images: list[tuple[str, str]],
    available_sizes: list[str], description: str,
    recommended_product_id: str | None, product_type: str = "calzado",
) -> Product:
    color_options = [ProductColor(name=color, image_url=asset(file_name)) for color, file_name in color_images]
    return Product(
        id=product_id, name=name, category=category, subcategories=subcategories,
        product_type=product_type, price=price, stock=stock,
        image_url=color_options[0].image_url,
        images=[option.image_url for option in color_options],
        colors=[option.name for option in color_options], color_options=color_options,
        sizes=available_sizes, variants=[f"Talles {' / '.join(available_sizes)}"],
        description=description, recommended_product_id=recommended_product_id,
    )


class ProductRepository:
    """Catálogo en memoria con modelos únicos y variantes reales de color."""

    def __init__(self) -> None:
        products = [
            product(
                product_id="run-aero-celeste", name="Aero Flow", category="Deportivas",
                subcategories=["running", "entrenamiento"], price=112900, stock=50,
                color_images=[
                    ("Celeste", "Imagen de ChatGPT 16 oct 2026, 11_40_03-1.png"),
                    ("Verde menta", "zapatilla_running_verde_menta.png"),
                    ("Violeta lavanda", "zapatilla_running_violeta_lavanda.png"),
                    ("Rosa y gris", "Zapatilla deportiva rosa y gris.png"),
                ], available_sizes=sizes(35, 45),
                description="Zapatilla de running liviana con malla respirable, amortiguación suave y base flexible para entrenamientos urbanos.",
                recommended_product_id="medias-deportivas-grip",
            ),
            product(
                product_id="futbol-strike-verde", name="Strike Pro", category="Deportivas",
                subcategories=["fútbol", "botines", "césped natural"], price=128500, stock=50,
                color_images=[
                    ("Negro y verde lima", "Imagen de ChatGPT 16 oct 2026, 11_40_05-3.png"),
                    ("Negro y azul", "botin_negro_azul.png"),
                    ("Negro y rojo", "botin_negro_rojo.png"),
                ], available_sizes=sizes(39, 45),
                description="Botín de fútbol de perfil ágil, empeine texturado y tapones firmes para cambios de dirección.",
                recommended_product_id="medias-futbol-match",
            ),
            product(
                product_id="handball-court-azul", name="Court Drive", category="Deportivas",
                subcategories=["handball", "indoor"], price=106900, stock=30,
                color_images=[("Azul eléctrico y naranja", "Imagen de ChatGPT 16 oct 2026, 11_40_07-5.png")],
                available_sizes=sizes(36, 44),
                description="Modelo de handball con goma de alta tracción, refuerzos laterales y estabilidad para frenadas y pivotes.",
                recommended_product_id="medias-deportivas-grip",
            ),
            product(
                product_id="formal-oxford-negro", name="Oxford Clásico", category="Elegantes",
                subcategories=["zapatos de hombre", "formal", "oficina"], price=119900, stock=20,
                color_images=[("Negro", "zapato_oxford_negro.png"), ("Marrón", "zapato_oxford_marron.png")],
                available_sizes=sizes(39, 45),
                description="Zapato Oxford de acabado liso y perfil sobrio para oficina, eventos y trajes.",
                recommended_product_id="medias-formales-classic",
            ),
            product(
                product_id="stiletto-nude-elegance", name="Stiletto Elegance", category="Elegantes",
                subcategories=["tacos", "stiletto", "mujer", "fiesta"], price=139900, stock=12,
                color_images=[("Negro", "stiletto_negro.png"), ("Rojo", "stiletto_rojo.png")],
                available_sizes=sizes(35, 40),
                description="Stiletto de punta fina y taco alto estilizado para fiesta, eventos y looks elegantes.",
                recommended_product_id="medias-cancan-elegance",
            ),
            product(
                product_id="run-pace-coral", name="Pace Max Coral", category="Deportivas",
                subcategories=["running", "entrenamiento"], price=124900, stock=45,
                color_images=[("Negro grafito y coral", "Imagen de ChatGPT 16 oct 2026, 11_41_51-1.png")],
                available_sizes=sizes(36, 45),
                description="Zapatilla de running con amortiguación generosa, malla ventilada y detalles reflectivos.",
                recommended_product_id="medias-deportivas-grip",
            ),
            product(
                product_id="tenis-rally-turquesa", name="Rally Court", category="Deportivas",
                subcategories=["tenis", "cancha dura"], price=121500, stock=25,
                color_images=[("Blanco y turquesa", "Imagen de ChatGPT 16 oct 2026, 11_41_53-3.png")],
                available_sizes=sizes(36, 44),
                description="Zapatilla de tenis con base estable, refuerzo de talón y dibujo de alta tracción.",
                recommended_product_id="medias-deportivas-grip",
            ),
            product(
                product_id="urban-minimal", name="Urban Minimal", category="Deportivas",
                subcategories=["casual", "urbano", "día a día"], price=98900, stock=18,
                color_images=[
                    ("Crema", "Imagen de ChatGPT 21 oct 2026, 14_02_48-1.png"),
                    ("Negro", "Imagen de ChatGPT 21 oct 2026, 14_02_49-2.png"),
                ], available_sizes=sizes(35, 45),
                description="Zapatilla urbana minimalista de líneas limpias y suela cómoda para todos los días.",
                recommended_product_id="medias-outdoor-tres-cuartos",
            ),
            product(
                product_id="heritage-court", name="Heritage Court", category="Deportivas",
                subcategories=["casual", "urbano", "día a día"], price=104900, stock=15,
                color_images=[
                    ("Beige", "Imagen de ChatGPT 21 oct 2026, 14_02_50-3.png"),
                    ("Azul marino", "Imagen de ChatGPT 21 oct 2026, 14_02_50-4.png"),
                ], available_sizes=sizes(35, 45),
                description="Zapatilla casual de cuero y gamuza con estética clásica y base flexible.",
                recommended_product_id="medias-outdoor-tres-cuartos",
            ),
            product(
                product_id="city-platform", name="City Platform", category="Deportivas",
                subcategories=["casual", "urbano", "plataforma"], price=109900, stock=11,
                color_images=[
                    ("Rosa", "Imagen de ChatGPT 21 oct 2026, 14_02_51-5.png"),
                    ("Gris", "Imagen de ChatGPT 21 oct 2026, 14_02_51-6.png"),
                ], available_sizes=sizes(35, 41),
                description="Zapatilla urbana de plataforma liviana con diseño monocromático y calce cómodo.",
                recommended_product_id="medias-outdoor-tres-cuartos",
            ),
            product(
                product_id="retro-court", name="Retro Court", category="Deportivas",
                subcategories=["casual", "urbano", "retro"], price=114900, stock=14,
                color_images=[
                    ("Oliva y crema", "Imagen de ChatGPT 21 oct 2026, 14_02_52-7.png"),
                    ("Bordó y crema", "Imagen de ChatGPT 21 oct 2026, 14_02_52-8.png"),
                ], available_sizes=sizes(36, 45),
                description="Zapatilla urbana de inspiración retro con paneles de gamuza y suela de gran apoyo.",
                recommended_product_id="medias-outdoor-tres-cuartos",
            ),
            product(
                product_id="knit-street", name="Knit Street", category="Deportivas",
                subcategories=["casual", "urbano", "día a día"], price=99900, stock=16,
                color_images=[
                    ("Beige", "Imagen de ChatGPT 21 oct 2026, 14_02_53-9.png"),
                    ("Gris grafito", "Imagen de ChatGPT 21 oct 2026, 14_02_53-10.png"),
                ], available_sizes=sizes(35, 45),
                description="Zapatilla urbana de tejido respirable, liviana y versátil para uso diario.",
                recommended_product_id="medias-outdoor-tres-cuartos",
            ),
            product(
                product_id="futbol-pulse-fg", name="Pulse FG", category="Deportivas",
                subcategories=["fútbol", "botines", "césped natural"], price=136900, stock=9,
                color_images=[("Blanco, azul y lima", "Imagen de ChatGPT 21 oct 2026, 14_30_46-1.png")],
                available_sizes=sizes(38, 45),
                description="Botín liviano de velocidad con tapones para césped natural y ajuste anatómico.",
                recommended_product_id="medias-futbol-match",
            ),
            product(
                product_id="futbol-titan-fg", name="Titan FG", category="Deportivas",
                subcategories=["fútbol", "botines", "césped natural"], price=149900, stock=4,
                color_images=[("Negro, rojo y dorado", "Imagen de ChatGPT 21 oct 2026, 14_30_47-2.png")],
                available_sizes=sizes(39, 45),
                description="Botín de caña media con estructura reforzada y placa firme para máxima tracción.",
                recommended_product_id="medias-futbol-match",
            ),
            product(
                product_id="futbol-glide-fg", name="Glide FG", category="Deportivas",
                subcategories=["fútbol", "botines", "césped natural"], price=132900, stock=8,
                color_images=[("Blanco y turquesa", "Imagen de ChatGPT 21 oct 2026, 14_30_49-3.png")],
                available_sizes=sizes(38, 45),
                description="Botín flexible de toque limpio y placa de tracción para aceleraciones rápidas.",
                recommended_product_id="medias-futbol-match",
            ),
            product(
                product_id="trail-forge", name="Trail Forge", category="Outdoor",
                subcategories=["trail", "senderismo", "trekking"], price=139900, stock=7,
                color_images=[("Oliva y naranja", "Imagen de ChatGPT 21 oct 2026, 14_33_51.png")],
                available_sizes=sizes(37, 45),
                description="Calzado de trail con dibujo profundo, puntera protegida y soporte para terreno irregular.",
                recommended_product_id="medias-outdoor-tres-cuartos",
            ),
            product(
                product_id="road-cage", name="Road Cage", category="Deportivas",
                subcategories=["running", "entrenamiento"], price=118900, stock=13,
                color_images=[
                    ("Gris y rojo", "Imagen de ChatGPT 21 oct 2026, 14_33_58.png"),
                    ("Lavanda", "Imagen de ChatGPT 21 oct 2026, 14_34_03.png"),
                ], available_sizes=sizes(35, 45),
                description="Zapatilla de entrenamiento con jaula lateral, malla ventilada y soporte estable.",
                recommended_product_id="medias-deportivas-grip",
            ),
            product(
                product_id="court-apex", name="Court Apex", category="Deportivas",
                subcategories=["tenis", "handball", "indoor"], price=126900, stock=10,
                color_images=[("Blanco y violeta", "Imagen de ChatGPT 21 oct 2026, 14_34_07.png")],
                available_sizes=sizes(36, 44),
                description="Zapatilla de cancha con soporte alto, estabilidad lateral y suela de gran adherencia.",
                recommended_product_id="medias-deportivas-grip",
            ),
            product(
                product_id="handball-pulse", name="Handball Pulse", category="Deportivas",
                subcategories=["handball", "indoor"], price=127900, stock=6,
                color_images=[("Negro y naranja", "Imagen de ChatGPT 21 oct 2026, 14_34_13.png")],
                available_sizes=sizes(36, 44),
                description="Modelo indoor de caña media con contención lateral para saltos, frenadas y pivotes.",
                recommended_product_id="medias-deportivas-grip",
            ),
            product(
                product_id="court-grip", name="Court Grip", category="Deportivas",
                subcategories=["tenis", "handball", "indoor"], price=117900, stock=9,
                color_images=[("Negro y lima", "Imagen de ChatGPT 21 oct 2026, 14_34_21.png")],
                available_sizes=sizes(36, 45),
                description="Zapatilla de cancha con suela de goma y estructura ventilada para movimientos rápidos.",
                recommended_product_id="medias-deportivas-grip",
            ),
            product(
                product_id="cloud-run", name="Cloud Run", category="Deportivas",
                subcategories=["running", "entrenamiento"], price=116900, stock=12,
                color_images=[
                    ("Beige y menta", "Imagen de ChatGPT 21 oct 2026, 14_34_27.png"),
                    ("Gris y menta", "Imagen de ChatGPT 21 oct 2026, 14_34_33.png"),
                ], available_sizes=sizes(35, 45),
                description="Zapatilla de running de malla suave y amortiguación equilibrada para uso diario.",
                recommended_product_id="medias-deportivas-grip",
            ),
            product(
                product_id="botin-tacon-city", name="Botín City Heel", category="Elegantes",
                subcategories=["botín con taco", "mujer", "formal"], price=145900, stock=8,
                color_images=[("Beige", "botin_tacon_beige.png"), ("Negro", "botin_tacon_negro.png")],
                available_sizes=sizes(35, 41),
                description="Botín femenino de taco ancho y silueta limpia para looks elegantes de media estación.",
                recommended_product_id="medias-cancan-elegance",
            ),
            product(
                product_id="mocasin-signature", name="Mocasín Signature", category="Elegantes",
                subcategories=["mocasín", "formal", "zapatos de hombre"], price=122900, stock=10,
                color_images=[("Azul marino", "mocasin_azul_marino.png"), ("Beige", "mocasin_beige.png")],
                available_sizes=sizes(38, 45),
                description="Mocasín de vestir flexible y refinado para oficina y ocasiones semi-formales.",
                recommended_product_id="medias-formales-classic",
            ),
            product(
                product_id="sandalia-tacon-evening", name="Sandalia Evening", category="Elegantes",
                subcategories=["sandalia", "taco", "mujer", "fiesta"], price=129900, stock=9,
                color_images=[("Negro", "sandalia_tacon_negro.png"), ("Nude", "sandalia_tacon_nude.png")],
                available_sizes=sizes(35, 41),
                description="Sandalia de taco fino y tiras delicadas para eventos y looks de noche.",
                recommended_product_id="medias-cancan-elegance",
            ),
            product(
                product_id="medias-futbol-match", name="Medias Fútbol Match", category="Accesorios",
                subcategories=["medias", "fútbol"], product_type="accesorio", price=18900, stock=40,
                color_images=[
                    ("Negro y azul", "medias_futbol_negro_azul.png"),
                    ("Negro y rojo", "medias_futbol_negro_rojo.png"),
                    ("Negro, rojo y dorado", "medias_futbol_negro_rojo_dorado.png"),
                    ("Negro y verde neón", "medias_futbol_negro_verde_neon.png"),
                    ("Blanco, azul y verde", "medias_futbol_blanco_azul_verde.png"),
                    ("Blanco y turquesa", "medias_futbol_blanco_turquesa.png"),
                ], available_sizes=["S", "M", "L"],
                description="Medias altas de fútbol con ajuste firme y colores pensados para combinar con los botines.",
                recommended_product_id=None,
            ),
            product(
                product_id="medias-deportivas-grip", name="Medias Deportivas Grip", category="Accesorios",
                subcategories=["medias", "deporte", "antideslizantes"], product_type="accesorio", price=14900, stock=50,
                color_images=[
                    ("Blanco y azul", "Imagen de ChatGPT 21 oct 2026, 15_44_35-1.png"),
                    ("Negro y azul", "Imagen de ChatGPT 21 oct 2026, 15_44_36-2.png"),
                    ("Blanco, azul y lima", "Imagen de ChatGPT 21 oct 2026, 15_44_37-3.png"),
                    ("Gris y menta", "Imagen de ChatGPT 21 oct 2026, 15_44_39-4.png"),
                    ("Blanco, rosa y lavanda", "Imagen de ChatGPT 21 oct 2026, 15_44_41-5.png"),
                    ("Negro y rojo", "Imagen de ChatGPT 21 oct 2026, 15_44_42-6.png"),
                ], available_sizes=["S", "M", "L"],
                description="Medias técnicas respirables con zonas de apoyo y ajuste antideslizante.",
                recommended_product_id=None,
            ),
            product(
                product_id="medias-outdoor-tres-cuartos", name="Medias Outdoor 3/4", category="Accesorios",
                subcategories=["medias", "outdoor", "tres cuartos", "uso diario"],
                product_type="accesorio", price=15900, stock=50,
                color_images=[
                    ("Gris", "medias_outdoor_gris.png"),
                    ("Negro", "medias_outdoor_negro.png"),
                    ("Blanco", "medias_outdoor_blanco.png"),
                ], available_sizes=["S", "M", "L"],
                description="Medias tres cuartos respirables con refuerzo en talón y puntera, cómodas para uso diario, caminatas y actividades outdoor.",
                recommended_product_id=None,
            ),
            product(
                product_id="medias-formales-classic", name="Medias Formales Classic", category="Accesorios",
                subcategories=["medias", "formal", "hombre"], product_type="accesorio", price=12900, stock=45,
                color_images=[
                    ("Negro", "Imagen de ChatGPT 21 oct 2026, 15_44_52-1.png"),
                    ("Marrón", "Imagen de ChatGPT 21 oct 2026, 15_44_53-2.png"),
                    ("Azul marino", "Imagen de ChatGPT 21 oct 2026, 15_44_54-3.png"),
                    ("Beige", "Imagen de ChatGPT 21 oct 2026, 15_44_54-4.png"),
                ], available_sizes=["M", "L"],
                description="Medias lisas de vestir, finas y cómodas para zapatos formales y mocasines.",
                recommended_product_id=None,
            ),
            product(
                product_id="medias-cancan-elegance", name="Medias Cancan Elegance", category="Accesorios",
                subcategories=["medias cancan", "panty", "mujer"], product_type="accesorio", price=16900, stock=35,
                color_images=[
                    ("Negro", "Imagen de ChatGPT 21 oct 2026, 15_44_57-7.png"),
                    ("Nude", "Imagen de ChatGPT 21 oct 2026, 15_45_01-8.png"),
                    ("Grafito", "Imagen de ChatGPT 21 oct 2026, 15_45_02-9.png"),
                    ("Bordó", "Imagen de ChatGPT 21 oct 2026, 15_45_03-10.png"),
                ], available_sizes=["1", "2", "3", "4"],
                description="Medias cancan finas de terminación uniforme para combinar con tacos y calzado elegante.",
                recommended_product_id=None,
            ),
        ]
        self._products = {item.id: item for item in products}

    def search(self, category: str | None, size: int | None, max_price: int | None, limit: int) -> list[Product]:
        products = list(self._products.values())
        if category:
            query = self._normalize(category)
            products = [item for item in products if self._matches_category(item, query)]
        if size is not None:
            products = [item for item in products if str(size) in item.sizes]
        if max_price is not None:
            products = [item for item in products if item.price <= max_price]
        return products[:limit]

    def get_many(self, product_ids: list[str]) -> list[Product]:
        return [self._products[product_id] for product_id in product_ids if product_id in self._products]

    def get_by_id(self, product_id: str) -> Product | None:
        return self._products.get(product_id)

    @staticmethod
    def summary(item: Product, *, image_url: str | None = None, suggested_color: str | None = None) -> ProductSummary:
        return ProductSummary(
            id=item.id, name=item.name, category=item.category, price=item.price,
            currency=item.currency, stock=item.stock, image_url=image_url or item.image_url,
            subcategories=item.subcategories,
            product_type=item.product_type,
            suggested_color=suggested_color,
        )

    @staticmethod
    def _normalize(value: str) -> str:
        normalized = unicodedata.normalize("NFKD", value.strip().casefold())
        return " ".join("".join(character for character in normalized if not unicodedata.combining(character)).split())

    @classmethod
    def _matches_category(cls, item: Product, query: str) -> bool:
        category = cls._normalize(item.category)
        tags = {cls._normalize(value) for value in item.subcategories}
        name = cls._normalize(item.name)
        if any(term in query for term in ("media outdoor", "medias outdoor", "tres cuartos")):
            return item.product_type == "accesorio" and bool(tags & {"outdoor", "tres cuartos", "uso diario"})
        if any(term in query for term in ("cancan", "panty", "media formal", "media deportiva", "medias de futbol")):
            return item.product_type == "accesorio" and any(term in f"{name} {' '.join(tags)}" for term in query.split())
        if "stiletto" in query:
            return "stiletto" in tags
        if "oxford" in query or "zapatos de hombre" in query:
            return "zapatos de hombre" in tags
        if "mocasin" in query:
            return "mocasin" in tags
        if "sandalia" in query:
            return "sandalia" in tags
        if "taco" in query:
            return any("taco" in tag for tag in tags)
        if any(term in query for term in ("elegante", "formal", "vestir", "fiesta")):
            return category == "elegantes"
        if any(term in query for term in ("outdoor", "trail", "trekking", "senderismo", "montana")):
            return category == "outdoor"
        if query in {"botin", "botines"} or any(term in query for term in ("botin de futbol", "botines de futbol", "futbol", "tapones")):
            return item.product_type == "calzado" and "futbol" in tags
        if any(term in query for term in ("handball", "balonmano")):
            return item.product_type == "calzado" and "handball" in tags
        if "tenis" in query:
            return item.product_type == "calzado" and "tenis" in tags
        if any(term in query for term in ("running", "correr", "trote")):
            return item.product_type == "calzado" and "running" in tags
        if any(term in query for term in ("dia a dia", "urbano", "urbana", "casual", "lifestyle")):
            return bool(tags & {"casual", "urbano", "dia a dia"})
        if any(term in query for term in ("deporte", "deportivo", "deportiva", "entrenar", "entrenamiento")):
            return category == "deportivas"
        if any(term in query for term in ("zapatilla", "calzado", "todos", "todas", "todo")):
            return item.product_type == "calzado"
        haystack = " ".join((category, name, *tags))
        return query in haystack or any(token in haystack for token in query.split())


product_repository = ProductRepository()
