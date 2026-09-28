"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";

interface Doc {
  url: string;
  title: string;
}

const Ctx = createContext<(d: Doc) => void>(() => undefined);
export const useOpenPdf = () => useContext(Ctx);

/** Visionneuse PDF intégrée (une seule instance par page) + téléchargement. */
export function PdfViewerProvider({ children }: { children: React.ReactNode }) {
  const [doc, setDoc] = useState<Doc | null>(null);
  const open = useCallback((d: Doc) => setDoc(d), []);
  return (
    <Ctx.Provider value={open}>
      {children}
      <Dialog open={!!doc} onClose={() => setDoc(null)} title={doc?.title ?? "Document"} wide>
        {doc ? (
          <div className="flex flex-col gap-4">
            <div className="relative h-[70vh] overflow-hidden rounded-tech border border-rule bg-salt">
              <object data={`${doc.url}#view=FitH`} type="application/pdf" className="absolute inset-0 h-full w-full" aria-label={doc.title}>
                <div className="grid h-full place-items-center p-8 text-center">
                  <p className="max-w-sm text-ink/80">Votre navigateur n&apos;affiche pas les PDF intégrés. Ouvrez-le dans un nouvel onglet ou téléchargez-le.</p>
                </div>
              </object>
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={doc.url} target="_blank" rel="noopener noreferrer" className={buttonClass("outline", "sm")}>
                <Icon name="external" size={16} />
                Ouvrir dans un onglet
              </a>
              <a href={doc.url} download className={buttonClass("primary", "sm")}>
                <Icon name="download" size={16} />
                Télécharger
              </a>
            </div>
          </div>
        ) : null}
      </Dialog>
    </Ctx.Provider>
  );
}

export function SheetButton({ url, code, size = "sm", label = "FT" }: { url?: string; code: string; size?: "sm" | "md"; label?: string }) {
  const open = useOpenPdf();
  if (!url) {
    return (
      <span className="t-mono inline-flex h-8 items-center px-2 text-xs text-ink/60" title="Fiche technique sur demande">
        FT SUR DEM.
      </span>
    );
  }
  return (
    <button type="button" onClick={() => open({ url, title: `Fiche technique ${code}` })} className={buttonClass("outline", size, "gap-1")} aria-label={`Fiche technique ${code} (PDF)`}>
      <Icon name="doc" size={16} />
      {label}
    </button>
  );
}
