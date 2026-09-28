"use client";
import Image from "next/image";
import { useState } from "react";

/** Photo du site actuel (servie depuis Wix tant qu'elle n'est pas rapatriée) avec repli sobre. */
export function BrandPhoto({ src, alt, caption, className }: { src: string; alt: string; caption: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <figure className={className}>
      <div className="relative aspect-[4/3] overflow-hidden bg-white tech-grid">
        {failed ? (
          <p className="t-mono absolute inset-0 grid place-items-center p-6 text-center text-xs text-ink/70">{caption.toUpperCase()}</p>
        ) : (
          <Image src={src} alt={alt} fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" onError={() => setFailed(true)} />
        )}
      </div>
      <figcaption className="t-mono mt-2 text-xs text-ink/70">{caption.toUpperCase()}</figcaption>
    </figure>
  );
}
