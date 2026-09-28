#!/usr/bin/env node
/**
 * Contrôle automatique des interdits de charte (v2, refonte arrondie).
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

// Charte v2 (refonte « Apple ») : arrondis, dégradés, flous et ombres douces autorisés.
// Restent interdits : polices génériques, bibliothèques d'icônes, emojis, curseur perso, mode sombre auto.
const rules = [
  { name: "police interdite", re: /\b(Inter|Roboto|Poppins)\b(?!\w)/ },
  { name: "icônes Lucide / Heroicons", re: /lucide|heroicons/i },
  { name: "curseur personnalisé", re: /cursor\s*:\s*url\(|cursor-\[url/ },
  { name: "mode sombre automatique", re: /\bdark:(?=\S)|prefers-color-scheme:\s*dark/ },
  { name: "emoji", re: /\p{Extended_Pictographic}/u },
  { name: "Lorem ipsum", re: /lorem ipsum/i },
];

const issues = [];
for (const file of files) {
  const rel = path.relative(root, file);
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    for (const r of rules) if (r.re.test(line)) issues.push(`${rel}:${i + 1}  [${r.name}]  ${line.trim().slice(0, 120)}`);
  });
}

if (issues.length) {
  console.error(`✗ ${issues.length} écart(s) de charte :\n` + issues.join("\n"));
  process.exit(1);
}
console.log(`✓ Charte respectée (${files.length} fichiers contrôlés).`);
