#!/usr/bin/env node
/**
 * Contrôle automatique des interdits de charte (brief §6 / §18).
 * Échoue (code 1) si un motif interdit apparaît dans src/ ou dans les styles.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const files = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(tsx?|css|mjs)$/.test(f)) files.push(p);
  }
})(path.join(root, "src"));

const ALLOWED_SPACING = new Set(["0", "px", "1", "2", "3", "4", "6", "8", "12", "16", "24", "32"]);
const rules = [
  { name: "dégradé", re: /gradient/i },
  { name: "texte en dégradé / background-clip", re: /bg-clip-text|background-clip\s*:\s*text/ },
  { name: "glassmorphism", re: /backdrop-blur|backdrop-filter/ },
  { name: "police interdite", re: /\b(Inter|Roboto|Poppins)\b(?!\w)/ },
  { name: "icônes Lucide / Heroicons", re: /lucide|heroicons/i },
  { name: "rayon > 6 px", re: /\brounded-(lg|xl|2xl|3xl)\b/ },
  { name: "grosse ombre floue", re: /\bshadow-(md|lg|xl|2xl)\b/ },
  { name: "liseré coloré de carte", re: /\bborder-(l|t)-(2|4|8)\b/ },
  { name: "curseur personnalisé", re: /cursor\s*:\s*url\(|cursor-\[url/ },
  { name: "mode sombre", re: /\bdark:(?=\S)|prefers-color-scheme:\s*dark/ },
  { name: "emoji", re: /\p{Extended_Pictographic}/u },
];

const issues = [];
for (const file of files) {
  const rel = path.relative(root, file);
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const r of rules) if (r.re.test(line)) issues.push(`${rel}:${i + 1}  [${r.name}]  ${line.trim().slice(0, 120)}`);
    // échelle d'espacement stricte : 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128
    for (const m of line.matchAll(/(?<![\w-])-?(?:p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|gap|gap-x|gap-y|space-x|space-y)-(\d+(?:\.\d+)?|px)(?![\w.\]])/g)) {
      if (!ALLOWED_SPACING.has(m[1])) issues.push(`${rel}:${i + 1}  [espacement hors échelle]  ${m[0]}`);
    }
  });
}

if (issues.length) {
  console.error(`✗ ${issues.length} écart(s) de charte :\n` + issues.join("\n"));
  process.exit(1);
}
console.log(`✓ Charte respectée (${files.length} fichiers contrôlés).`);
