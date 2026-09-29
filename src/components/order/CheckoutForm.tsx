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
import { Input, Label, Textarea, FieldError, Checkbox, Hint } from "@/components/ui/Field";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CartLineEditor } from "@/components/cart/CartLineEditor";
import { company } from "@/data/company";
import { cx } from "@/lib/cx";

const DRAFT = "mci:checkout-draft";

/** Étape du bon : panneau fileté, en-tête numéroté (la séquence porte l'information), champs alignés sur deux colonnes. */
function Fieldset({ n, legend, children, hint }: { n: string; legend: string; children: React.ReactNode; hint?: string }) {
  return (
    <fieldset className="min-w-0 rounded-[8px] border border-rule bg-white">
      <legend className="float-left flex w-full items-center gap-3 border-b border-rule bg-salt px-4 py-3 sm:px-6">
        <span aria-hidden="true" className="t-num grid size-7 shrink-0 place-items-center rounded-[4px] bg-mci text-sm text-white">
          {Number(n)}
        </span>
        <span className="sr-only">Étape {Number(n)} : </span>
        <span className="t-label">{legend}</span>
      </legend>
      <div className="clear-both px-4 py-5 sm:px-6 sm:py-6">
        {hint ? <p className="-mt-1 mb-5 text-sm text-ink/70">{hint}</p> : null}
        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2">{children}</div>
      </div>
    </fieldset>
  );
}

/** Carte radio rectangulaire : filet acier, sélection = filet et anneau bleus sur fond ciel. */
const choiceCard = (on: boolean) =>
  cx(
    "relative flex min-w-0 cursor-pointer items-start gap-3 rounded-[6px] border p-3.5 text-sm transition-[border-color,background-color,box-shadow] duration-150 ease-out",
    "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-mci",
    on ? "border-mci bg-sky/30 ring-1 ring-mci" : "border-rule bg-white hover:border-ink/40",
  );

/** Pastille radio (vrai cercle). */
function Dot({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" className={cx("mt-px grid size-[18px] shrink-0 place-items-center rounded-full border bg-white transition-colors duration-150", on ? "border-mci" : "border-ink/40")}>
      <span className={cx("size-2.5 rounded-full bg-mci transition-opacity duration-150", on ? "opacity-100" : "opacity-0")} />
    </span>
  );
}

const kinds = [
  ["entreprise", "Entreprise"],
  ["collectivite", "Collectivité / établissement public"],
  ["association", "Association"],
] as const;

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
      <div className="wrap py-12 lg:py-20">
        <div className="mx-auto max-w-[640px] rounded-[8px] border border-rule bg-white p-6 sm:p-10">
          <span className="grid size-14 place-items-center rounded-[8px] bg-salt text-mci">
            <Icon name="order" size={28} />
          </span>
          <h1 className="t-h1 mt-6">Le bon de commande est vide.</h1>
          <p className="t-lead mt-3 max-w-[48ch] text-ink/70">Ajoutez des produits depuis le catalogue, ou saisissez vos références si vous les connaissez déjà.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/catalogue" variant="primary" size="lg" className="max-w-full !whitespace-normal text-center leading-tight">
              Ouvrir le catalogue
            </ButtonLink>
            <ButtonLink href="/commande-rapide" variant="outline" size="lg" className="max-w-full !whitespace-normal text-center leading-tight">
              Commande rapide par référence
            </ButtonLink>
          </div>
        </div>
      </div>
    );
  }

  const err = (m?: string, id?: string) => <FieldError id={id}>{m}</FieldError>;
  const a = (name: string, invalid: boolean) => ({ id: `co-${name}`, "aria-invalid": invalid, "aria-describedby": invalid ? `co-${name}-err` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="wrap pb-20 pt-6 lg:pb-24 lg:pt-10">
      <header className="flex flex-col gap-4 border-b border-rule pb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:pb-8">
        <div className="min-w-0">
          <h1 className="t-h1">Valider le bon de commande</h1>
          <p className="mt-3 max-w-[64ch] text-ink/70">
            {settings.priceMode === "on_request" ? "Aucun paiement en ligne. MCI vous renvoie une pro-forma avec les prix et le délai ; vous la validez en un clic." : "Aucun paiement en ligne : virement, facture à échéance ou mandat administratif."}
          </p>
        </div>
        {user ? null : (
          <p className="flex items-center gap-2 rounded-[6px] border border-rule bg-salt px-4 py-2.5 text-sm lg:max-w-[360px] lg:shrink-0">
            <Icon name="user" size={18} className="shrink-0 text-mci" />
            <span>
              Vous avez un compte ?{" "}
              <Link href="/espace-pro?retour=/commande" className="link-u font-semibold">
                Connectez-vous
              </Link>{" "}
              pour préremplir.
            </span>
          </p>
        )}
      </header>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12">
        <div className="min-w-0 space-y-5 lg:space-y-6">
          <Fieldset n="01" legend="Votre structure">
            <div>
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
            <div className="sm:col-span-2">
              <p id="co-kind-label" className="mb-2 block text-sm font-semibold text-ink">
                Type de structure
                <span className="text-danger" aria-hidden="true">
                  {" "}
                  *
                </span>
                <span className="sr-only"> (obligatoire)</span>
              </p>
              <div id="co-kind" role="radiogroup" aria-labelledby="co-kind-label" className="grid gap-2 sm:grid-cols-3">
                {kinds.map(([v, l]) => (
                  <label key={v} className={choiceCard(kind === v)}>
                    <input type="radio" value={v} {...register("kind")} className="sr-only" />
                    <Dot on={kind === v} />
                    <span className="font-semibold leading-snug">{l}</span>
                  </label>
                ))}
              </div>
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
                    <label key={ad.id} className={choiceCard(addressId === ad.id)}>
                      <input type="radio" name="addr" className="sr-only" checked={addressId === ad.id} onChange={() => pickAddress(ad.id)} />
                      <Dot on={addressId === ad.id} />
                      <span className="min-w-0">
                        <span className="block font-semibold">{ad.label}</span>
                        <span className="mt-0.5 block text-ink/70">
                          {ad.line1}, {ad.postalCode} {ad.city}
                        </span>
                      </span>
                    </label>
                  ))}
                  <label className={choiceCard(!addressId)}>
                    <input type="radio" name="addr" className="sr-only" checked={!addressId} onChange={() => pickAddress("")} />
                    <Dot on={!addressId} />
                    <span className="min-w-0">
                      <span className="block font-semibold">Autre adresse</span>
                      <span className="mt-0.5 block text-ink/70">Saisir une adresse de livraison</span>
                    </span>
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
              <Input inputMode="numeric" autoComplete="shipping postal-code" {...register("delivery.postalCode")} {...a("delivery.postalCode", !!errors.delivery?.postalCode)} className="tabular-nums" />
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
                  <Input inputMode="numeric" {...register("billing.postalCode")} {...a("billing.postalCode", !!errors.billing?.postalCode)} className="tabular-nums" />
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
            <div className="flex flex-col justify-center gap-3 sm:pt-7">
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
        </div>

        <aside className="min-w-0" aria-labelledby="recap-title">
          <div className="rounded-[8px] border border-rule bg-white shadow-sheet lg:sticky lg:top-[calc(var(--header-h)+24px)]">
            <div className="flex items-center justify-between gap-4 border-b border-rule px-4 py-3 sm:px-5">
              <h2 id="recap-title" className="t-label">
                Récapitulatif
              </h2>
              <Link href="/catalogue" className="link-u shrink-0 text-sm font-semibold">
                Ajouter des produits
              </Link>
            </div>
            <ul className="max-h-[min(46vh,440px)] divide-y divide-rule overflow-y-auto overscroll-contain px-4 sm:px-5">
              {hydrated ? lines.map((l, i) => <CartLineEditor key={`${l.productId}-${l.packagingId}`} line={l} index={i} dense />) : null}
            </ul>
            <div className="border-t border-rule px-4 py-4 sm:px-5">
              <dl className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ink/70">Références</dt>
                  <dd className="font-semibold tabular-nums">{hydrated ? lines.length : 0}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-rule pt-2 text-base">
                  <dt className="font-semibold">Total articles</dt>
                  <dd className="t-num text-lg">{count}</dd>
                </div>
              </dl>
              <p className="mt-4 flex items-start gap-2 rounded-[6px] bg-salt p-3 text-sm text-ink/80">
                <Icon name="info" size={18} className="mt-px shrink-0 text-mci" />
                {settings.priceMode === "on_request" ? "Prix et délai confirmés par MCI." : "Prix HT indicatifs, confirmés par MCI."}
              </p>
              {error ? (
                <p role="alert" className="mt-4 flex items-start gap-2 rounded-[6px] border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
                  <Icon name="warning" size={18} className="mt-px shrink-0" />
                  <span>{error}</span>
                </p>
              ) : null}
              <Button type="submit" variant="action" size="lg" disabled={isSubmitting || !hydrated} className="mt-4 w-full !px-4 !whitespace-normal text-center leading-tight">
                {isSubmitting ? "Envoi en cours…" : "Envoyer le bon de commande"}
                <Icon name="arrow" className="shrink-0" />
              </Button>
              <p className="mt-3 text-sm text-ink/70">Vous recevez un récapitulatif par email et un bon de commande en PDF.</p>
            </div>
          </div>
        </aside>
      </div>
    </form>
  );
}
