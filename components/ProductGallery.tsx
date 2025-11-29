'use client';

import Image from "next/image";
import { useMemo, useState } from "react";

interface ProductGalleryProps {
  images: string[];
  alt: string;
}

export default function ProductGallery({ images, alt }: ProductGalleryProps) {
  const fallbackImage =
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop";
  const galleryImages = useMemo(() => (images.length > 0 ? images : [fallbackImage]), [images]);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = galleryImages[Math.min(activeIndex, galleryImages.length - 1)];

  return (
    <div style={{ display: "grid", gap: "var(--space-3)" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "65%",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          border: "1px solid var(--gc-border)"
        }}
      >
        <Image
          src={activeImage}
          alt={alt}
          fill
          sizes="(max-width: 900px) 100vw, 640px"
          style={{ objectFit: "cover" }}
        />
      </div>

      {galleryImages.length > 1 ? (
        <div
          style={{
            display: "grid",
            gap: "var(--space-2)",
            gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))"
          }}
        >
          {galleryImages.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActiveIndex(index)}
              style={{
                position: "relative",
                paddingBottom: "70%",
                borderRadius: "var(--radius-sm)",
                overflow: "hidden",
                border: index === activeIndex ? "2px solid var(--gc-primary)" : "1px solid var(--gc-border)",
                cursor: "pointer"
              }}
              aria-label={`Voir l'image ${index + 1}`}
              aria-pressed={index === activeIndex}
            >
              <Image src={image} alt={`${alt} ${index + 1}`} fill style={{ objectFit: "cover" }} sizes="100px" loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
