/**
 * Étiquette produit générée dynamiquement (CanvasTexture) :
 * bandeau bleu MCI + soleil orange, code en Geist, famille, réf. mono, pictogramme.
 */
import * as THREE from "three";

export interface LabelInput {
  code: string;
  short: string;
  family: string;
  packShort: string;
  biocide?: boolean;
  /** proportions de l'étiquette (largeur / hauteur) */
  aspect: number;
  /** étiquette enveloppante (360°) : le contenu principal est centré face avant */
  wrap?: boolean;
}

const C = { mci: "#1F6A99", action: "#F89746", ink: "#1D1D1F", white: "#FFFFFF", rule: "#D2D2D7", salt: "#F5F5F7", warn: "#B7791F" };

function cssFont(varName: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  return v || fallback;
}

let fontsReady: Promise<void> | null = null;
export function ensureFonts(): Promise<void> {
  if (fontsReady) return fontsReady;
  const display = cssFont("--font-barlow-sc", "sans-serif");
  const mono = cssFont("--font-geist-mono", "monospace");
  const body = cssFont("--font-barlow", "sans-serif");
  fontsReady = Promise.all([
    document.fonts.load(`700 64px ${display}`),
    document.fonts.load(`500 24px ${mono}`),
    document.fonts.load(`500 24px ${body}`),
  ])
    .then(() => undefined)
    .catch(() => undefined);
  return fontsReady;
}

function fitText(ctx: CanvasRenderingContext2D, text: string, font: (size: number) => string, max: number, start: number, min = 18) {
  let size = start;
  ctx.font = font(size);
  while (ctx.measureText(text).width > max && size > min) {
    size -= 2;
    ctx.font = font(size);
  }
  return size;
}

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width > max && cur) {
      lines.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) lines.push(cur);
  return lines;
}

const cache = new Map<string, THREE.CanvasTexture>();

export function makeLabelTexture(input: LabelInput): THREE.CanvasTexture {
  const key = JSON.stringify(input);
  const hit = cache.get(key);
  if (hit) return hit;

  const H = 1024;
  const W = Math.round(Math.min(4096, Math.max(768, H * input.aspect)));
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const display = cssFont("--font-barlow-sc", "sans-serif");
  const mono = cssFont("--font-geist-mono", "monospace");
  const body = cssFont("--font-barlow", "sans-serif");

  // Pour les étiquettes enveloppantes (aérosol, cartouche), le contenu occupe la face avant.
  const wrapAround = input.wrap ?? input.aspect > 2.2;
  const cw = wrapAround ? Math.min(W * 0.32, H * 1.1) : W;
  const x0 = wrapAround ? W * 0.5 - cw / 2 : 0;
  const pad = Math.round(cw * 0.07);

  ctx.fillStyle = C.white;
  ctx.fillRect(0, 0, W, H);

  // Bandeau bleu MCI (pleine largeur)
  const band = Math.round(H * 0.2);
  ctx.fillStyle = C.mci;
  ctx.fillRect(0, 0, W, band);
  // Soleil orange + mot MCI
  ctx.fillStyle = C.action;
  ctx.beginPath();
  ctx.arc(x0 + pad + band * 0.28, band * 0.5, band * 0.26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = C.white;
  ctx.font = `800 ${Math.round(band * 0.46)}px ${display}`;
  ctx.textBaseline = "middle";
  ctx.fillText("MCI", x0 + pad + band * 0.66, band * 0.53);
  const mciEnd = x0 + pad + band * 0.66 + ctx.measureText("MCI").width;
  ctx.font = `500 ${Math.round(band * 0.2)}px ${mono}`;
  if (x0 + cw - pad - ctx.measureText("SÈTE").width > mciEnd + band * 0.3) {
    ctx.textAlign = "right";
    ctx.fillText("SÈTE", x0 + cw - pad, band * 0.53);
    ctx.textAlign = "left";
  }

  // Filet de repère
  ctx.fillStyle = C.rule;
  ctx.fillRect(x0 + pad, band + H * 0.05, cw - pad * 2, 2);

  // Code produit (nom commercial)
  ctx.fillStyle = C.ink;
  ctx.textBaseline = "alphabetic";
  const codeSize = fitText(ctx, input.code, (s) => `700 ${s}px ${display}`, cw - pad * 2, Math.round(H * 0.2), 28);
  const codeY = band + H * 0.1 + codeSize * 0.85;
  ctx.fillText(input.code, x0 + pad, codeY);

  // Désignation
  ctx.fillStyle = C.ink;
  ctx.font = `500 ${Math.round(H * 0.058)}px ${body}`;
  const lines = wrap(ctx, input.short, cw - pad * 2).slice(0, 2);
  lines.forEach((l, i) => ctx.fillText(l, x0 + pad, codeY + H * 0.085 * (i + 1)));

  // Famille (mono, capitales)
  ctx.fillStyle = C.mci;
  ctx.font = `500 ${Math.round(H * 0.042)}px ${mono}`;
  ctx.fillText(input.family.toUpperCase(), x0 + pad, H - pad * 1.9);

  // Réglette de pied : REF · CODE · CONDITIONNEMENT
  ctx.fillStyle = C.ink;
  ctx.fillRect(x0 + pad, H - pad * 1.35, cw - pad * 2, 2);
  ctx.font = `500 ${Math.round(H * 0.04)}px ${mono}`;
  const ref = `REF · ${input.code} · ${input.packShort}`;
  fitText(ctx, ref, (s) => `500 ${s}px ${mono}`, cw - pad * 2 - H * 0.12, Math.round(H * 0.04), 12);
  ctx.fillText(ref, x0 + pad, H - pad * 0.6);

  // Losange de danger discret pour les biocides
  if (input.biocide) {
    const s = H * 0.07;
    const cx = x0 + cw - pad - s * 0.7;
    const cy = H - pad * 2.05;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.strokeStyle = C.warn;
    ctx.lineWidth = 3;
    ctx.strokeRect(-s / 2, -s / 2, s, s);
    ctx.restore();
    ctx.fillStyle = C.warn;
    ctx.font = `700 ${Math.round(s * 0.6)}px ${body}`;
    ctx.textAlign = "center";
    ctx.fillText("!", cx, cy + s * 0.22);
    ctx.textAlign = "left";
  }

  // Pour les étiquettes enveloppantes : texte de dos (mono) discret
  if (wrapAround) {
    ctx.fillStyle = C.ink;
    ctx.globalAlpha = 0.55;
    ctx.font = `400 ${Math.round(H * 0.032)}px ${mono}`;
    const back = ["USAGE PROFESSIONNEL", "LIRE LA FICHE TECHNIQUE", "AVANT UTILISATION", "", "MCI SÈTE", "04 48 08 45 89"];
    back.forEach((t, i) => ctx.fillText(t, W * 0.04, band + H * 0.14 + i * H * 0.055));
    ctx.globalAlpha = 1;
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  cache.set(key, tex);
  return tex;
}
