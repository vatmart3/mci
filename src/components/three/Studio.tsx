"use client";
import { Environment, Lightformer } from "@react-three/drei";

/** Éclairage de studio local (aucune HDR téléchargée) : lumière blanche et chaude, façon Sète. */
export function StudioLights({ intensity = 1, shadows = false }: { intensity?: number; shadows?: boolean }) {
  return (
    <>
      <ambientLight intensity={0.35 * intensity} color="#FFF8EE" />
      <directionalLight
        position={[3, 5, 4]}
        intensity={1.7 * intensity}
        color="#FFF4E4"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <directionalLight position={[-4, 2, -2]} intensity={0.45 * intensity} color="#DDEBF5" />
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#FFF6EA" position={[0, 4, 3]} scale={[8, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#E7F0F6" position={[-5, 1, 0]} rotation-y={Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={0.9} color="#FFFFFF" position={[5, 1, -1]} rotation-y={-Math.PI / 2} scale={[6, 4, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#F3F1EC" position={[0, -3, 0]} rotation-x={Math.PI / 2} scale={[10, 10, 1]} />
        <Lightformer form="ring" intensity={1.4} color="#FFFFFF" position={[2, 3, 4]} scale={2} />
      </Environment>
    </>
  );
}
