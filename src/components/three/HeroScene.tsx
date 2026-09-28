"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { Container, useFontsReady } from "./Container";
import { containerScale } from "./containers";
import { StageLights } from "./Stage";
import type { ShowcaseItem } from "./FloatingShowcase";

/**
 * Hero : la gamme posée en arc sur un sol studio. Le défilement (progress 0 → 1) fait tourner
 * l'ensemble, écarte les contenants et recule la caméra ; la souris / le gyroscope inclinent la scène.
 * Chaque contenant « respire » (légère flottaison) et tourne lentement sur lui-même.
 */
function Arc({ items, progress, pointer, still }: { items: ShowcaseItem[]; progress: RefObject<number>; pointer: RefObject<{ x: number; y: number }>; still: boolean }) {
  const root = useRef<THREE.Group>(null);
  const nodes = useRef<(THREE.Group | null)[]>([]);
  const { camera, viewport, size } = useThree();
  const narrow = size.width / size.height < 0.9;
  const n = items.length;

  const slots = useMemo(
    () =>
      items.map((_, i) => {
        const k = n === 1 ? 0 : i / (n - 1) - 0.5; // -0.5 … 0.5
        const spread = narrow ? 3.4 : Math.min(8.4, viewport.width * 0.82);
        return {
          x: k * spread,
          z: -Math.abs(k) * (narrow ? 1.2 : 2.2) + 0.4,
          yaw: -k * 0.9 + (i % 2 ? 0.25 : -0.25),
          phase: i * 1.37,
        };
      }),
    [items, n, narrow, viewport.width],
  );

  const intro = useRef(0);
  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 30);
    const t = state.clock.elapsedTime;
    const p = progress.current ?? 0;
    intro.current = Math.min(1, intro.current + dt * 0.7);
    const e = 1 - Math.pow(1 - intro.current, 3);
    items.forEach((it, i) => {
      const g = nodes.current[i];
      const s = slots[i];
      if (!g || !s) return;
      const scale = containerScale[it.kind] * (narrow ? 0.8 : 1.12) * (0.6 + 0.4 * e);
      g.scale.setScalar(scale);
      const lift = still ? 0 : Math.sin(t * 0.8 + s.phase) * 0.06;
      g.position.set(s.x * (1 + p * 0.45), -0.9 + lift - (1 - e) * 1.2 + p * 0.6, s.z - p * 1.2);
      g.rotation.y = s.yaw + (still ? 0 : t * 0.12 * (i % 2 ? 1 : -1)) + p * 1.6 * (i % 2 ? 1 : -1);
    });
    if (root.current) {
      const px = pointer.current?.x ?? 0;
      const py = pointer.current?.y ?? 0;
      root.current.rotation.y += (px * 0.18 + p * 0.35 - root.current.rotation.y) * Math.min(1, dt * 3);
      root.current.rotation.x += (py * 0.05 + p * 0.12 - root.current.rotation.x) * Math.min(1, dt * 3);
    }
    camera.position.z = (narrow ? 9 : 7.4) + p * 1.6;
    camera.position.y = 0.9 + p * 0.6;
    camera.lookAt(0, -0.1, 0);
  });

  return (
    <group ref={root}>
      {items.map((it, i) => (
        <group key={it.id} ref={(g) => void (nodes.current[i] = g)} scale={0.0001}>
          <Container kind={it.kind} label={it.label} center={false} />
        </group>
      ))}
    </group>
  );
}

export function HeroScene({ items, progress, still = false, active = true, className, onReady }: { items: ShowcaseItem[]; progress: RefObject<number>; still?: boolean; active?: boolean; className?: string; onReady?: () => void }) {
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
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0.6, 8], fov: 28 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance", toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        onCreated={() => window.setTimeout(() => onReady?.(), 300)}
      >
        <StageLights mood="light" floor={-0.9} />
        <Arc items={items} progress={progress} pointer={pointer} still={still} />
      </Canvas>
    </div>
  );
}
