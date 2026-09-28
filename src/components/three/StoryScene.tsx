"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { Container, useFontsReady } from "./Container";
import { containerScale } from "./containers";
import { StageLights } from "./Stage";
import type { ShowcaseItem } from "./FloatingShowcase";

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * Histoire défilée : un contenant par chapitre. Le défilement fait glisser le produit courant
 * hors champ en tournant tandis que le suivant entre — un carrousel 3D piloté par la molette.
 */
function Carousel({ items, progress, still }: { items: ShowcaseItem[]; progress: RefObject<number>; still: boolean }) {
  const nodes = useRef<(THREE.Group | null)[]>([]);
  const { size, camera } = useThree();
  const wide = size.width / size.height > 1.05;
  const n = items.length;
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = progress.current ?? 0;
    items.forEach((it, i) => {
      const g = nodes.current[i];
      if (!g) return;
      const d = (p - (i + 0.5) / n) * n; // 0 = chapitre au centre
      const v = smooth(0.8, 0.3, Math.abs(d));
      const s = containerScale[it.kind] * (wide ? 1.05 : 0.95) * (0.35 + 0.65 * v);
      g.visible = v > 0.001;
      g.scale.setScalar(Math.max(0.0001, s));
      g.position.set((wide ? 1.7 : 0) - d * (wide ? 2.4 : 1.6), (wide ? -0.05 : 1.15) + Math.sin(t * 0.9 + i) * (still ? 0 : 0.05) - Math.abs(d) * 0.3, -Math.abs(d) * 1.5);
      g.rotation.y = -0.45 + d * 2.4 + (still ? 0 : Math.sin(t * 0.35 + i) * 0.25);
      g.rotation.z = d * -0.2;
    });
    camera.position.set(0, 0.35, wide ? 7.2 : 9);
    camera.lookAt(wide ? 0.4 : 0, 0.1, 0);
  });
  return (
    <group>
      {items.map((it, i) => (
        <group key={it.id} ref={(g) => void (nodes.current[i] = g)} scale={0.0001}>
          <Container kind={it.kind} label={it.label} />
        </group>
      ))}
    </group>
  );
}

export function StoryScene({ items, progress, still = false, active = true, className }: { items: ShowcaseItem[]; progress: RefObject<number>; still?: boolean; active?: boolean; className?: string }) {
  const fonts = useFontsReady();
  if (!fonts) return null;
  return (
    <div className={className} aria-hidden="true">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.35, 7.2], fov: 30 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
      >
        <StageLights mood="night" floor={-1.2} />
        <Carousel items={items} progress={progress} still={still} />
      </Canvas>
    </div>
  );
}
