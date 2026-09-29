"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import type { ContainerKind, FamilySlug, Format, Packaging, Product, PropertySlug, SectorSlug } from "@/lib/types";
import { useData } from "@/lib/hooks/useData";
import { useCatalog } from "@/lib/store/catalog";
import { getBackend } from "@/lib/backend";
import { families } from "@/data/families";
import { sectors } from "@/data/sectors";
import { formatLabels, formatOrder, propertyLabels, propertyOrder } from "@/data/properties";
import { slugify } from "@/data/catalog";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea, Checkbox } from "@/components/ui/Field";
import { ToConfirm } from "@/components/ui/Badge";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { Icon } from "@/components/ui/Icon";

const containers: Record<ContainerKind, string> = { aerosol: "Aérosol", spray: "Flacon pulvérisateur", can5: "Bidon 5 L", jerrican20: "Jerrican 20 L", bucket: "Seau", cartridge: "Cartouche / seringue" };
const confirmables: Record<string, string> = {
  description: "Description",
  families: "Famille(s)",
  sectors: "Secteurs",
  properties: "Propriétés",
  formats: "Formats",
  packagings: "Conditionnements",
  usages: "Usages",
  instructions: "Mode d'emploi",
  dilution: "Dilution",
  technicalSheetUrl: "Fiche technique",
  sdsUrl: "FDS",
};

const blank = (): Product => ({
  id: "",
  slug: "",
  code: "",
  short: "",
  description: "",
  families: [],
  sectors: [],
  properties: [],
  formats: ["liquide"],
  container: "can5",
  packagings: [{ id: "5l", label: "Bidon 5 L", short: "5 L", container: "can5" }],
  usages: [],
  related: [],
  toConfirm: Object.keys(confirmables),
  active: true,
  featured: false,
  position: 999,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="min-w-0 rounded-[8px] border border-rule bg-white">
      <legend className="t-label float-left w-full border-b border-rule px-4 py-3 sm:px-6">{title}</legend>
      <div className="clear-both grid grid-cols-1 gap-4 px-4 py-5 sm:grid-cols-2 sm:px-6">{children}</div>
    </fieldset>
  );
}

function Toggles<T extends string>({ options, value, onChange, labels }: { options: readonly T[]; value: T[]; onChange: (v: T[]) => void; labels: (v: T) => string }) {
  return (
    <div className="flex flex-wrap gap-2 sm:col-span-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <label key={o} className={`inline-flex cursor-pointer select-none items-center gap-1.5 rounded-[4px] border px-2.5 py-1 text-sm transition-colors duration-150 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-mci ${on ? "border-mci bg-sky/60 font-semibold text-mci" : "border-rule bg-white font-medium text-ink/80 hover:border-ink/40 hover:text-ink"}`}>
            <input type="checkbox" className="sr-only" checked={on} onChange={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])} />
            {on ? <Icon name="check" size={14} className="shrink-0" /> : null}
            {labels(o)}
          </label>
        );
      })}
    </div>
  );
}

function FileField({ id, label, value, onChange, accept, folder }: { id: string; label: string; value?: string; onChange: (v: string) => void; accept: string; folder: string }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className="sm:col-span-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex flex-wrap items-center gap-2">
        <Input id={id} fieldSize="sm" className="min-w-0 flex-1 basis-56" value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder="https://… ou déposer un fichier" />
        <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[6px] border border-rule bg-white px-3 text-sm font-semibold text-ink transition-colors duration-150 hover:border-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-mci">
          <Icon name="download" size={14} className="rotate-180" /> {busy ? "Envoi…" : "Déposer"}
          <input
            type="file"
            accept={accept}
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              setBusy(true);
              setErr(null);
              try {
                onChange(await (await getBackend()).uploadFile(f, folder));
              } catch (x) {
                setErr(x instanceof Error ? x.message : "Envoi impossible");
              } finally {
                setBusy(false);
              }
            }}
          />
        </label>
        {value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="link-u text-sm">
            Ouvrir
          </a>
        ) : null}
      </div>
      {err ? <p className="mt-1 text-sm text-danger">{err}</p> : null}
    </div>
  );
}

export default function AdminProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const loadCatalog = useCatalog((s) => s.load);
  const isNew = id === "nouveau";
  const { data: all } = useData((b) => b.listAllProducts(), []);
  const [p, setP] = useState<Product | null>(isNew ? blank() : null);
  const [msg, setMsg] = useState<string | null>(null);
  const [usagesText, setUsagesText] = useState("");
  const [relatedText, setRelatedText] = useState("");

  useEffect(() => {
    if (isNew || !all) return;
    const found = all.find((x) => x.id === decodeURIComponent(id));
    if (found) {
      setP(found);
      setUsagesText(found.usages.join("\n"));
      setRelatedText(found.related.join(", "));
    }
  }, [all, id, isNew]);

  if (!p) return <p className="text-sm text-ink/70">{all ? "Produit introuvable." : "Chargement…"}</p>;
  const set = <K extends keyof Product>(k: K, v: Product[K]) => setP({ ...p, [k]: v });
  const setPack = (i: number, patch: Partial<Packaging>) => set("packagings", p.packagings.map((k, j) => (j === i ? { ...k, ...patch } : k)));
  const tc = (k: string) => (p.toConfirm.includes(k) ? <ToConfirm /> : null);

  const save = async () => {
    setMsg(null);
    if (!p.code.trim() || !p.short.trim()) {
      setMsg("Code et désignation obligatoires.");
      return;
    }
    const slug = p.slug || slugify(p.code);
    if ((all ?? []).some((x) => x.slug === slug && x.id !== p.id)) {
      setMsg(`Le slug « ${slug} » est déjà utilisé.`);
      return;
    }
    const product: Product = {
      ...p,
      id: p.id || `p-${slug}`,
      slug,
      usages: usagesText.split("\n").map((s) => s.trim()).filter(Boolean),
      related: relatedText.split(",").map((s) => slugify(s)).filter(Boolean),
      container: p.packagings[0]?.container ?? p.container,
    };
    try {
      await (await getBackend()).saveProduct(product);
      void loadCatalog();
      setMsg("Produit enregistré.");
      if (isNew) router.replace(`/admin/produits/${product.id}`);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Enregistrement impossible");
    }
  };

  return (
    <div className="max-w-5xl space-y-4">
      <Link href="/admin/produits" className="link-u inline-flex text-sm font-semibold">
        ← Produits
      </Link>
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        <span className="shrink-0 overflow-hidden rounded-[8px] border border-rule bg-white">
          <ProductVisual product={p} size={72} alt="" />
        </span>
        <div className="min-w-0">
          <h1 className="t-h2 break-words">{p.code || "Nouveau produit"}</h1>
          <p className="mt-1 text-ink/70">{p.short}</p>
        </div>
        {p.slug ? (
          <Link href={`/produit/${p.slug}`} target="_blank" className="link-u inline-flex items-center gap-1 text-sm font-semibold sm:ml-auto">
            Voir la fiche publique <Icon name="external" size={14} />
          </Link>
        ) : null}
      </div>
      {p.adminNote ? <p className="rounded-[8px] border border-warn/40 bg-warn/10 px-4 py-3 text-sm">Note interne : {p.adminNote}</p> : null}

      <Section title="Identité">
        <div>
          <Label htmlFor="pc" required>Code (nom commercial)</Label>
          <Input id="pc" fieldSize="sm" className="t-code" value={p.code} onChange={(e) => set("code", e.target.value.toUpperCase())} />
        </div>
        <div>
          <Label htmlFor="ps">Slug (URL)</Label>
          <Input id="ps" fieldSize="sm" className="t-mono" value={p.slug} placeholder={slugify(p.code)} onChange={(e) => set("slug", slugify(e.target.value))} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="pshort" required>Désignation courte</Label>
          <Input id="pshort" fieldSize="sm" value={p.short} onChange={(e) => set("short", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="pdesc">Description {tc("description")}</Label>
          <Textarea id="pdesc" rows={3} value={p.description} onChange={(e) => set("description", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="pvar">Variantes</Label>
          <Input id="pvar" fieldSize="sm" value={p.variants ?? ""} onChange={(e) => set("variants", e.target.value || undefined)} placeholder="Existe en gel, en version bio…" />
        </div>
      </Section>

      <Section title="Classement">
        <p className="text-sm font-semibold sm:col-span-2">Familles {tc("families")}</p>
        <Toggles options={families.map((f) => f.slug)} value={p.families} onChange={(v) => set("families", v as FamilySlug[])} labels={(v) => families.find((f) => f.slug === v)!.name} />
        <p className="text-sm font-semibold sm:col-span-2">Secteurs {tc("sectors")}</p>
        <Toggles options={sectors.map((s) => s.slug)} value={p.sectors} onChange={(v) => set("sectors", v as SectorSlug[])} labels={(v) => sectors.find((s) => s.slug === v)!.name} />
        <p className="text-sm font-semibold sm:col-span-2">Propriétés {tc("properties")}</p>
        <Toggles options={propertyOrder} value={p.properties} onChange={(v) => set("properties", v as PropertySlug[])} labels={(v) => propertyLabels[v].label} />
        <p className="text-sm font-semibold sm:col-span-2">Formats {tc("formats")}</p>
        <Toggles options={formatOrder} value={p.formats} onChange={(v) => set("formats", v as Format[])} labels={(v) => formatLabels[v]} />
      </Section>

      <Section title="Conditionnements">
        <div className="sm:col-span-2">{tc("packagings")}</div>
        {p.packagings.map((k, i) => (
          <div key={i} className="grid grid-cols-1 gap-2 rounded-[6px] border border-rule bg-salt p-3 sm:col-span-2 sm:grid-cols-[1fr_2fr_1fr_1.5fr_auto]">
            <Input fieldSize="sm" aria-label="Identifiant" className="t-mono" value={k.id} onChange={(e) => setPack(i, { id: slugify(e.target.value) })} />
            <Input fieldSize="sm" aria-label="Libellé" value={k.label} onChange={(e) => setPack(i, { label: e.target.value })} />
            <Input fieldSize="sm" aria-label="Libellé court" className="t-mono" value={k.short} onChange={(e) => setPack(i, { short: e.target.value.toUpperCase() })} />
            <Select fieldSize="sm" aria-label="Contenant 3D" value={k.container} onChange={(e) => setPack(i, { container: e.target.value as ContainerKind })}>
              {(Object.keys(containers) as ContainerKind[]).map((c) => (
                <option key={c} value={c}>
                  {containers[c]}
                </option>
              ))}
            </Select>
            <button type="button" aria-label="Supprimer ce conditionnement" className="grid size-9 place-items-center justify-self-end rounded-[6px] text-ink/70 transition-colors duration-150 hover:bg-danger/10 hover:text-danger" onClick={() => set("packagings", p.packagings.filter((_, j) => j !== i))}>
              <Icon name="trash" size={16} />
            </button>
          </div>
        ))}
        <button type="button" className="link-u inline-flex items-center gap-1 justify-self-start text-sm font-semibold sm:col-span-2" onClick={() => set("packagings", [...p.packagings, { id: `c${p.packagings.length + 1}`, label: "", short: "", container: "can5" }])}>
          <Icon name="plus" size={14} /> Ajouter un conditionnement
        </button>
      </Section>

      <Section title="Usage">
        <div className="sm:col-span-2">
          <Label htmlFor="pus">Usages (un par ligne) {tc("usages")}</Label>
          <Textarea id="pus" rows={4} value={usagesText} onChange={(e) => setUsagesText(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="pmode">Mode d&apos;emploi {tc("instructions")}</Label>
          <Textarea id="pmode" rows={3} value={p.instructions ?? ""} onChange={(e) => set("instructions", e.target.value || undefined)} />
        </div>
        <div>
          <Label htmlFor="pdil">Dilution {tc("dilution")}</Label>
          <Input id="pdil" fieldSize="sm" className="t-mono" value={p.dilution ?? ""} onChange={(e) => set("dilution", e.target.value || undefined)} placeholder="Ex. 2 à 5 %" />
        </div>
        <div>
          <Label htmlFor="prel">Souvent commandé avec (codes, virgules)</Label>
          <Input id="prel" fieldSize="sm" className="t-mono" value={relatedText} onChange={(e) => setRelatedText(e.target.value)} />
        </div>
      </Section>

      <Section title="Documents et visuel">
        <FileField id="pft" label="Fiche technique (PDF)" value={p.technicalSheetUrl} onChange={(v) => set("technicalSheetUrl", v || undefined)} accept="application/pdf" folder="fiches-techniques" />
        <FileField id="pfds" label="Fiche de données de sécurité (PDF)" value={p.sdsUrl} onChange={(v) => set("sdsUrl", v || undefined)} accept="application/pdf" folder="fds" />
        <FileField id="pimg" label="Photo produit (prioritaire sur le rendu 3D)" value={p.imageUrl} onChange={(v) => set("imageUrl", v || undefined)} accept="image/*" folder="photos" />
      </Section>

      <Section title="Publication et validation">
        <Checkbox id="pact" checked={p.active} onChange={(e) => set("active", e.target.checked)} label="Actif (visible au catalogue)" />
        <Checkbox id="pfeat" checked={p.featured} onChange={(e) => set("featured", e.target.checked)} label="Mis en avant (accueil, rayon)" />
        <p className="text-sm font-semibold sm:col-span-2">Champs encore à confirmer par MCI (masqués côté public)</p>
        <Toggles options={Object.keys(confirmables)} value={p.toConfirm} onChange={(v) => set("toConfirm", v)} labels={(v) => confirmables[v] ?? v} />
        <div className="sm:col-span-2">
          <Label htmlFor="pnote">Note interne</Label>
          <Input id="pnote" fieldSize="sm" value={p.adminNote ?? ""} onChange={(e) => set("adminNote", e.target.value || undefined)} />
        </div>
      </Section>

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center gap-3 rounded-[8px] border border-rule bg-white px-4 py-3 shadow-sheet">
        <Button onClick={save}>Enregistrer</Button>
        {msg ? <span role="status" className="text-sm text-ink/70">{msg}</span> : null}
        {!isNew ? (
          <Button
            variant="danger"
            size="sm"
            className="ml-auto"
            onClick={async () => {
              if (!confirm(`Supprimer définitivement ${p.code} ? (Pour le masquer, décochez plutôt « Actif ».)`)) return;
              await (await getBackend()).deleteProduct(p.id);
              void loadCatalog();
              router.push("/admin/produits");
            }}
          >
            Supprimer
          </Button>
        ) : null}
      </div>
    </div>
  );
}
