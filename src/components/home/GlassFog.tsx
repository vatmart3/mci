"use client";
import { useEffect, useRef } from "react";

/**
 * « La vitre » : une buée légère recouvre la scène ; une raclette passe en diagonale (1,6 s)
 * et révèle les produits. Ensuite, on essuie la buée restante au doigt / au curseur ;
 * les zones essuyées se ré-embuent très lentement (8 s) sans jamais recouvrir le passage de la raclette.
 *
 * Rendu : texture de buée pré-calculée × masque basse résolution (lissé à l'agrandissement).
 * Aucune animation si prefers-reduced-motion (vitre déjà propre).
 */
const CELL = 8; // px écran par cellule de masque
const REFOG_SECONDS = 8;
const SWIPE_MS = 1600;

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function paintFog(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const r = rand(20150034);
  // voile de buée : blanc laiteux, plus clair que le fond, pour qu'on voie la vitre
  ctx.fillStyle = "rgba(250, 249, 246, 0.9)";
  ctx.fillRect(0, 0, w, h);
  // grain de condensation (fines taches grises)
  ctx.fillStyle = "rgba(14, 37, 51, 0.035)";
  for (let i = 0; i < (w * h) / 260; i++) ctx.fillRect(r() * w, r() * h, 1 + r() * 1.5, 1 + r() * 1.5);
  // nuages de condensation, plus denses en bas
  ctx.filter = "blur(18px)";
  for (let i = 0; i < 70; i++) {
    const y = h * Math.pow(r(), 0.7);
    ctx.fillStyle = r() > 0.5 ? `rgba(255,255,255,${0.35 + r() * 0.3})` : `rgba(213,220,224,${0.18 + r() * 0.2})`;
    ctx.beginPath();
    ctx.ellipse(r() * w, y, 60 + r() * 160, 30 + r() * 80, r() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.filter = "none";
  // micro-gouttelettes
  const drops = Math.round((w * h) / 900);
  for (let i = 0; i < drops; i++) {
    const x = r() * w;
    const y = r() * h;
    const rad = 0.4 + Math.pow(r(), 3) * 2.6;
    ctx.fillStyle = `rgba(255,255,255,${0.35 + r() * 0.35})`;
    ctx.beginPath();
    ctx.arc(x, y, rad, 0, Math.PI * 2);
    ctx.fill();
    if (rad > 1.6) {
      ctx.strokeStyle = "rgba(14,37,51,0.16)";
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.arc(x + 0.3, y + 0.4, rad, 0.2, Math.PI * 0.9);
      ctx.stroke();
    }
  }
  // traces de calcaire : fines auréoles et coulures sèches
  ctx.filter = "blur(0.6px)";
  for (let i = 0; i < 22; i++) {
    const x = r() * w;
    const y = r() * h;
    ctx.strokeStyle = `rgba(200,207,211,${0.18 + r() * 0.2})`;
    ctx.lineWidth = 0.6 + r() * 1.1;
    ctx.beginPath();
    if (r() > 0.8) {
      ctx.ellipse(x, y, 4 + r() * 10, 3 + r() * 7, r() * Math.PI, 0, Math.PI * 2);
    } else {
      ctx.moveTo(x, y);
      let px = x;
      let py = y;
      for (let k = 0; k < 6; k++) {
        px += (r() - 0.5) * 8;
        py += 10 + r() * 22;
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
  }
  ctx.filter = "none";
  return c;
}

export function GlassFog({ className, onSwiped }: { className?: string; onSwiped?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bladeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const blade = bladeRef.current;
    if (!canvas || !blade) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      canvas.style.display = "none";
      blade.style.display = "none";
      onSwiped?.();
      return;
    }
    const ctx = canvas.getContext("2d")!;
    let W = 0;
    let H = 0;
    let fog: HTMLCanvasElement | null = null;
    let mask = document.createElement("canvas");
    let mctx = mask.getContext("2d")!;
    let cols = 0;
    let rows = 0;
    let level = new Float32Array(0); // buée actuelle 0..1
    let target = new Float32Array(0); // niveau vers lequel la buée revient
    let img: ImageData | null = null;
    let raf = 0;
    let visible = true;
    let swipeStart = 0;
    let swiped = false;
    let last = performance.now();

    const setup = () => {
      const rect = canvas.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      canvas.width = W;
      canvas.height = H;
      fog = paintFog(W, H);
      const prevCols = cols;
      const prevRows = rows;
      const prevLevel = level;
      const prevTarget = target;
      cols = Math.ceil(W / CELL);
      rows = Math.ceil(H / CELL);
      mask = document.createElement("canvas");
      mask.width = cols;
      mask.height = rows;
      mctx = mask.getContext("2d")!;
      img = mctx.createImageData(cols, rows);
      level = new Float32Array(cols * rows).fill(1);
      target = new Float32Array(cols * rows).fill(1);
      if (prevCols && swiped) {
        // redimensionnement : on conserve l'état propre approximatif
        for (let y = 0; y < rows; y++)
          for (let x = 0; x < cols; x++) {
            const px = Math.min(prevCols - 1, Math.round((x / cols) * prevCols));
            const py = Math.min(prevRows - 1, Math.round((y / rows) * prevRows));
            level[y * cols + x] = prevLevel[py * prevCols + px] ?? 1;
            target[y * cols + x] = prevTarget[py * prevCols + px] ?? 1;
          }
      }
    };

    // Raclette : bande perpendiculaire à la diagonale, qui balaie du haut-gauche au bas-droite.
    const swipe = (p: number) => {
      const len = Math.hypot(W, H);
      const ux = W / len;
      const uy = H / len;
      const nx = -uy;
      const ny = ux;
      const along = -len * 0.06 + p * len * 1.1; // position de la lame sur la diagonale
      const halfWidth = len * 0.36; // largeur de raclette : les coins opposés restent embués
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const cx = x * CELL + CELL / 2;
          const cy = y * CELL + CELL / 2;
          const a = cx * ux + cy * uy;
          const b = (cx - W / 2) * nx + (cy - H / 2) * ny;
          const edge = halfWidth - Math.abs(b);
          if (a < along && edge > 0) {
            const soft = Math.min(1, edge / (CELL * 8));
            const i = y * cols + x;
            level[i] = Math.min(level[i]!, 1 - soft);
            target[i] = Math.min(target[i]!, 1 - soft);
          }
        }
      const lx = along * ux - halfWidth * nx;
      const ly = along * uy - halfWidth * ny;
      const angle = (Math.atan2(ny, nx) * 180) / Math.PI;
      blade.style.transform = `translate(${lx}px, ${ly}px) rotate(${angle}deg)`;
      blade.style.width = `${halfWidth * 2}px`;
      blade.style.opacity = p > 0.94 ? String(Math.max(0, (1 - p) / 0.06)) : "1";
    };

    const wipe = (px: number, py: number, radius: number) => {
      const r = radius / CELL;
      const cx = px / CELL;
      const cy = py / CELL;
      for (let y = Math.max(0, Math.floor(cy - r)); y < Math.min(rows, Math.ceil(cy + r)); y++)
        for (let x = Math.max(0, Math.floor(cx - r)); x < Math.min(cols, Math.ceil(cx + r)); x++) {
          const d = Math.hypot(x + 0.5 - cx, y + 0.5 - cy) / r;
          if (d < 1) {
            const i = y * cols + x;
            level[i] = Math.min(level[i]!, d * d);
          }
        }
      wake();
    };

    const draw = () => {
      if (!fog || !img) return;
      const data = img.data;
      for (let i = 0; i < level.length; i++) {
        data[i * 4 + 3] = Math.round(level[i]! * 255);
      }
      mctx.putImageData(img, 0, 0);
      ctx.globalCompositeOperation = "copy";
      ctx.drawImage(fog, 0, 0);
      ctx.globalCompositeOperation = "destination-in";
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(mask, 0, 0, W, H);
      ctx.globalCompositeOperation = "source-over";
    };

    const frame = (now: number) => {
      raf = 0;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      let busy = false;
      if (!swiped) {
        const p = Math.min(1, (now - swipeStart) / SWIPE_MS);
        const eased = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
        swipe(eased);
        busy = true;
        if (p >= 1) {
          swiped = true;
          blade.style.opacity = "0";
          onSwiped?.();
        }
      }
      // ré-embuage lent vers le niveau cible
      const step = dt / REFOG_SECONDS;
      for (let i = 0; i < level.length; i++) {
        const l = level[i]!;
        const t = target[i]!;
        if (l < t) {
          level[i] = Math.min(t, l + step);
          busy = true;
        }
      }
      draw();
      if (busy && visible) raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (!raf && visible) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    setup();
    draw();
    // ?vitre=0.5 : fige la raclette à mi-course (contrôle visuel)
    const freeze = new URLSearchParams(window.location.search).get("vitre");
    if (freeze !== null) {
      swipe(Math.min(1, Math.max(0, Number(freeze))));
      draw();
      return;
    }
    // la raclette part après une courte respiration
    const startTimer = window.setTimeout(() => {
      swipeStart = performance.now();
      wake();
    }, 350);

    const host = canvas.parentElement!;
    let lastPt: { x: number; y: number } | null = null;
    const onMove = (e: PointerEvent) => {
      if (!swiped) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const radius = e.pointerType === "touch" ? 54 : 70;
      if (lastPt) {
        const steps = Math.ceil(Math.hypot(x - lastPt.x, y - lastPt.y) / (radius / 3));
        for (let s = 1; s <= steps; s++) wipe(lastPt.x + ((x - lastPt.x) * s) / steps, lastPt.y + ((y - lastPt.y) * s) / steps, radius);
      } else wipe(x, y, radius);
      lastPt = { x, y };
    };
    const onLeave = () => (lastPt = null);
    host.addEventListener("pointermove", onMove, { passive: true });
    host.addEventListener("pointerleave", onLeave);
    const ro = new ResizeObserver(() => {
      setup();
      draw();
      wake();
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = !!e?.isIntersecting;
      if (visible) wake();
    });
    io.observe(canvas);
    const onVis = () => {
      visible = document.visibilityState === "visible";
      if (visible) wake();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.clearTimeout(startTimer);
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [onSwiped]);

  return (
    <>
      <canvas ref={canvasRef} className={className} aria-hidden="true" />
      {/* La raclette : lame caoutchouc + monture, dessinée au trait */}
      <div ref={bladeRef} aria-hidden="true" className="pointer-events-none absolute left-0 top-0 h-0 origin-left" style={{ opacity: 0 }}>
        <div className="absolute left-0 right-0 -top-[3px] h-[6px] rounded-tech bg-ink" />
        <div className="absolute left-[8%] right-[8%] top-[3px] h-[9px] rounded-tech border border-ink bg-mci" />
        <div className="absolute left-1/2 top-[12px] h-[56px] w-[10px] -translate-x-1/2 rounded-tech border border-ink bg-white" />
      </div>
    </>
  );
}
