"use client";
import Image from "next/image";
import { useState } from "react";
import { cx } from "@/lib/cx";

/** Photo du site actuel (servie depuis Wix tant qu'elle n'est pas rapatriée) avec repli sobre. */
export function BrandPhoto({
  src,
  alt,
  caption,
  className,
  sizes = "(max-width: 1024px) 100vw, 50vw",
}: {
  src: string;
  alt: string;
  caption: string;
  className?: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className={cx("min-w-0", className)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-[12px] bg-salt">
        {failed ? (
          <p className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-ink/70">{caption}</p>
        ) : (
          <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" onError={() => setFailed(true)} />
        )}
      </div>
      <figcaption className="mt-3 text-sm text-ink/70">{caption}</figcaption>
    </figure>
  );
}
