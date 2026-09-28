import { z } from "zod";

export const contactSubjects = {
  contact: "Question",
  devis: "Demande de devis",
  echantillon: "Demande d'échantillon",
  conseil: "Demande de conseil",
  fds: "Demande de FDS",
  "produit-specifique": "Produit hors catalogue",
  gamme: "Gamme sur demande",
} as const;
export type ContactSubject = keyof typeof contactSubjects;

export const contactSchema = z.object({
  subject: z.enum(Object.keys(contactSubjects) as [ContactSubject, ...ContactSubject[]]),
  company: z.string().trim().min(2, "Indiquez la structure").max(160),
  name: z.string().trim().min(2, "Indiquez votre nom").max(120),
  email: z.string().trim().email("Email invalide"),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((v) => v === "" || /^[+\d][\d\s.()-]{7,}$/.test(v), "Numéro invalide"),
  sector: z.string().max(60).optional(),
  product: z.string().max(120).optional(),
  message: z.string().trim().min(5, "Précisez votre demande").max(4000),
  consent: z.literal(true, { message: "Nécessaire pour vous répondre" }),
  // champ piège anti-robots (doit rester vide)
  website: z.string().max(0).optional(),
});
export type ContactInput = z.infer<typeof contactSchema>;
