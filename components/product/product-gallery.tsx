"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [active, setActive] = React.useState(0);
  const [zoom, setZoom] = React.useState({ on: false, x: 50, y: 50 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoom({
      on: true,
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row md:gap-4">
      {/* Thumbnails */}
      <div className="flex gap-3 md:flex-col">
        {images.map((img, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            onMouseEnter={() => setActive(i)}
            className={cn(
              "relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-muted md:w-20",
              active === i ? "ring-1 ring-foreground" : "opacity-70 hover:opacity-100"
            )}
            aria-label={`View image ${i + 1}`}
          >
            <Image src={img.thumb} alt="" fill sizes="80px" className="object-cover" />
          </button>
        ))}
      </div>

      {/* Main image */}
      <div
        className="relative aspect-[4/5] w-full cursor-zoom-in overflow-hidden bg-muted"
        onMouseMove={onMove}
        onMouseLeave={() => setZoom((z) => ({ ...z, on: false }))}
      >
        <Image
          src={images[active].url}
          alt={images[active].alt}
          fill
          priority
          sizes="(min-width:1024px) 50vw, 100vw"
          className="object-cover transition-transform duration-200 ease-out"
          style={{
            transform: zoom.on ? "scale(1.7)" : "scale(1)",
            transformOrigin: `${zoom.x}% ${zoom.y}%`,
          }}
        />
      </div>
    </div>
  );
}
