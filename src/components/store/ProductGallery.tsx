"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export function ProductGallery({
  images,
  name,
}: {
  images: { url: string; alt: string }[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  if (images.length === 0) {
    return <div className="aspect-[3/4] rounded-2xl bg-ink/5" />;
  }
  const current = images[Math.min(active, images.length - 1)];

  return (
    <div>
      <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-ink/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.alt || name}
          className="h-full w-full object-cover"
        />
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {images.map((image, i) => (
            <button
              key={image.url + i}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "h-20 w-16 shrink-0 overflow-hidden rounded-lg border transition-colors",
                i === active ? "border-primary" : "border-transparent opacity-70 hover:opacity-100"
              )}
              aria-label={`Imagem ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
