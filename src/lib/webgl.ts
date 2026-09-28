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

/**
 * Porte d'entrée de la 3D : sur appareil modeste / mobile, la scène WebGL ne démarre qu'à la
 * première interaction (toucher, défilement, clavier) ; sur poste fixe, dès que le navigateur
 * est inactif après le chargement. Les packshots statiques occupent la place en attendant.
 */
export function whenWebGLAllowed(mode: "full" | "lite", cb: () => void): () => void {
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    cleanup();
    cb();
  };
  const events = ["pointerdown", "touchstart", "keydown", "wheel", "scroll"] as const;
  let idle = 0;
  let timer = 0;
  const cleanup = () => {
    events.forEach((e) => window.removeEventListener(e, go));
    if (idle && "cancelIdleCallback" in window) window.cancelIdleCallback(idle);
    window.clearTimeout(timer);
  };
  events.forEach((e) => window.addEventListener(e, go, { once: true, passive: true }));
  if (mode === "full") {
    const start = () => {
      if ("requestIdleCallback" in window) idle = window.requestIdleCallback(go, { timeout: 2500 });
      else timer = globalThis.setTimeout(go, 1200) as unknown as number;
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
  }
  return cleanup;
}
