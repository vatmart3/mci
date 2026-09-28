"use client";
import { useEffect } from "react";
import { useUI } from "@/lib/store/ui";

/**
 * Le seul effet systématique du site : le packshot vole en arc jusqu'au compteur
 * du bon de commande, qui rebondit à l'arrivée. Web Animations API, ~550 ms.
 */
export function FlyLayer() {
  const flights = useUI((s) => s.flights);
  const land = useUI((s) => s.land);

  useEffect(() => {
    for (const f of flights) {
      const node = document.getElementById(`flight-${f.id}`);
      if (!node || node.dataset.started) continue;
      node.dataset.started = "1";
      const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-cart-target]")).filter((t) => t.offsetParent !== null);
      const target = targets[0];
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (!target || reduce) {
        land(f.id);
        continue;
      }
      const t = target.getBoundingClientRect();
      const size = Math.min(96, Math.max(48, f.from.width));
      const x0 = f.from.left + f.from.width / 2 - size / 2;
      const y0 = f.from.top + f.from.height / 2 - size / 2;
      const x1 = t.left + t.width / 2 - size / 2;
      const y1 = t.top + t.height / 2 - size / 2;
      const lift = Math.min(160, Math.abs(y1 - y0) * 0.5 + 60);
      const frames: Keyframe[] = [];
      for (let i = 0; i <= 12; i++) {
        const k = i / 12;
        const x = x0 + (x1 - x0) * k;
        const y = y0 + (y1 - y0) * k - Math.sin(Math.PI * k) * lift;
        const s = 1 - 0.75 * k;
        frames.push({ transform: `translate(${x}px, ${y}px) scale(${s}) rotate(${-12 * k}deg)`, opacity: k > 0.9 ? 0 : 1 });
      }
      node.style.width = `${size}px`;
      node.style.height = `${size}px`;
      const anim = node.animate(frames, { duration: 560, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" });
      anim.onfinish = () => land(f.id);
    }
  }, [flights, land]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[80]">
      {flights.map((f) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={f.id} id={`flight-${f.id}`} src={f.image} alt="" className="absolute left-0 top-0 object-contain drop-shadow-[0_16px_24px_rgb(0_0_0/0.22)] will-change-transform" style={{ width: 0, height: 0 }} />
      ))}
    </div>
  );
}
