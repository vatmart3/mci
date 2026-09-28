"use client";
/** WebGL disponible et appareil assez robuste pour une scène animée ? */
export function webglSupport(): "full" | "lite" | "none" {
  if (typeof window === "undefined") return "none";
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return "none";
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    return "none";
  }
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (nav.connection?.saveData) return "none";
  const cores = nav.hardwareConcurrency ?? 4;
  const mem = nav.deviceMemory ?? 4;
  if (cores <= 2 || mem <= 2) return "none";
  const small = window.matchMedia("(max-width: 767px)").matches;
  if (small || cores <= 4 || mem <= 4) return "lite";
  return "full";
}

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
