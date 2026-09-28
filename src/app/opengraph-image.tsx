import { ImageResponse } from "next/og";
import { ogFonts, packshotDataUrl } from "@/lib/og/assets";

export const runtime = "nodejs";
export const alt = "MCI Sète — le produit juste pour chaque surface";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const [fonts, a, b, c] = await Promise.all([ogFonts(), packshotDataUrl("dg90", 360), packshotDataUrl("cst", 360), packshotDataUrl("super-granul", 360)]);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#F3F1EC", padding: 64, position: "relative" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 210, height: 1, background: "#D5DCE0" }} />
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 600 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 44, background: "#F89746" }} />
            <div style={{ fontFamily: "Archivo", fontSize: 40, color: "#206996" }}>MCI</div>
            <div style={{ fontFamily: "Plex", fontSize: 18, color: "#0E2533", letterSpacing: 6 }}>SÈTE</div>
          </div>
          <div style={{ fontFamily: "Archivo", fontSize: 74, lineHeight: 0.98, color: "#0E2533", letterSpacing: -2 }}>Le produit juste pour chaque surface.</div>
          <div style={{ fontFamily: "Plex", fontSize: 20, color: "#0E2533", opacity: 0.7 }}>NETTOYANTS TECHNIQUES · DÉSINFECTANTS · COMMANDE PRO</div>
        </div>
        <div style={{ display: "flex", position: "absolute", right: 20, top: 110, width: 560 }}>
          {[a, b, c].map((src, i) => (src ? <img key={i} src={src} width={260} height={260} style={{ marginLeft: i ? -80 : 0, marginTop: i === 1 ? -60 : i === 2 ? 120 : 40 }} /> : null))}
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
