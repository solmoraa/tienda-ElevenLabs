import { useEffect, useState } from "react";
import "./ProductMedia.css";

export default function ProductMedia({ product, className, decorative = false, imageUrl = product.imageUrl, videoUrl = product.videoUrl, priority = false }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(false);
  }, [imageUrl, videoUrl]);

  const mediaClassName = `${className} product-photo ${isReady ? "product-photo--loaded" : "product-photo--loading"}`;

  if (videoUrl) {
    return (
      <video
        className={mediaClassName}
        src={videoUrl}
        poster={imageUrl}
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        onLoadedData={() => setIsReady(true)}
        aria-hidden={decorative || undefined}
        aria-label={decorative ? undefined : `Video de ${product.name}`}
      />
    );
  }

  return (
    <img
      className={mediaClassName}
      src={imageUrl}
      alt={decorative ? "" : product.name}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "low"}
      onLoad={() => setIsReady(true)}
      onError={() => setIsReady(true)}
    />
  );
}
