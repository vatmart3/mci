#!/usr/bin/env node
/**
 * Génère les packshots statiques (WebP 512 px, fond transparent) de chaque produit
 * à partir du système de packaging 3D procédural.
 *
 *   npm run render:packshots                 → lance un serveur Next temporaire
 *   PACKSHOT_BASE=http://localhost:3000 npm run render:packshots   → serveur existant
 *   npm run render:packshots -- dg90 cst     → seulement ces produits
 *
 * Chromium : Playwright (PLAYWRIGHT_CHROMIUM_PATH ou installation Playwright par défaut).
 */
import { spawn } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";
import sharp from "sharp";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = path.join(root, "public", "packshots");
const only = process.argv.slice(2);

async function slugs() {
  const src = await readFile(path.join(root, "supabase", "seed.sql"), "utf8").catch(() => "");
  const found = [...src.matchAll(/insert into public\.products \(id, slug[^)]*\) values \('[^']+', '([^']+)'/g)].map((m) => m[1]);
  if (!found.length) throw new Error("supabase/seed.sql introuvable : lancez d'abord `npm run seed:sql`.");
  return only.length ? found.filter((s) => only.includes(s)) : found;
}

async function waitFor(url, ms = 120000) {
  const t = Date.now();
  while (Date.now() - t < ms) {
    try {
      const r = await fetch(url);
      if (r.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Serveur injoignable : ${url}`);
}

const list = await slugs();
let base = process.env.PACKSHOT_BASE;
let server;
if (!base) {
  base = "http://localhost:3999";
  server = spawn("npx", ["next", "dev", "-p", "3999"], { cwd: root, stdio: "ignore" });
}
try {
  await waitFor(`${base}/packshot/${list[0]}`);
  const executablePath = process.env.PLAYWRIGHT_CHROMIUM_PATH || (existsSync("/opt/pw-browsers/chromium") ? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" : undefined);
  const browser = await chromium.launch({
    executablePath,
    args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  });
  const page = await browser.newPage({ viewport: { width: 512, height: 512 }, deviceScaleFactor: 1 });
  await mkdir(out, { recursive: true });
  for (const [i, slug] of list.entries()) {
    await page.goto(`${base}/packshot/${slug}`, { waitUntil: "networkidle" });
    await page.waitForFunction(() => window.__PACKSHOT_READY === true, null, { timeout: 60000 });
    const png = await page.screenshot({ omitBackground: true });
    await sharp(png).webp({ quality: 84, alphaQuality: 90, effort: 5 }).toFile(path.join(out, `${slug}.webp`));
    process.stdout.write(`\r${i + 1}/${list.length} ${slug.padEnd(40)}`);
  }
  await browser.close();
  console.log(`\nPackshots écrits dans public/packshots (${list.length}).`);
} finally {
  server?.kill("SIGTERM");
}
