"use client";
import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import { useCatalog } from "@/lib/store/catalog";
import { useAddToCart } from "@/components/cart/AddToCart";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { Stepper } from "@/components/ui/Stepper";
import { Icon } from "@/components/ui/Icon";
import { norm } from "@/lib/format";

const steps = [
  { t: "Composez votre bon", d: "Depuis le catalogue, par référence, ou en rechargeant une commande passée." },
  { t: "Indiquez vos références d'achat", d: "N° de bon de commande interne, n° d'engagement et code service Chorus Pro pour les collectivités." },
  { t: "MCI confirme", d: "Disponibilité, prix et délai vous sont confirmés avant toute préparation." },
  { t: "Livraison et facture", d: "Bon de livraison et facture sont rangés dans votre espace pro." },
];

/** Ajout par référence : on tape le code, on choisit le conditionnement et la quantité, c'est dans le bon. */
function QuickAdd() {
  const products = useCatalog((s) => s.products);
  const add = useAddToCart();
  const id = useId();
  const btn = useRef<HTMLButtonElement>(null);
  const [code, setCode] = useState("");
  const [qty, setQty] = useState(1);
  const [pack, setPack] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const product = useMemo(() => {
    const c = norm(code).replace(/\s+/g, "");
    if (c.length < 2) return undefined;
    return products.find((p) => p.active && norm(p.code).replace(/\s+/g, "") === c) ?? products.find((p) => p.active && norm(p.code).replace(/\s+/g, "").startsWith(c));
  }, [code, products]);
  const packId = product?.packagings.some((k) => k.id === pack) ? pack : (product?.packagings[0]?.id ?? "");

  return (
    <form
      className="rounded-[12px] border border-rule bg-white p-5 shadow-sheet sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        if (!product) return;
        add(product, packId, qty, btn.current);
        setDone(`${qty} × ${product.code} ajouté${qty > 1 ? "s" : ""} au bon de commande.`);
        setCode("");
        setQty(1);
      }}
    >
      <p className="font-display text-xl font-bold">Ajouter par référence</p>
      <p className="mt-1 text-sm text-ink/70">Vous connaissez le code ? Pas besoin de passer par le catalogue.</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div>
          <label htmlFor={`${id}-code`} className="mb-1.5 block text-sm font-semibold">
            Référence
          </label>
          <input
            id={`${id}-code`}
            list={`${id}-codes`}
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setDone(null);
            }}
            placeholder="Ex. DG90, KERMEX, CST"
            autoComplete="off"
            className="h-11 w-full rounded-[6px] border border-rule px-3 font-display text-lg font-bold uppercase tracking-wide placeholder:font-body placeholder:text-base placeholder:font-normal placeholder:normal-case placeholder:tracking-normal placeholder:text-ink/55 focus:border-mci focus:shadow-[0_0_0_3px_rgb(31_106_153/0.2)] focus:outline-none"
          />
          <datalist id={`${id}-codes`}>
            {products
              .filter((p) => p.active)
              .map((p) => (
                <option key={p.id} value={p.code}>
                  {p.short}
                </option>
              ))}
          </datalist>
        </div>
        <div>
          <span className="mb-1.5 block text-sm font-semibold">Quantité</span>
          <Stepper value={qty} onChange={setQty} label="Quantité" />
        </div>
      </div>

      <div className="mt-4 flex min-h-[72px] items-center gap-4 rounded-[8px] bg-salt p-3">
        {product ? (
          <>
            <span className="plate grid size-14 shrink-0 place-items-center rounded-[6px]">
              <ProductVisual product={product} size={56} alt="" className="h-12 w-auto" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="t-code block text-lg leading-tight text-mci">{product.code}</span>
              <span className="block truncate text-sm">{product.short}</span>
            </span>
            <label className="sr-only" htmlFor={`${id}-pack`}>
              Conditionnement
            </label>
            <select id={`${id}-pack`} value={packId} onChange={(e) => setPack(e.target.value)} className="h-9 max-w-[42%] cursor-pointer rounded-[6px] border border-rule bg-white px-2 text-sm">
              {product.packagings.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.label}
                </option>
              ))}
            </select>
          </>
        ) : (
          <p className="text-sm text-ink/70">{code.trim().length >= 2 ? `Aucune référence ne commence par « ${code.trim().toUpperCase()} ».` : "Le produit correspondant s'affiche ici."}</p>
        )}
      </div>

      <button ref={btn} type="submit" disabled={!product} className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-action font-semibold text-ink transition-colors duration-150 hover:bg-action-hover disabled:opacity-50">
        <Icon name="plus" size={18} /> Ajouter au bon de commande
      </button>
      <p role="status" className="mt-3 min-h-5 text-sm font-medium text-ok">
        {done}
      </p>
      <p className="border-t border-rule pt-3 text-sm">
        Toute une liste à saisir ?{" "}
        <Link href="/commande-rapide" className="link-u font-semibold">
          Commande rapide, ligne par ligne ou par import
        </Link>
      </p>
    </form>
  );
}

export function OrderSection() {
  return (
    <section aria-labelledby="commander-title" className="py-16 lg:py-24">
      <div className="wrap grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8 [&>*]:min-w-0">
        <div className="lg:col-span-6">
          <h2 id="commander-title" className="t-h1 max-w-[20ch]">
            Commander en ligne, comme par téléphone
          </h2>
          <p className="t-lead mt-3 max-w-[52ch] text-ink/70">Avec ou sans compte. Pas de paiement en ligne : virement, facture à échéance ou mandat administratif.</p>
          <ol className="mt-8 space-y-6">
            {steps.map((s, i) => (
              <li key={s.t} className="flex gap-4">
                <span className="t-num grid size-10 shrink-0 place-items-center rounded-[6px] bg-mci text-lg text-white">{i + 1}</span>
                <span className="pt-1">
                  <span className="block font-display text-xl font-bold leading-tight">{s.t}</span>
                  <span className="mt-1 block text-ink/70">{s.d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <QuickAdd />
        </div>
      </div>
    </section>
  );
}
