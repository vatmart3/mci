"use client";
import { useEffect, useState } from "react";
import { ContactForm } from "./ContactForm";
import { contactSubjects, type ContactSubject } from "@/lib/schemas/contact";

/** Préremplit le formulaire depuis l'URL : ?objet=echantillon&produit=DG90&message=… */
export function ContactFromQuery() {
  const [init, setInit] = useState<{ subject: ContactSubject; product?: string; message?: string } | null>(null);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const o = p.get("objet") as ContactSubject | null;
    const secteur = p.get("secteur");
    setInit({
      subject: o && o in contactSubjects ? o : "contact",
      product: p.get("produit") ?? undefined,
      message: p.get("message") ?? (secteur ? `Secteur : ${secteur}. ` : undefined),
    });
  }, []);
  if (!init) return <div className="h-96 rounded-[6px] bg-salt" aria-busy="true" />;
  return <ContactForm {...init} />;
}
