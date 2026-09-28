"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, contactSubjects, type ContactInput, type ContactSubject } from "@/lib/schemas/contact";
import { Input, Label, Select, Textarea, FieldError, Checkbox } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useSession } from "@/lib/store/session";
import { sectors } from "@/data/sectors";
import { company } from "@/data/company";
import { IS_DEMO } from "@/lib/env";
import Link from "next/link";

/** Formulaire contact / devis / échantillon / FDS / conseil. Pré-rempli si connecté. */
export function ContactForm({ subject = "contact", product, message, onDone, compact = false }: { subject?: ContactSubject; product?: string; message?: string; onDone?: () => void; compact?: boolean }) {
  const { user, account } = useSession();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      subject,
      product: product ?? "",
      message: message ?? "",
      company: account?.company ?? "",
      name: user?.fullName ?? "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      website: "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    setError(null);
    const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
    const json = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; email?: { to: string[]; subject: string; text: string; kind: string } };
    if (!res.ok || !json.ok) {
      setError(json.error ?? `Envoi impossible. Appelez-nous au ${company.phone}.`);
      return;
    }
    if (IS_DEMO && json.email) {
      const { getBackend } = await import("@/lib/backend");
      const b = (await getBackend()) as { recordEmails?: (e: unknown[]) => void };
      b.recordEmails?.([json.email]);
    }
    setSent(true);
    onDone?.();
  });

  if (sent) {
    return (
      <div role="status" className="flex flex-col items-start py-4">
        <span className="grid size-14 place-items-center rounded-full bg-ok/10 text-ok">
          <Icon name="check" size={28} />
        </span>
        <p className="t-h2 mt-6">Demande envoyée.</p>
        <p className="mt-3 max-w-[48ch] text-ink/70">
          MCI vous répond par email ou par téléphone. Pour une urgence :{" "}
          <a className="font-semibold text-mci hover:underline" href={`tel:${company.phoneE164}`}>
            {company.phone}
          </a>
          .
        </p>
      </div>
    );
  }

  const f = (k: keyof ContactInput) => ({ id: `cf-${k}`, "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `cf-${k}-err` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2">
      <fieldset className="min-w-0 sm:col-span-2">
        <legend className="mb-3 block text-sm font-semibold text-ink">
          Objet
          <span className="text-danger" aria-hidden="true">
            {" "}
            *
          </span>
          <span className="sr-only"> (obligatoire)</span>
        </legend>
        <div id="cf-subject" className="flex flex-wrap gap-2">
          {(Object.keys(contactSubjects) as ContactSubject[]).map((k) => (
            <label key={k} className="relative cursor-pointer">
              <input type="radio" value={k} {...register("subject")} className="peer sr-only" />
              <span
                className={
                  "inline-flex h-10 items-center rounded-full bg-white px-4 text-sm font-medium text-ink/80 ring-1 ring-black/10 transition-[background-color,color,box-shadow,transform] duration-200 ease-out " +
                  "hover:ring-black/25 active:scale-[0.97] peer-checked:bg-mci peer-checked:text-white peer-checked:ring-mci " +
                  "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-mci"
                }
              >
                {contactSubjects[k]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {compact ? null : (
        <div className="sm:col-span-2">
          <Label htmlFor="cf-sector">Secteur</Label>
          <Select {...register("sector")} id="cf-sector">
            <option value="">—</option>
            {sectors.map((s) => (
              <option key={s.slug} value={s.name}>
                {s.name}
              </option>
            ))}
            <option value="Autre">Autre</option>
          </Select>
        </div>
      )}
      <div>
        <Label htmlFor="cf-company" required>
          Structure
        </Label>
        <Input autoComplete="organization" {...register("company")} {...f("company")} />
        <FieldError id="cf-company-err">{errors.company?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="cf-name" required>
          Nom
        </Label>
        <Input autoComplete="name" {...register("name")} {...f("name")} />
        <FieldError id="cf-name-err">{errors.name?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="cf-email" required>
          Email
        </Label>
        <Input type="email" autoComplete="email" {...register("email")} {...f("email")} />
        <FieldError id="cf-email-err">{errors.email?.message}</FieldError>
      </div>
      <div>
        <Label htmlFor="cf-phone">Téléphone</Label>
        <Input type="tel" autoComplete="tel" {...register("phone")} {...f("phone")} />
        <FieldError id="cf-phone-err">{errors.phone?.message}</FieldError>
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="cf-product">Produit concerné</Label>
        <Input {...register("product")} id="cf-product" placeholder="Code ou nom (facultatif)" />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="cf-message" required>
          Votre besoin
        </Label>
        <Textarea rows={compact ? 3 : 5} {...register("message")} {...f("message")} placeholder="Surface, salissure, quantité, délai souhaité…" />
        <FieldError id="cf-message-err">{errors.message?.message}</FieldError>
      </div>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="cf-website">Site web</label>
        <input id="cf-website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <div className="sm:col-span-2">
        <Checkbox
          id="cf-consent"
          {...register("consent")}
          aria-invalid={!!errors.consent}
          label={
            <span className="text-sm">
              J&apos;accepte que MCI utilise ces informations pour répondre à ma demande (<Link href="/confidentialite" className="link-u">confidentialité</Link>).
            </span>
          }
        />
        <FieldError>{errors.consent?.message}</FieldError>
      </div>
      {error ? (
        <p role="alert" className="flex items-start gap-3 rounded-box bg-danger/10 p-4 text-danger sm:col-span-2">
          <Icon name="warning" size={20} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : null}
      <div className="sm:col-span-2">
        <Button type="submit" variant="primary" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Envoi…" : "Envoyer la demande"}
        </Button>
      </div>
    </form>
  );
}
