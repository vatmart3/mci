#!/usr/bin/env node
/**
 * Rapatrie les visuels du site Wix actuel dans public/brand (pleine résolution, sans /v1/fill/…),
 * puis les optimise (WebP) — à lancer une fois depuis un poste ayant accès à static.wixstatic.com.
 * Tant que ces fichiers n'existent pas, le site sert les URL Wix d'origine via next/image.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = path.join(root, "public", "brand");
const assets = [
  { url: "https://static.wixstatic.com/media/5f3c99_744e3df679e84246bf38402171e14f26~mv2.jpg", file: "logo-original.jpg", note: "Logo d'origine (référence pour le SVG redessiné)" },
  { url: "https://static.wixstatic.com/media/5f3c99_12c79f4baa7440538df3e42286876a0f~mv2.png", file: "logo-rond.png", note: "Logo rond « MCI rondOK »" },
  { url: "https://static.wixstatic.com/media/5f3c99_96e31d7738644fd78cdcb7170e016621~mv2.jpg", file: "batiment.jpg", note: "Bâtiment / entrepôt (page Société)" },
  { url: "https://static.wixstatic.com/media/5f3c99_7c20170fe0b941ffb0ccd45c2b9c308b~mv2.png", file: "equipe.png", note: "Photo de l'équipe" },
  { url: "https://www.mci-sete.com/_files/ugd/5f3c99_fb1aa12efa1344659d2fd015674a1e45.pdf", file: "agrement-prefectoral.pdf", note: "Agrément préfectoral" },
];

await mkdir(out, { recursive: true });
for (const a of assets) {
  try {
    const res = await fetch(a.url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await writeFile(path.join(out, a.file), buf);
    if (/\.(jpe?g|png)$/.test(a.file)) {
      await sharp(buf).rotate().webp({ quality: 82 }).toFile(path.join(out, a.file.replace(/\.(jpe?g|png)$/, ".webp")));
    }
    console.log(`✓ ${a.file} — ${a.note}`);
  } catch (e) {
    console.error(`✗ ${a.file} : ${e.message} (${a.url})`);
  }
}
console.log("Terminé. Les pages Accueil et Société utilisent automatiquement les fichiers locaux s'ils existent.");
