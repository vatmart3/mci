import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const pub = (...p: string[]) => path.join(process.cwd(), "public", ...p);

export async function ogFonts() {
  const [display, mono] = await Promise.all([readFile(pub("fonts", "archivo-800-w118.ttf")), readFile(pub("fonts", "plex-mono-500.ttf"))]);
  return [
    { name: "Archivo", data: display, weight: 800 as const, style: "normal" as const },
    { name: "Plex", data: mono, weight: 500 as const, style: "normal" as const },
  ];
}

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
