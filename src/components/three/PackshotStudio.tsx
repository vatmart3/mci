"use client";
import { Canvas, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useEffect } from "react";
import type { ContainerKind, Product } from "@/lib/types";
import { Container, labelFor, useFontsReady } from "./Container";
import * as THREE from "three";
import { StageLights } from "./Stage";

/** orientation 3/4 pour les volumes anguleux, face avant pour les étiquettes cylindriques */
export const packshotYaw: Record<ContainerKind, number> = { aerosol: 0, spray: 0, cartridge: 0, bucket: 0, can5: -0.42, jerrican20: -0.42 };

function Ready() {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    // deux images pour laisser l'environnement et les textures se poser
    let n = 0;
    const tick = () => {
      gl.render(scene, camera);
      if (++n < 3) requestAnimationFrame(tick);
      else (window as Window & { __PACKSHOT_READY?: boolean }).__PACKSHOT_READY = true;
    };
    requestAnimationFrame(tick);
  }, [gl, scene, camera]);
  return null;
}

export function PackshotStudio({ product, packId }: { product: Product; packId?: string }) {
  const fonts = useFontsReady();
  const pack = product.packagings.find((p) => p.id === packId) ?? product.packagings[0]!;
  const kind = pack.container;
  return (
    <Canvas
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
      dpr={1}
      camera={{ position: [0, 0.35, 5.2], fov: 26 }}
      onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      frameloop="demand"
    >
      <StageLights mood="light" shadow={false} />
      {fonts ? (
        <>
          <group rotation={[0, packshotYaw[kind], 0]} position={[0, 0.05, 0]}>
            <Container kind={kind} label={labelFor(product, pack.short)} />
          </group>
          <ContactShadows position={[0, -1.02, 0]} opacity={0.32} scale={4} blur={2.4} far={1.6} resolution={256} color="#0A2233" frames={1} />
          <Ready />
        </>
      ) : null}
    </Canvas>
  );
}
