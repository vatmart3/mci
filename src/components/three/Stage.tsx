"use client";
import { ContactShadows, Environment, Lightformer } from "@react-three/drei";

/**
 * Éclairages de scène « produit » (aucune HDR téléchargée : des panneaux lumineux virtuels).
 * light : studio blanc, reflets longs et doux (fonds clairs).
 * night : contre-jours bleus et orangés, reflets de bord francs (sections sombres).
 */
export function StageLights({ mood = "light", shadow = true, floor = -1.05 }: { mood?: "light" | "night"; shadow?: boolean; floor?: number }) {
  const night = mood === "night";
  return (
    <>
      <ambientLight intensity={night ? 0.15 : 0.4} />
      <directionalLight position={[3, 6, 5]} intensity={night ? 0.9 : 1.6} color={night ? "#dbeeff" : "#fff6ea"} />
      <spotLight position={[-6, 3, -4]} angle={0.5} penumbra={1} intensity={night ? 60 : 12} color={night ? "#4aa3e0" : "#cfe6f7"} />
      <spotLight position={[6, 2, -3]} angle={0.5} penumbra={1} intensity={night ? 45 : 8} color={night ? "#f89746" : "#ffe3cc"} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={night ? 1.2 : 2.6} color="#ffffff" position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={night ? 3 : 1.4} color={night ? "#4aa3e0" : "#e7f0f6"} position={[-6, 1, 0]} rotation-y={Math.PI / 2} scale={[1.2, 8, 1]} />
        <Lightformer form="rect" intensity={night ? 2.4 : 1.2} color={night ? "#f89746" : "#ffffff"} position={[6, 1, -1]} rotation-y={-Math.PI / 2} scale={[1.2, 8, 1]} />
        <Lightformer form="rect" intensity={night ? 0.3 : 0.9} color={night ? "#0a2233" : "#f5f5f7"} position={[0, -4, 0]} rotation-x={-Math.PI / 2} scale={[12, 12, 1]} />
        <Lightformer form="ring" intensity={night ? 1.5 : 2} color="#ffffff" position={[2.5, 3, 5]} scale={1.6} />
      </Environment>
      {shadow ? <ContactShadows position={[0, floor, 0]} opacity={night ? 0.7 : 0.38} scale={14} blur={2.6} far={4} resolution={512} color={night ? "#000000" : "#0a2233"} /> : null}
    </>
  );
}
