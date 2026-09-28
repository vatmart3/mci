"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema, type CheckoutInput } from "@/lib/schemas/checkout";
import { useCart, cartCount } from "@/lib/store/cart";
import { useSession } from "@/lib/store/session";
import { getBackend, BackendError } from "@/lib/backend";
import { Input, Label, Select, Textarea, FieldError, Checkbox, Hint } from "@/components/ui/Field";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CartLineEditor } from "@/components/cart/CartLineEditor";
import { company } from "@/data/company";
import { cx } from "@/lib/cx";

const DRAFT = "mci:checkout-draft";

function Fieldset({ n, legend, children, hint }: { n: string; legend: string; children: React.ReactNode; hint?: string }) {
  return (
    <fieldset className="border-t border-ink pt-6">
      <legend className="float-left mb-6 flex w-full items-baseline gap-4">
        <span className="t-mono text-sm text-mci">{n}</span>
        <span className="t-label">{legend}</span>
      </legend>
      {hint ? <p className="clear-both -mt-3 mb-6 text-sm text-ink/70">{hint}</p> : null}
      <div className="clear-both grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function firstError(errors: FieldErrors<CheckoutInput>): string | null {
  const walk = (o: unknown, path: string[]): string | null => {
    if (!o || typeof o !== "object") return null;
    if ("message" in (o as object) && typeof (o as { message?: unknown }).message === "string") return path.join(".");
    for (const [k, v] of Object.entries(o as object)) {
      if (k === "ref") continue;
      const r = walk(v, [...path, k]);
      if (r) return r;
    }
    return null;
  };
  return walk(errors, []);
}

export function CheckoutForm() {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const clear = useCart((s) => s.clear);
  const { user, account, settings, ready } = useSession();
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => setHydrated(true), []);

  const defaults = useMemo<Partial<CheckoutInput>>(() => {
    let draft: Partial<CheckoutInput> = {};
    try {
      draft = JSON.parse(window.localStorage.getItem(DRAFT) ?? "{}") as Partial<CheckoutInput>;
    } catch {
      /* ignore */
    }
    const addr = account?.addresses.find((a) => a.isDefault) ?? account?.addresses[0];
    return {
      kind: "entreprise",
      billingSame: true,
      chorus: false,
      billing: {},
      ...draft,
      ...(account
        ? {
            company: account.company,
            siret: account.siret,
            kind: account.kind,
            chorus: account.chorus,
            chorusServiceCode: account.chorusServiceCode ?? "",
            addressId: addr?.id,
            delivery: addr ? { line1: addr.line1, line2: addr.line2 ?? "", postalCode: addr.postalCode, city: addr.city, accessNotes: addr.accessNotes ?? "" } : draft.delivery,
            billingSame: !account.billing,
            billing: account.billing ? { company: account.billing.company ?? "", line1: account.billing.line1, line2: account.billing.line2 ?? "", postalCode: account.billing.postalCode, city: account.billing.city } : {},
          }
        : {}),
      ...(user ? { contactName: user.fullName, email: user.email, phone: user.phone ?? draft.phone ?? "" } : {}),
    } as Partial<CheckoutInput>;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, account?.id, hydrated]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutInput>({ resolver: zodResolver(checkoutSchema), defaultValues: defaults });

  useEffect(() => {
    if (hydrated && ready) reset(defaults);
  }, [defaults, reset, hydrated, ready]);

  // brouillon enregistré automatiquement
  useEffect(() => {
    const sub = watch((v) => {
      try {
        const { acceptCgv: _a, ...rest } = v;
        window.localStorage.setItem(DRAFT, JSON.stringify(rest));
      } catch {
        /* ignore */
      }
    });
    return () => sub.unsubscribe();
  }, [watch]);

  const kind = watch("kind");
  const billingSame = watch("billingSame");
  const chorus = watch("chorus");
  const addressId = watch("addressId");

  useEffect(() => {
    if (kind === "collectivite" && !account) setValue("chorus", true);
  }, [kind, account, setValue]);

  const pickAddress = (id: string) => {
    const a = account?.addresses.find((x) => x.id === id);
    setValue("addressId", id);
    if (a) {
      setValue("delivery.line1", a.line1);
      setValue("delivery.line2", a.line2 ?? "");
      setValue("delivery.postalCode", a.postalCode);
      setValue("delivery.city", a.city);
      setValue("delivery.accessNotes", a.accessNotes ?? "");
    } else {
      setValue("delivery.line1", "");
      setValue("delivery.line2", "");
      setValue("delivery.postalCode", "");
      setValue("delivery.city", "");
      setValue("delivery.accessNotes", "");
    }
  };

  const onSubmit = handleSubmit(
    async (data) => {
      setError(null);
      if (!lines.length) {
        setError("Le bon de commande est vide.");
        return;
      }
      try {
        const b = await getBackend();
        const order = await b.placeOrder({
          customer: { company: data.company, siret: data.siret, kind: data.kind, contactName: data.contactName, phone: data.phone, email: data.email },
          delivery: { company: data.company, line1: data.delivery.line1, line2: data.delivery.line2 || undefined, postalCode: data.delivery.postalCode, city: data.delivery.city, accessNotes: data.delivery.accessNotes || undefined },
          billing: data.billingSame
            ? null
            : { company: data.billing.company || data.company, line1: data.billing.line1 ?? "", line2: data.billing.line2 || undefined, postalCode: data.billing.postalCode ?? "", city: data.billing.city ?? "" },
          poNumber: data.poNumber,
          chorus: data.chorus,
          chorusServiceCode: data.chorusServiceCode,
          deliverySlots: data.deliverySlots,
          comment: data.comment,
          lines,
        });
        try {
          window.localStorage.removeItem(DRAFT);
          if (!user) {
            window.sessionStorage.setItem(
              "mci:prefill-account",
              JSON.stringify({ company: data.company, siret: data.siret, kind: data.kind, fullName: data.contactName, email: data.email, phone: data.phone, address: { line1: data.delivery.line1, line2: data.delivery.line2, postalCode: data.delivery.postalCode, city: data.delivery.city } }),
            );
          }
        } catch {
          /* ignore */
        }
        clear();
        router.push(`/commande/confirmation/${order.number}`);
      } catch (e) {
        setError(e instanceof BackendError ? e.message : `Envoi impossible. Réessayez ou appelez le ${company.phone}.`);
      }
    },
    (errs) => {
      const path = firstError(errs);
      if (path) setFocus(path as never);
    },
  );

  const count = hydrated ? cartCount(lines) : 0;

  if (hydrated && !lines.length) {
    return (
      <div className="wrap py-16">
        <h1 className="t-h1">Le bon de commande est vide.</h1>
        <p className="t-lead mt-6 max-w-[52ch] text-ink/80">Ajoutez des produits depuis le catalogue, ou saisissez vos références si vous les connaissez déjà.</p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <ButtonLink href="/catalogue" variant="action" size="lg">
            Ouvrir le catalogue
          </ButtonLink>
          <Link href="/commande-rapide" className="link-u font-semibold">
            Commande rapide par référence →
          </Link>
        </div>
      </div>
    );
  }

  const err = (m?: string, id?: string) => <FieldError id={id}>{m}</FieldError>;
  const a = (name: string, invalid: boolean) => ({ id: `co-${name}`, "aria-invalid": invalid, "aria-describedby": invalid ? `co-${name}-err` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="wrap pb-16 pt-8 lg:pt-12">
      <p className="t-mono text-sm text-ink/70">
        <span className="text-mci">BON DE COMMANDE</span> — {count} ARTICLE{count > 1 ? "S" : ""} · {lines.length} RÉF.
      </p>
      <h1 className="t-h1 mt-3">Valider le bon de commande</h1>
      <p className="mt-4 max-w-[60ch] text-ink/80">
        {settings.priceMode === "on_request" ? "Aucun paiement en ligne. MCI vous renvoie une pro-forma avec les prix et le délai ; vous la validez en un clic." : "Aucun paiement en ligne : virement, facture à échéance ou mandat administratif."}{" "}
        {user ? null : (
          <>
            Vous avez un compte ?{" "}
            <Link href="/espace-pro?retour=/commande" className="link-u">
              Connectez-vous
            </Link>{" "}
            pour préremplir.
          </>
        )}
      </p>

      <div className="grid-12 mt-12 gap-y-12">
        <div className="col-span-12 space-y-12 lg:col-span-7">
          <Fieldset n="01" legend="Votre structure">
            <div className="sm:col-span-2">
              <Label htmlFor="co-company" required>
                Raison sociale
              </Label>
              <Input autoComplete="organization" {...register("company")} {...a("company", !!errors.company)} />
              {err(errors.company?.message, "co-company-err")}
            </div>
            <div>
              <Label htmlFor="co-siret" required>
                SIRET
              </Label>
              <Input inputMode="numeric" placeholder="14 chiffres" {...register("siret")} {...a("siret", !!errors.siret)} className="t-mono" />
              {err(errors.siret?.message, "co-siret-err")}
            </div>
            <div>
              <Label htmlFor="co-kind" required>
                Type de structure
              </Label>
              <Select {...register("kind")} id="co-kind">
                <option value="entreprise">Entreprise</option>
                <option value="collectivite">Collectivité / établissement public</option>
                <option value="association">Association</option>
              </Select>
            </div>
          </Fieldset>

          <Fieldset n="02" legend="Contact">
            <div className="sm:col-span-2">
              <Label htmlFor="co-contactName" required>
                Nom et prénom
              </Label>
              <Input autoComplete="name" {...register("contactName")} {...a("contactName", !!errors.contactName)} />
              {err(errors.contactName?.message, "co-contactName-err")}
            </div>
            <div>
              <Label htmlFor="co-phone" required>
                Téléphone
              </Label>
              <Input type="tel" autoComplete="tel" {...register("phone")} {...a("phone", !!errors.phone)} />
              {err(errors.phone?.message, "co-phone-err")}
            </div>
            <div>
              <Label htmlFor="co-email" required>
                Email
              </Label>
              <Input type="email" autoComplete="email" {...register("email")} {...a("email", !!errors.email)} />
              {err(errors.email?.message, "co-email-err")}
            </div>
          </Fieldset>

          <Fieldset n="03" legend="Livraison">
            {account?.addresses.length ? (
              <div className="sm:col-span-2">
                <p className="mb-2 text-sm font-semibold">Adresses enregistrées</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {account.addresses.map((ad) => (
                    <label key={ad.id} className={cx("cursor-pointer rounded-tech border p-3 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-mci", addressId === ad.id ? "border-ink bg-white" : "border-rule")}>
                      <input type="radio" name="addr" className="sr-only" checked={addressId === ad.id} onChange={() => pickAddress(ad.id)} />
                      <span className="block font-semibold">{ad.label}</span>
                      <span className="block text-ink/80">
                        {ad.line1}, {ad.postalCode} {ad.city}
                      </span>
                    </label>
                  ))}
                  <label className={cx("cursor-pointer rounded-tech border p-3 text-sm has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-mci", !addressId ? "border-ink bg-white" : "border-rule")}>
                    <input type="radio" name="addr" className="sr-only" checked={!addressId} onChange={() => pickAddress("")} />
                    <span className="block font-semibold">Autre adresse</span>
                    <span className="block text-ink/80">Saisir une adresse de livraison</span>
                  </label>
                </div>
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <Label htmlFor="co-delivery.line1" required>
                Adresse
              </Label>
              <Input autoComplete="shipping address-line1" {...register("delivery.line1")} {...a("delivery.line1", !!errors.delivery?.line1)} />
              {err(errors.delivery?.line1?.message, "co-delivery.line1-err")}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="co-delivery.line2">Complément</Label>
              <Input autoComplete="shipping address-line2" {...register("delivery.line2")} id="co-delivery.line2" placeholder="Bâtiment, service, quai…" />
            </div>
            <div>
              <Label htmlFor="co-delivery.postalCode" required>
                Code postal
              </Label>
              <Input inputMode="numeric" autoComplete="shipping postal-code" {...register("delivery.postalCode")} {...a("delivery.postalCode", !!errors.delivery?.postalCode)} className="t-mono" />
              {err(errors.delivery?.postalCode?.message, "co-delivery.postalCode-err")}
            </div>
            <div>
              <Label htmlFor="co-delivery.city" required>
                Ville
              </Label>
              <Input autoComplete="shipping address-level2" {...register("delivery.city")} {...a("delivery.city", !!errors.delivery?.city)} />
              {err(errors.delivery?.city?.message, "co-delivery.city-err")}
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="co-delivery.accessNotes">Contraintes d&apos;accès</Label>
              <Input {...register("delivery.accessNotes")} id="co-delivery.accessNotes" placeholder="Quai de déchargement, hauteur limitée, portail à code…" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="co-deliverySlots">Créneaux de livraison</Label>
              <Input {...register("deliverySlots")} id="co-deliverySlots" placeholder="Ex. du lundi au vendredi, 7 h 30 – 11 h 30" />
            </div>
          </Fieldset>

          <Fieldset n="04" legend="Facturation">
            <div className="sm:col-span-2">
              <Checkbox id="co-billingSame" {...register("billingSame")} label="Facturer à l'adresse de livraison" />
            </div>
            {billingSame ? null : (
              <>
                <div className="sm:col-span-2">
                  <Label htmlFor="co-billing.company">Entité facturée</Label>
                  <Input {...register("billing.company")} id="co-billing.company" placeholder="Si différente de la raison sociale" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="co-billing.line1" required>
                    Adresse de facturation
                  </Label>
                  <Input autoComplete="billing address-line1" {...register("billing.line1")} {...a("billing.line1", !!errors.billing?.line1)} />
                  {err(errors.billing?.line1?.message, "co-billing.line1-err")}
                </div>
                <div>
                  <Label htmlFor="co-billing.postalCode" required>
                    Code postal
                  </Label>
                  <Input inputMode="numeric" {...register("billing.postalCode")} {...a("billing.postalCode", !!errors.billing?.postalCode)} className="t-mono" />
                  {err(errors.billing?.postalCode?.message, "co-billing.postalCode-err")}
                </div>
                <div>
                  <Label htmlFor="co-billing.city" required>
                    Ville
                  </Label>
                  <Input {...register("billing.city")} {...a("billing.city", !!errors.billing?.city)} />
                  {err(errors.billing?.city?.message, "co-billing.city-err")}
                </div>
              </>
            )}
          </Fieldset>

          <Fieldset n="05" legend="Références administratives" hint="Utiles pour rapprocher la facture de votre engagement comptable.">
            <div>
              <Label htmlFor="co-poNumber" required={kind === "collectivite"}>
                N° de bon de commande / d&apos;engagement
              </Label>
              <Input {...register("poNumber")} {...a("poNumber", !!errors.poNumber)} className="t-mono" />
              {errors.poNumber ? err(errors.poNumber.message, "co-poNumber-err") : <Hint>{kind === "collectivite" ? "Obligatoire pour les collectivités." : "Facultatif."}</Hint>}
            </div>
            <div className="flex flex-col justify-end gap-3">
              <Checkbox id="co-chorus" {...register("chorus")} label="Facturation via Chorus Pro (entité publique)" />
            </div>
            {chorus ? (
              <div>
                <Label htmlFor="co-chorusServiceCode">Code service Chorus Pro</Label>
                <Input {...register("chorusServiceCode")} id="co-chorusServiceCode" className="t-mono" />
              </div>
            ) : null}
          </Fieldset>

          <Fieldset n="06" legend="Commentaire et envoi">
            <div className="sm:col-span-2">
              <Label htmlFor="co-comment">Commentaire</Label>
              <Textarea rows={4} {...register("comment")} id="co-comment" placeholder="Précisions pour MCI (urgence, produit de remplacement accepté…)" />
            </div>
            <div className="sm:col-span-2">
              <Checkbox
                id="co-acceptCgv"
                {...register("acceptCgv")}
                aria-invalid={!!errors.acceptCgv}
                label={
                  <span>
                    J&apos;accepte les{" "}
                    <Link href="/cgv" target="_blank" className="link-u">
                      conditions générales de vente
                    </Link>{" "}
                    de MCI Sète.
                  </span>
                }
              />
              {err(errors.acceptCgv?.message)}
            </div>
          </Fieldset>

          {error ? (
            <p role="alert" className="rounded-tech border border-danger bg-white p-4 text-danger">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col gap-4 border-t border-ink pt-6 sm:flex-row sm:items-center">
            <Button type="submit" variant="action" size="lg" disabled={isSubmitting || !hydrated}>
              {isSubmitting ? "Envoi en cours…" : "Envoyer le bon de commande"}
              <Icon name="arrow" />
            </Button>
            <p className="text-sm text-ink/70">Vous recevez un récapitulatif par email et un bon de commande en PDF.</p>
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-5 lg:col-start-8" aria-labelledby="recap-title">
          <div className="rounded-box border border-rule bg-white p-4 lg:sticky lg:top-20 lg:p-6">
            <div className="flex items-baseline justify-between">
              <h2 id="recap-title" className="t-label">
                Votre sélection
              </h2>
              <Link href="/catalogue" className="link-u text-sm">
                Ajouter des produits
              </Link>
            </div>
            <ul className="mt-2 max-h-[60vh] divide-y divide-rule overflow-y-auto">
              {hydrated ? lines.map((l, i) => <CartLineEditor key={`${l.productId}-${l.packagingId}`} line={l} index={i} />) : null}
            </ul>
            <p className="t-mono mt-4 border-t border-rule pt-3 text-xs text-ink/70">{settings.priceMode === "on_request" ? "PRIX ET DÉLAI CONFIRMÉS PAR MCI" : "PRIX HT INDICATIFS — CONFIRMÉS PAR MCI"}</p>
          </div>
        </aside>
      </div>
    </form>
  );
}
