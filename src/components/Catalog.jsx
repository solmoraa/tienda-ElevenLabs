function ProductCard({ product }) {
  return (
    <article className="catalog-product">
      <div className={`product-image product-image--${product.accent}`} aria-hidden="true">
        <span>{product.icon}</span>
      </div>
      <div className="product-copy">
        <p>{product.category}</p>
        <h3>{product.name}</h3>
        <strong>{product.price}</strong>
        <button type="button">Ver producto</button>
      </div>
    </article>
  );
}

export default function Catalog({ products }) {
  return (
    <section className="catalog" id="coleccion" aria-labelledby="catalog-title">
      <div className="catalog-heading">
        <div>
          <p className="eyebrow">COLECCIÓN DESTACADA</p>
          <h2 id="catalog-title">Elegí a tu ritmo.</h2>
        </div>
        <p>Este catálogo sigue siendo independiente de las recomendaciones del asistente.</p>
      </div>
      <div className="product-grid">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
}
