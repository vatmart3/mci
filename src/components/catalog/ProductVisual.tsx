"use client";
import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/types";
import { Silhouette } from "@/components/three/Silhouette";
import { cx } from "@/lib/cx";

export function packshotSrc(p: Pick<Product, "slug" | "imageUrl">) {
  return p.imageUrl || `/packshots/${p.slug}.webp`;
}

/** Visuel produit : photo réelle (image_url) > packshot 3D pré-rendu > silhouette SVG. */
export function ProductVisual({
  product,
  size = 96,
  className,
  priority = false,
  sizes,
  alt,
}: {
  product: Pick<Product, "slug" | "imageUrl" | "container" | "code">;
  alt?: string;
  size?: number;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span className={cx("grid place-items-center text-mci", className)} style={{ width: size, height: size }}>
        <Silhouette kind={product.container} className="h-[80%] w-auto" />
      </span>
    );
  }
  return (
    <Image
      src={packshotSrc(product)}
      alt={alt ?? `Contenant ${product.code}`}
      width={size}
      height={size}
      sizes={sizes ?? `${size}px`}
      priority={priority}
      className={cx("object-contain", className)}
      onError={() => setFailed(true)}
      data-packshot
    />
  );
}
