"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { ContainerKind, Product } from "@/lib/types";
import { Container, labelFor, useFontsReady } from "./Container";
import { StudioLights } from "./Studio";
import { packshotYaw } from "./PackshotStudio";
import { webglSupport, prefersReducedMotion } from "@/lib/webgl";

/** Rotation au glisser (inertie amortie), léger zoom à la molette / pincement. frameloop="demand". */
function DragRotate({ children, yaw0 }: { children: React.ReactNode; yaw0: number }) {
  const ref = useRef<THREE.Group>(null);
  const { gl, invalidate, camera } = useThree();
  const state = useRef({ yaw: yaw0, pitch: 0, vy: 0, vp: 0, dragging: false, lx: 0, ly: 0, zoom: 1, targetZoom: 1 });

  useEffect(() => {
    const el = gl.domElement;
    const s = state.current;
    const down = (e: PointerEvent) => {
      s.dragging = true;
      s.lx = e.clientX;
      s.ly = e.clientY;
      el.setPointerCapture(e.pointerId);
      invalidate();
    };
    const move = (e: PointerEvent) => {
      if (!s.dragging) return;
      s.vy = (e.clientX - s.lx) * 0.012;
      s.vp = (e.clientY - s.ly) * 0.006;
      s.yaw += s.vy;
      s.pitch = THREE.MathUtils.clamp(s.pitch + s.vp, -0.35, 0.35);
      s.lx = e.clientX;
      s.ly = e.clientY;
      invalidate();
    };
    const up = () => {
      s.dragging = false;
      invalidate();
    };
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return; // ne détourne pas le scroll de page
      e.preventDefault();
      s.targetZoom = THREE.MathUtils.clamp(s.targetZoom - e.deltaY * 0.002, 0.85, 1.35);
      invalidate();
    };
    const dbl = () => {
      s.targetZoom = s.targetZoom > 1.05 ? 1 : 1.3;
      invalidate();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("dblclick", dbl);
    el.style.touchAction = "pan-y";
    el.style.cursor = "grab";
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("dblclick", dbl);
    };
  }, [gl, invalidate]);

  useFrame((_, dt) => {
    const s = state.current;
    const g = ref.current;
    if (!g) return;
    let moving = false;
    if (!s.dragging) {
      s.vy *= Math.pow(0.04, dt);
      s.yaw += s.vy;
      s.pitch += (0 - s.pitch) * Math.min(1, dt * 4);
      moving = Math.abs(s.vy) > 0.0005 || Math.abs(s.pitch) > 0.001;
    }
    s.zoom += (s.targetZoom - s.zoom) * Math.min(1, dt * 8);
    if (Math.abs(s.targetZoom - s.zoom) > 0.001) moving = true;
    g.rotation.set(s.pitch, s.yaw, 0);
    (camera as THREE.PerspectiveCamera).zoom = s.zoom;
    camera.updateProjectionMatrix();
    if (moving || s.dragging) invalidate();
  });

  return <group ref={ref}>{children}</group>;
}

/** Petite oscillation d'entrée pour signaler que l'objet se manipule. */
function Hint({ onReady }: { onReady?: () => void }) {
  const { invalidate } = useThree();
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      invalidate();
      onReady?.();
    });
    return () => cancelAnimationFrame(id);
  }, [invalidate, onReady]);
  return null;
}

export function ProductViewer3D({ product, container, onReady }: { product: Product; container: ContainerKind; onReady?: () => void }) {
  const fonts = useFontsReady();
  const [support, setSupport] = useState<"full" | "lite" | "none" | null>(null);
  useEffect(() => setSupport(webglSupport()), []);
  if (!support || support === "none" || !fonts) return null;
  const pack = product.packagings.find((p) => p.container === container) ?? product.packagings[0]!;
  const reduced = prefersReducedMotion();
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: [0, 0.3, 5.4], fov: 26 }} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}>
        <StudioLights />
        <DragRotate key={container} yaw0={packshotYaw[container] + (reduced ? 0 : 0)}>
          <Container kind={container} label={labelFor(product, pack.short)} quality={support === "lite" ? "low" : "high"} />
        </DragRotate>
        <ContactShadows position={[0, -1.02, 0]} opacity={0.3} scale={4} blur={2.4} far={1.6} resolution={256} color="#0E2533" frames={1} />
        <Hint onReady={onReady} />
      </Canvas>
    </div>
  );
}
