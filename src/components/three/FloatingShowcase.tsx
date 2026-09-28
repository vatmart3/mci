"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { ContainerKind } from "@/lib/types";
import { Container, useFontsReady } from "./Container";
import { containerScale, type LabelSpec } from "./containers";
import { StudioLights } from "./Studio";

export interface ShowcaseItem {
  id: string;
  kind: ContainerKind;
  label: LabelSpec;
}

interface Body {
  id: string;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  anchor: THREE.Vector3;
  phase: number;
  spin: number;
  tilt: number;
  scale: number;
  target: number; // 1 = présent, 0 = en sortie
  radius: number;
}

/** Emplacements (fractions d'écran, depuis le haut-gauche) : nappe asymétrique à droite du titre. */
const HERO_SLOTS: [number, number][] = [
  [0.6, 0.2],
  [0.79, 0.15],
  [0.93, 0.34],
  [0.74, 0.42],
  [0.89, 0.6],
  [0.7, 0.7],
  [0.95, 0.8],
];
const HERO_SLOTS_FEW: [number, number][] = [
  [0.72, 0.25],
  [0.9, 0.46],
  [0.74, 0.66],
];
const HERO_SLOTS_NARROW: [number, number][] = [
  [0.2, 0.13],
  [0.5, 0.09],
  [0.8, 0.15],
  [0.36, 0.24],
  [0.66, 0.25],
];

function anchorsFor(n: number, layout: "hero" | "panel", vw: number, vh: number): THREE.Vector3[] {
  const out: THREE.Vector3[] = [];
  if (layout === "panel") {
    const cols = Math.min(n, 3);
    for (let i = 0; i < n; i++) {
      const row = Math.floor(i / cols);
      const col = i % cols;
      const inRow = Math.min(cols, n - row * cols);
      out.push(new THREE.Vector3((col - (inRow - 1) / 2) * 1.35 + (row % 2 ? 0.35 : 0), 0.9 - row * 1.9, (col % 2) * -0.4));
    }
    return out;
  }
  const narrow = vw / vh < 0.9;
  const slots = narrow ? HERO_SLOTS_NARROW : n <= 3 ? HERO_SLOTS_FEW : HERO_SLOTS;
  for (let i = 0; i < n; i++) {
    // pour peu d'objets, on répartit sur l'ensemble des emplacements
    const k = n >= slots.length ? i % slots.length : Math.round((i * (slots.length - 1)) / Math.max(1, n - 1));
    const [fx, fy] = slots[k]!;
    out.push(new THREE.Vector3((fx - 0.5) * vw, (0.5 - fy) * vh, -0.4 - ((i * 37) % 5) * 0.25));
  }
  return out;
}

function Bodies({ items, layout, still, pointer }: { items: ShowcaseItem[]; layout: "hero" | "panel"; still: boolean; pointer: React.RefObject<{ x: number; y: number }> }) {
  const { viewport, invalidate } = useThree();
  const vw = viewport.width;
  const vh = viewport.height;
  const narrow = vw / vh < 0.9;
  const bodies = useRef<Map<string, Body>>(new Map());
  const groups = useRef<Map<string, THREE.Group>>(new Map());
  const root = useRef<THREE.Group>(null);

  // Liste affichée = présents + sortants (conservés jusqu'à disparition)
  const shown = useRef<ShowcaseItem[]>([]);
  const ids = items.map((i) => i.id).join("|");
  const anchors = useMemo(() => anchorsFor(items.length, layout, vw, vh), [items.length, layout, vw, vh]);

  useMemo(() => {
    const map = bodies.current;
    items.forEach((it, i) => {
      const a = anchors[i]!;
      const existing = map.get(it.id);
      if (existing) {
        existing.anchor.copy(a);
        existing.target = 1;
      } else {
        const s = containerScale[it.kind];
        map.set(it.id, {
          id: it.id,
          pos: a.clone().add(new THREE.Vector3(0, layout === "panel" ? -1.2 : -0.4, 0)),
          vel: new THREE.Vector3(),
          anchor: a.clone(),
          phase: (i * 1.7) % (Math.PI * 2),
          spin: (i % 2 ? 1 : -1) * (0.08 + (i % 3) * 0.03),
          tilt: ((i % 5) - 2) * 0.06,
          scale: still || layout === "hero" ? 1 : 0,
          target: 1,
          radius: 0.55 * s,
        });
      }
    });
    for (const b of map.values()) if (!items.some((i) => i.id === b.id)) b.target = 0;
    const keep = shown.current.filter((s) => !items.some((i) => i.id === s.id) && (map.get(s.id)?.scale ?? 0) > 0.01);
    shown.current = [...items, ...keep];
    invalidate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids, anchors]);

  const tmp = useMemo(() => new THREE.Vector3(), []);
  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const t = state.clock.elapsedTime;
    const list = [...bodies.current.values()];
    for (const b of list) {
      // présence (ressort sur l'échelle)
      const k = b.target > b.scale ? 7 : 9;
      b.scale += (b.target - b.scale) * Math.min(1, dt * k);
      if (still) {
        b.pos.copy(b.anchor);
        continue;
      }
      // flottabilité : ancre qui ondule lentement, comme dans un liquide clair
      tmp.copy(b.anchor);
      tmp.y += Math.sin(t * 0.55 + b.phase) * 0.14;
      tmp.x += Math.cos(t * 0.35 + b.phase) * 0.06;
      // ressort vers l'ancre + amortissement visqueux
      b.vel.addScaledVector(tmp.sub(b.pos), dt * 2.2);
      b.vel.multiplyScalar(Math.pow(0.35, dt));
    }
    // répulsions douces entre contenants (petits rebonds)
    for (let i = 0; i < list.length; i++)
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]!;
        const b = list[j]!;
        const d = tmp.subVectors(a.pos, b.pos);
        d.z *= 0.5;
        const dist = d.length() || 0.001;
        const min = (a.radius + b.radius) * 1.15;
        if (dist < min) {
          const push = ((min - dist) / min) * dt * 3.5;
          d.normalize();
          a.vel.addScaledVector(d, push);
          b.vel.addScaledVector(d, -push);
        }
      }
    for (const b of list) {
      b.pos.addScaledVector(b.vel, dt * 1.6);
      const g = groups.current.get(b.id);
      if (!g) continue;
      g.position.copy(b.pos);
      const s = containerScale[shown.current.find((x) => x.id === b.id)?.kind ?? "can5"] * b.scale * (layout === "panel" ? 0.72 : narrow ? 0.5 : 0.62);
      g.scale.setScalar(Math.max(0.0001, s));
      if (!still) {
        g.rotation.y += b.spin * dt;
        g.rotation.z = b.tilt + Math.sin(t * 0.4 + b.phase) * 0.05;
        g.rotation.x = Math.cos(t * 0.3 + b.phase) * 0.05;
      }
    }
    // nettoyage des sortants
    for (const b of list) if (b.target === 0 && b.scale < 0.01) bodies.current.delete(b.id);
    // parallaxe (souris / gyroscope)
    if (root.current && pointer.current) {
      root.current.rotation.y += (pointer.current.x * 0.22 - root.current.rotation.y) * Math.min(1, dt * 3);
      root.current.rotation.x += (-pointer.current.y * 0.08 - root.current.rotation.x) * Math.min(1, dt * 3);
    }
  });

  return (
    <group ref={root}>
      {shown.current.map((it) => (
        <group
          key={it.id}
          ref={(g) => {
            if (g) groups.current.set(it.id, g);
            else groups.current.delete(it.id);
          }}
          scale={0.0001}
        >
          <Container kind={it.kind} label={it.label} quality={layout === "panel" ? "low" : "high"} />
        </group>
      ))}
    </group>
  );
}

/**
 * Scène de contenants en apesanteur. Utilisée par le hero et par la section Secteurs
 * (qui remplace les contenants par la sélection du secteur survolé).
 */
export function FloatingShowcase({
  items,
  layout = "hero",
  still = false,
  active = true,
  className,
}: {
  items: ShowcaseItem[];
  layout?: "hero" | "panel";
  still?: boolean;
  active?: boolean;
  className?: string;
}) {
  const fonts = useFontsReady();
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (still) return;
    const move = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const orient = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return;
      pointer.current.x = THREE.MathUtils.clamp(e.gamma / 30, -1, 1);
      pointer.current.y = THREE.MathUtils.clamp((e.beta - 45) / 30, -1, 1);
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("deviceorientation", orient, { passive: true });
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("deviceorientation", orient);
    };
  }, [still]);

  if (!fonts) return null;
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        frameloop={active ? (still ? "demand" : "always") : "never"}
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 9], fov: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      >
        <StudioLights />
        <Bodies items={items} layout={layout} still={still} pointer={pointer} />
      </Canvas>
    </div>
  );
}
