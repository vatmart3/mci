import { ImageResponse } from "next/og";
import { og, ogFonts, packshotDataUrl } from "@/lib/og/assets";
import { OgMark } from "@/lib/og/mark";

export const runtime = "nodejs";
export const alt = "MCI Sète — le bon produit pour chaque surface";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [fonts, a, b, c] = await Promise.all([ogFonts(), packshotDataUrl("dg90", 360), packshotDataUrl("cst", 360), packshotDataUrl("super-granul", 360)]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: og.white, position: "relative" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 640, height: "100%", padding: 64, background: og.mci }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <OgMark size={52} />
            <div style={{ fontFamily: og.display, fontWeight: 700, fontSize: 44, color: og.white, letterSpacing: -0.5 }}>MCI</div>
            <div style={{ fontFamily: og.display, fontWeight: 600, fontSize: 18, color: og.white, letterSpacing: 6 }}>SÈTE</div>
          </div>
          <div style={{ fontFamily: og.display, fontWeight: 700, fontSize: 80, lineHeight: 1.02, color: og.white, letterSpacing: -1 }}>Le bon produit pour chaque surface.</div>
          <div style={{ fontFamily: og.display, fontWeight: 600, fontSize: 19, color: og.white, opacity: 0.85, letterSpacing: 0.5 }}>NETTOYANTS TECHNIQUES · DÉSINFECTANTS · COMMANDE PRO</div>
        </div>
        <div style={{ display: "flex", position: "absolute", left: 640, top: 110, width: 560 }}>
          {[a, b, c].map((src, i) => (src ? <img key={i} src={src} width={260} height={260} style={{ marginLeft: i ? -110 : -10, marginTop: i === 1 ? -60 : i === 2 ? 120 : 40 }} /> : null))}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
