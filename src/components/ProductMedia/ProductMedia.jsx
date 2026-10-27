import "./ProductMedia.css";

export default function ProductMedia({ product, className, decorative = false, imageUrl = product.imageUrl, videoUrl = product.videoUrl }) {
  if (videoUrl) {
    return (
      <video
        className={`${className} product-photo`}
        src={videoUrl}
        poster={imageUrl}
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
      src={imageUrl}
      alt={decorative ? "" : product.name}
    />
  );
}
