export default function AssistantProductMedia({ product, className, decorative = false }) {
  if (product.videoUrl) {
    return (
      <video
        className={`${className} product-photo`}
        src={product.videoUrl}
        poster={product.imageUrl}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        aria-hidden={decorative || undefined}
        aria-label={decorative ? undefined : `Video de ${product.name}`}
      />
    );
  }

  return (
    <img
      className={`${className} product-photo`}
      src={product.imageUrl}
      alt={decorative ? "" : product.name}
    />
  );
}
