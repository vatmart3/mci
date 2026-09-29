import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import fontkit from "@pdf-lib/fontkit";

const pub = (...p: string[]) => path.join(process.cwd(), "public", ...p);

/** Tokens v3 (DESIGN.md) utilisés par les images Open Graph. */
export const og = {
  mci: "#1f6a99",
  ink: "#16232d",
  sky: "#cfe3f1",
  salt: "#f3f6f8",
  rule: "#d5dde3",
  white: "#ffffff",
  /** Barlow Semi Condensed : titres, codes produit, libellés */
  display: "Barlow Semi Condensed",
  /** Barlow : texte */
  body: "Barlow",
} as const;

/** Charte v3 : Barlow Semi Condensed 700 / 600 (titres, codes, libellés) et Barlow 400 (texte). */
export async function ogFonts() {
  const [sc700, sc600, body] = await Promise.all([
    readFile(pub("fonts", "barlow-sc-700.ttf")),
    readFile(pub("fonts", "barlow-sc-600.ttf")),
    readFile(pub("fonts", "barlow-400.ttf")),
  ]);
  return [
    { name: og.display, data: sc700, weight: 700 as const, style: "normal" as const },
    { name: og.display, data: sc600, weight: 600 as const, style: "normal" as const },
    { name: og.body, data: body, weight: 400 as const, style: "normal" as const },
  ];
}

/** Taille (px) pour qu'un texte en Barlow Semi Condensed 700 (interlettrage `tracking` en em) tienne sur `maxWidth`, bornée à [min, max]. */
export async function fitDisplaySize(text: string, maxWidth: number, max: number, min: number, tracking = 0): Promise<number> {
  const font = fontkit.create(new Uint8Array(await readFile(pub("fonts", "barlow-sc-700.ttf"))));
  const em = font.layout(text).advanceWidth / font.unitsPerEm + [...text].length * tracking;
  return em > 0 ? Math.max(min, Math.min(max, Math.floor(maxWidth / em))) : max;
}

/** La copie du site utilise l'espace fine insécable (U+202F), absente de Barlow : on la remplace par l'espace insécable. */
export const ogText = (t: string) => t.replace(/\u202F/g, "\u00A0");

/** Packshot WebP → PNG data URL (Satori ne lit pas le WebP). */
export async function packshotDataUrl(slug: string, size = 520): Promise<string | null> {
  try {
    const buf = await readFile(pub("packshots", `${slug}.webp`));
    const png = await sharp(buf).resize(size, size).png().toBuffer();
    return `data:image/png;base64,${png.toString("base64")}`;
  } catch {
    return null;
  }
}
