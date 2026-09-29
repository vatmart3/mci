"use client";
import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { ContactForm } from "@/components/order/ContactForm";
import type { ContactSubject } from "@/lib/schemas/contact";
import { Icon } from "@/components/ui/Icon";
import { buttonClass } from "@/components/ui/Button";

const titles: Partial<Record<ContactSubject, string>> = {
  echantillon: "Demander un échantillon",
  conseil: "Demander conseil",
  fds: "Demander la fiche de données de sécurité",
  devis: "Demander un devis",
};

export function RequestButton({ subject, product, variant = "link" }: { subject: ContactSubject; product: string; variant?: "link" | "button" }) {
  const [open, setOpen] = useState(false);
  const title = titles[subject] ?? "Nous contacter";
  const msg =
    subject === "fds"
      ? `Merci de m'envoyer la FDS de ${product}.`
      : subject === "echantillon"
        ? `Je souhaite tester ${product}. Usage prévu : `
        : subject === "conseil"
          ? `Question sur ${product} : `
          : "";
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={variant === "link" ? "link-u inline-flex items-center gap-2 text-left" : buttonClass("outline", "sm")}>
        {variant === "button" ? <Icon name="mail" size={16} /> : null}
        {title}
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={title}>
        <ContactForm subject={subject} product={product} message={msg} compact />
      </Dialog>
    </>
  );
}
