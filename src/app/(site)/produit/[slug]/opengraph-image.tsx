import { ImageResponse } from "next/og";
import { getProduct, getProducts } from "@/lib/catalog";
import { familyBySlug } from "@/data/families";
import { ogFonts, packshotDataUrl } from "@/lib/og/assets";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Fiche produit MCI Sète";

export async function generateStaticParams() {
  return (await getProducts()).map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const p = await getProduct((await params).slug);
  const [fonts, shot] = await Promise.all([ogFonts(), p ? packshotDataUrl(p.slug, 560) : null]);
  const family = p ? familyBySlug.get(p.families[0]!)?.name ?? "" : "";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#F3F1EC", position: "relative" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 88, background: "#206996", display: "flex", alignItems: "center", paddingLeft: 64, gap: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 36, background: "#F89746" }} />
          <div style={{ fontFamily: "Archivo", fontSize: 34, color: "#FFFFFF" }}>MCI</div>
          <div style={{ fontFamily: "Plex", fontSize: 16, color: "#FFFFFF", letterSpacing: 6 }}>SÈTE</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "120px 64px 64px", width: 700 }}>
          <div style={{ fontFamily: "Plex", fontSize: 20, color: "#206996" }}>{family.toUpperCase()}</div>
          <div style={{ fontFamily: "Archivo", fontSize: p && p.code.length > 14 ? 64 : 96, color: "#0E2533", lineHeight: 1, marginTop: 16 }}>{p?.code ?? "MCI"}</div>
          <div style={{ fontFamily: "Archivo", fontSize: 40, color: "#0E2533", marginTop: 16, lineHeight: 1.1 }}>{p?.short ?? ""}</div>
          <div style={{ fontFamily: "Plex", fontSize: 18, color: "#0E2533", opacity: 0.65, marginTop: 40 }}>FICHE TECHNIQUE · COMMANDE PRO · MCI-SETE.COM</div>
        </div>
        {shot ? <img src={shot} width={500} height={500} style={{ position: "absolute", right: 30, top: 110 }} /> : null}
      </div>
    ),
    { ...size, fonts },
  );
}
