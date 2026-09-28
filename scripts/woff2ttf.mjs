// Convertit un WOFF (1.0) en TTF/OTF brut : utilisé une fois pour préparer public/fonts (PDF).
import { readFileSync, writeFileSync } from "node:fs";
import { inflateSync } from "node:zlib";
for (const file of process.argv.slice(2)) {
  const b = readFileSync(file);
  if (b.toString("ascii", 0, 4) !== "wOFF") throw new Error(`${file} n'est pas un WOFF`);
  const flavor = b.readUInt32BE(4);
  const numTables = b.readUInt16BE(12);
  const tables = [];
  for (let i = 0; i < numTables; i++) {
    const o = 44 + i * 20;
    tables.push({ tag: b.toString("ascii", o, o + 4), offset: b.readUInt32BE(o + 4), compLength: b.readUInt32BE(o + 8), origLength: b.readUInt32BE(o + 12), checksum: b.readUInt32BE(o + 16) });
  }
  let entrySelector = Math.floor(Math.log2(numTables));
  const searchRange = 2 ** entrySelector * 16;
  const headerLen = 12 + numTables * 16;
  const datas = tables.map((t) => {
    const raw = b.subarray(t.offset, t.offset + t.compLength);
    return t.compLength < t.origLength ? inflateSync(raw) : Buffer.from(raw);
  });
  let total = headerLen;
  const offsets = datas.map((d) => {
    const off = total;
    total += (d.length + 3) & ~3;
    return off;
  });
  const out = Buffer.alloc(total);
  out.writeUInt32BE(flavor, 0);
  out.writeUInt16BE(numTables, 4);
  out.writeUInt16BE(searchRange, 6);
  out.writeUInt16BE(entrySelector, 8);
  out.writeUInt16BE(numTables * 16 - searchRange, 10);
  tables.forEach((t, i) => {
    const o = 12 + i * 16;
    out.write(t.tag, o, 4, "ascii");
    out.writeUInt32BE(t.checksum, o + 4);
    out.writeUInt32BE(offsets[i], o + 8);
    out.writeUInt32BE(datas[i].length, o + 12);
    datas[i].copy(out, offsets[i]);
  });
  writeFileSync(file.replace(/\.woff$/, ".ttf"), out);
  console.log(file, "→ ttf", out.length);
}
