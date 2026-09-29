/**
 * Bon de commande / pro-forma en PDF (pdf-lib), en-tête MCI.
 * Utilisable côté navigateur (téléchargement) comme côté serveur (pièce jointe).
 */
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import type { Order } from "@/lib/types";
import { company } from "@/data/company";
import { statusLabels, orderTotal } from "@/lib/orders";
import { formatDate, formatEur } from "@/lib/format";

export type PdfKind = "bon" | "proforma";

export interface PdfFonts {
  display: Uint8Array;
  body: Uint8Array;
  bodyBold: Uint8Array;
  mono: Uint8Array;
  monoMed: Uint8Array;
}

// Charte v3 : Barlow (texte) et Barlow Semi Condensed (titres, codes, numéros, chiffres).
const FONT_FILES: Record<keyof PdfFonts, string> = {
  display: "barlow-sc-700.ttf",
  body: "barlow-400.ttf",
  bodyBold: "barlow-600.ttf",
  mono: "barlow-sc-600.ttf",
  monoMed: "barlow-sc-700.ttf",
};

export async function fetchPdfFonts(base = ""): Promise<PdfFonts> {
  const entries = await Promise.all(
    (Object.keys(FONT_FILES) as (keyof PdfFonts)[]).map(async (k) => {
      const res = await fetch(`${base}/fonts/${FONT_FILES[k]}`);
      return [k, new Uint8Array(await res.arrayBuffer())] as const;
    }),
  );
  return Object.fromEntries(entries) as unknown as PdfFonts;
}

// tokens v3 (DESIGN.md)
const INK = rgb(0x16 / 255, 0x23 / 255, 0x2d / 255);
const MCI = rgb(0x1f / 255, 0x6a / 255, 0x99 / 255);
const ORANGE = rgb(0xf8 / 255, 0x97 / 255, 0x46 / 255);
const RULE = rgb(0xd5 / 255, 0xdd / 255, 0xe3 / 255);
// niveau secondaire : encre à ~72 % sur blanc
const MUTED = rgb((0x16 * 0.72 + 255 * 0.28) / 255, (0x23 * 0.72 + 255 * 0.28) / 255, (0x2d * 0.72 + 255 * 0.28) / 255);

function wrapText(text: string, font: PDFFont, size: number, max: number): string[] {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (font.widthOfTextAtSize(t, size) > max && cur) {
      out.push(cur);
      cur = w;
    } else cur = t;
  }
  if (cur) out.push(cur);
  return out;
}

function logo(page: PDFPage, x: number, y: number, s: number) {
  // mêmes tracés que public/brand/logo-mci.svg (repère 48 × 48, y vers le bas)
  page.drawCircle({ x: x + 27 * s, y: y - 19 * s, size: 11 * s, color: ORANGE });
  page.drawSvgPath("M3 31.5c5.2-5.6 10.6-5.6 15.8 0s10.6 5.6 15.8 0c3.9-4.2 7.8-5.2 11.4-3", { x, y, scale: s, borderColor: MCI, borderWidth: 5, borderLineCap: 1 });
  page.drawSvgPath("M9 40c4-3.6 8-3.6 12 0s8 3.6 12 0c2.8-2.5 5.4-3.2 8-2.2", { x, y, scale: s, borderColor: MCI, borderWidth: 3, borderLineCap: 1 });
}

export async function buildOrderPdf(order: Order, kind: PdfKind, fonts: PdfFonts, opts: { demo?: boolean } = {}): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  doc.setTitle(`${kind === "proforma" ? "Pro-forma" : "Bon de commande"} ${order.number} — MCI Sète`);
  doc.setAuthor("MCI Sète");
  doc.setCreator("mci-sete.com");
  // chiffres tabulaires pour les codes, numéros et montants (règle « Code-Is-Data »)
  const tnum = { tnum: true };
  const F = {
    display: await doc.embedFont(fonts.display, { subset: true }),
    body: await doc.embedFont(fonts.body, { subset: true }),
    bold: await doc.embedFont(fonts.bodyBold, { subset: true }),
    mono: await doc.embedFont(fonts.mono, { subset: true, features: tnum }),
    monoMed: await doc.embedFont(fonts.monoMed, { subset: true, features: tnum }),
  };
  // la copie du site utilise l'espace fine insécable (U+202F), absente de Barlow : on la remplace par l'espace insécable
  for (const f of Object.values(F)) {
    const enc = f.encodeText.bind(f);
    const width = f.widthOfTextAtSize.bind(f);
    f.encodeText = (t: string) => enc(t.replace(/\u202F/g, "\u00A0"));
    f.widthOfTextAtSize = (t: string, size: number) => width(t.replace(/\u202F/g, "\u00A0"), size);
  }
  const W = 595.28;
  const H = 841.89;
  const M = 42;
  let page = doc.addPage([W, H]);
  let y = H - M;

  const text = (t: string, x: number, yy: number, font: PDFFont, size: number, color = INK) => page.drawText(t, { x, y: yy, size, font, color });
  const right = (t: string, xr: number, yy: number, font: PDFFont, size: number, color = INK) => text(t, xr - font.widthOfTextAtSize(t, size), yy, font, size, color);

  const header = () => {
    logo(page, M, y + 6, 0.9);
    text("MCI", M + 50, y - 20, F.display, 24, MCI);
    text("SÈTE", M + 51, y - 32, F.mono, 8);
    const title = kind === "proforma" ? "FACTURE PRO-FORMA" : "BON DE COMMANDE";
    right(title, W - M, y - 14, F.display, 19);
    right(`N° ${order.number}`, W - M, y - 30, F.monoMed, 11, MCI);
    right(`Date : ${formatDate(order.createdAt)}   ·   Statut : ${statusLabels[order.status]}`, W - M, y - 43, F.mono, 8, MUTED);
    y -= 58;
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1.5, color: INK });
    y -= 18;
  };
  header();

  if (opts.demo) {
    text("DOCUMENT DE DÉMONSTRATION — SANS VALEUR COMMERCIALE", M, y, F.monoMed, 8.5, ORANGE);
    y -= 16;
  }

  // Blocs client / livraison
  const colW = (W - M * 2 - 20) / 2;
  const block = (label: string, lines: string[], x: number, top: number) => {
    let yy = top;
    text(label, x, yy, F.mono, 8, MUTED);
    yy -= 13;
    for (const l of lines.filter(Boolean)) {
      for (const w of wrapText(l, F.body, 9.5, colW)) {
        text(w, x, yy, F.body, 9.5);
        yy -= 12.5;
      }
    }
    return yy;
  };
  const c = order.customer;
  const d = order.delivery;
  const yA = block(
    "CLIENT",
    [c.company, `SIRET ${c.siret}`, `${c.contactName} · ${c.phone}`, c.email, order.poNumber ? `N° commande / engagement : ${order.poNumber}` : "", order.chorus ? `Chorus Pro${order.chorusServiceCode ? ` — code service ${order.chorusServiceCode}` : ""}` : ""],
    M,
    y,
  );
  const yB = block(
    "LIVRAISON",
    [d.company ?? c.company, d.line1, d.line2 ?? "", `${d.postalCode} ${d.city}`, d.accessNotes ? `Accès : ${d.accessNotes}` : "", order.deliverySlots ? `Créneaux : ${order.deliverySlots}` : ""],
    M + colW + 20,
    y,
  );
  y = Math.min(yA, yB) - 6;
  if (order.billing) {
    const b = order.billing;
    y = block("FACTURATION", [b.company ?? "", b.line1, b.line2 ?? "", `${b.postalCode} ${b.city}`], M, y) - 6;
  }

  // Tableau des lignes
  const priced = order.lines.some((l) => l.unitPriceHt != null);
  const cols = priced ? { ref: M, des: M + 108, pack: M + 290, qty: W - M - 120, pu: W - M - 60, tot: W - M } : { ref: M, des: M + 108, pack: M + 330, qty: W - M, pu: 0, tot: 0 };
  const tableHead = () => {
    y -= 8;
    page.drawLine({ start: { x: M, y: y + 12 }, end: { x: W - M, y: y + 12 }, thickness: 1, color: INK });
    text("RÉF.", cols.ref, y, F.mono, 8, MUTED);
    text("DÉSIGNATION", cols.des, y, F.mono, 8, MUTED);
    text("CONDITIONNEMENT", cols.pack, y, F.mono, 8, MUTED);
    right("QTÉ", cols.qty, y, F.mono, 8, MUTED);
    if (priced) {
      right("PU HT", cols.pu, y, F.mono, 8, MUTED);
      right("TOTAL HT", cols.tot, y, F.mono, 8, MUTED);
    }
    y -= 8;
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.75, color: INK });
    y -= 14;
  };
  tableHead();
  for (const l of order.lines) {
    const des = wrapText(l.name, F.body, 9, cols.pack - cols.des - 10);
    const packLines = wrapText(l.packagingLabel, F.body, 9, (priced ? cols.qty - 40 : cols.qty - 40) - cols.pack);
    const rowH = Math.max(des.length, packLines.length) * 12 + (l.note ? 11 : 0) + 8;
    if (y - rowH < 110) {
      page = doc.addPage([W, H]);
      y = H - M;
      header();
      tableHead();
    }
    // les codes longs (ex. INSECTICIDE TERRE DE DIATOMÉE) sont réduits pour tenir dans leur colonne
    const codeSize = Math.min(9.5, (cols.des - cols.ref - 8) / F.monoMed.widthOfTextAtSize(l.code, 1));
    text(l.code, cols.ref, y, F.monoMed, codeSize, MCI);
    des.forEach((t, i) => text(t, cols.des, y - i * 12, F.body, 9));
    packLines.forEach((t, i) => text(t, cols.pack, y - i * 12, F.body, 9));
    right(String(l.quantity), cols.qty, y, F.monoMed, 9.5);
    if (priced) {
      right(l.unitPriceHt != null ? formatEur(l.unitPriceHt) : "—", cols.pu, y, F.mono, 9);
      right(l.unitPriceHt != null ? formatEur(l.unitPriceHt * l.quantity) : "—", cols.tot, y, F.mono, 9);
    }
    let yy = y - Math.max(des.length, packLines.length) * 12;
    if (l.note) {
      text(`Note : ${l.note}`.slice(0, 110), cols.des, yy + 1, F.body, 7.5, MUTED);
      yy -= 11;
    }
    y = yy - 2;
    // pointillés
    for (let x = M; x < W - M; x += 4) page.drawLine({ start: { x, y: y + 4 }, end: { x: x + 1.2, y: y + 4 }, thickness: 0.5, color: RULE });
    y -= 10;
  }

  // Totaux
  const total = orderTotal(order);
  y -= 6;
  if (total != null) {
    right(`TOTAL HT  ${formatEur(total)}`, W - M, y, F.monoMed, 12);
    y -= 14;
    right("TVA et frais de port selon conditions en vigueur", W - M, y, F.body, 7.5, MUTED);
    y -= 16;
  } else {
    text("Prix et délai confirmés par MCI Sète à réception du bon de commande.", M, y, F.body, 9, MUTED);
    y -= 16;
  }
  if (order.leadTime) {
    text(`Délai : ${order.leadTime}`, M, y, F.bold, 9.5);
    y -= 14;
  }
  if (order.comment) {
    for (const t of wrapText(`Commentaire : ${order.comment}`, F.body, 9, W - M * 2)) {
      text(t, M, y, F.body, 9);
      y -= 12;
    }
  }
  if (kind === "proforma") {
    y -= 8;
    text("Pro-forma à valider par le client. Paiement : virement, facture à échéance ou mandat administratif.", M, y, F.body, 8.5, MUTED);
  }

  // Pied de page sur chaque page
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    p.drawLine({ start: { x: M, y: 58 }, end: { x: W - M, y: 58 }, thickness: 0.75, color: RULE });
    p.drawText(`${company.name} · ${company.street}, ${company.postalCode} ${company.city}`, { x: M, y: 44, size: 7.5, font: F.body, color: MUTED });
    p.drawText(`Tél. ${company.phone} · ${company.email} · mci-sete.com`, { x: M, y: 33, size: 7.5, font: F.body, color: MUTED });
    const pn = `${i + 1}/${pages.length}`;
    p.drawText(pn, { x: W - M - F.mono.widthOfTextAtSize(pn, 8), y: 33, size: 8, font: F.mono, color: MUTED });
  });

  return doc.save();
}

/** Côté navigateur : génère et télécharge. */
export async function downloadOrderPdf(order: Order, kind: PdfKind = "bon", opts: { demo?: boolean } = {}) {
  const fonts = await fetchPdfFonts();
  const bytes = await buildOrderPdf(order, kind, fonts, opts);
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${kind === "proforma" ? "pro-forma" : "bon-de-commande"}-${order.number}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}
