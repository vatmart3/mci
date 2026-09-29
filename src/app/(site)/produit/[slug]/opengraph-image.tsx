import { ImageResponse } from "next/og";
import { getProduct, getProducts } from "@/lib/catalog";
import { familyBySlug } from "@/data/families";
import { fitDisplaySize, og, ogFonts, ogText, packshotDataUrl } from "@/lib/og/assets";
import { OgMark } from "@/lib/og/mark";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Fiche produit MCI Sète";

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProduct((await params).slug);
  const code = p?.code ?? "MCI";
  // colonne de texte : 700 px moins 2 × 64 px de marge ; les codes longs passent sur deux lignes à 60 px
  const [fonts, shot, codeSize] = await Promise.all([ogFonts(), p ? packshotDataUrl(p.slug, 560) : null, fitDisplaySize(code, 572, 96, 60, 0.01)]);
  const family = p ? familyBySlug.get(p.families[0]!)?.name ?? "" : "";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: og.white, position: "relative" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 88, background: og.mci, display: "flex", alignItems: "center", paddingLeft: 64, gap: 14 }}>
          <OgMark size={46} />
          <div style={{ fontFamily: og.display, fontWeight: 700, fontSize: 38, color: og.white, letterSpacing: -0.5 }}>MCI</div>
          <div style={{ fontFamily: og.display, fontWeight: 600, fontSize: 16, color: og.white, letterSpacing: 6 }}>SÈTE</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "120px 64px 64px", width: 700 }}>
          <div style={{ fontFamily: og.display, fontWeight: 600, fontSize: 22, color: og.mci, letterSpacing: 1.5 }}>{ogText(family).toUpperCase()}</div>
          <div style={{ fontFamily: og.display, fontWeight: 700, fontSize: codeSize, color: og.ink, lineHeight: 1, marginTop: 14, letterSpacing: codeSize * 0.01 }}>{code}</div>
          <div style={{ fontFamily: og.body, fontWeight: 400, fontSize: 40, color: og.ink, marginTop: 18, lineHeight: 1.15 }}>{ogText(p?.short ?? "")}</div>
          <div style={{ fontFamily: og.display, fontWeight: 600, fontSize: 19, color: og.ink, opacity: 0.7, marginTop: 40, letterSpacing: 1 }}>FICHE TECHNIQUE · COMMANDE PRO · MCI-SETE.COM</div>
        </div>
        {shot ? <img src={shot} width={500} height={500} style={{ position: "absolute", right: 30, top: 110 }} /> : null}
      </div>
    ),
    { ...size, fonts },
  );
}
