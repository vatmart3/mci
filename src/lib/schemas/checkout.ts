import { z } from "zod";
import { isValidSiret } from "@/lib/format";

const phone = z
  .string()
  .trim()
  .regex(/^[+\d][\d\s.()-]{7,}$/, "Numéro de téléphone invalide");

const address = {
  line1: z.string().trim().min(3, "Adresse requise").max(160),
  line2: z.string().trim().max(160).optional(),
  postalCode: z.string().trim().regex(/^\d{5}$/, "Code postal à 5 chiffres"),
  city: z.string().trim().min(2, "Ville requise").max(80),
};

export const checkoutSchema = z
  .object({
    company: z.string().trim().min(2, "Raison sociale requise").max(160),
    siret: z.string().refine(isValidSiret, "SIRET : 14 chiffres"),
    kind: z.enum(["entreprise", "collectivite", "association"]),
    contactName: z.string().trim().min(2, "Nom du contact requis").max(120),
    phone,
    email: z.string().trim().email("Email invalide"),
    addressId: z.string().optional(),
    delivery: z.object({ ...address, accessNotes: z.string().trim().max(300).optional() }),
    billingSame: z.boolean(),
    billing: z.object({ company: z.string().trim().max(160).optional(), line1: z.string().trim().max(160).optional(), line2: z.string().trim().max(160).optional(), postalCode: z.string().trim().optional(), city: z.string().trim().max(80).optional() }),
    poNumber: z.string().trim().max(60).optional(),
    chorus: z.boolean(),
    chorusServiceCode: z.string().trim().max(60).optional(),
    deliverySlots: z.string().trim().max(300).optional(),
    comment: z.string().trim().max(2000).optional(),
    acceptCgv: z.literal(true, { message: "Acceptation des conditions générales de vente requise" }),
  })
  // `when` : ces contrôles s'exécutent même si d'autres champs sont invalides (toutes les erreurs d'un coup)
  .refine((v) => !(v.kind === "collectivite" && !v.poNumber), {
    path: ["poNumber"],
    message: "Obligatoire pour une collectivité (n° d'engagement ou de bon de commande)",
    when: () => true,
  })
  .refine((v) => v.billingSame !== false || (v.billing?.line1 ?? "").length >= 3, { path: ["billing", "line1"], message: "Adresse de facturation requise", when: () => true })
  .refine((v) => v.billingSame !== false || /^\d{5}$/.test(v.billing?.postalCode ?? ""), { path: ["billing", "postalCode"], message: "Code postal à 5 chiffres", when: () => true })
  .refine((v) => v.billingSame !== false || !!v.billing?.city, { path: ["billing", "city"], message: "Ville requise", when: () => true });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
