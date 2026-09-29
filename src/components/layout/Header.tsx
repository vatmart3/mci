"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Icon, type IconName } from "@/components/ui/Icon";
import { InstantSearch } from "@/components/search/InstantSearch";
import { ProductVisual } from "@/components/catalog/ProductVisual";
import { useCart, cartCount } from "@/lib/store/cart";
import { useUI } from "@/lib/store/ui";
import { useSession } from "@/lib/store/session";
import { useCatalog } from "@/lib/store/catalog";
import { sectors, sectorGroups } from "@/data/sectors";
import { families } from "@/data/families";
import { company } from "@/data/company";
import { cx } from "@/lib/cx";

export function CartCounterButton({ compact = false }: { compact?: boolean }) {
  const lines = useCart((s) => s.lines);
  const bump = useUI((s) => s.bump);
  const openDrawer = useUI((s) => s.openDrawer);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const count = hydrated ? cartCount(lines) : 0;
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!bump || !ref.current) return;
    ref.current.animate([{ transform: "scale(1)" }, { transform: "scale(1.3)" }, { transform: "scale(1)" }], { duration: 320, easing: "cubic-bezier(0.16, 1, 0.3, 1)" });
  }, [bump]);
  return (
    <button
      type="button"
      onClick={openDrawer}
      data-cart-target
      className={cx(
        "inline-flex h-11 items-center gap-2 rounded-[6px] bg-action font-semibold text-ink transition-colors duration-150 hover:bg-action-hover",
        compact ? "px-3" : "pl-3 pr-2",
      )}
      aria-label={`Bon de commande, ${count} article${count > 1 ? "s" : ""}`}
    >
      <Icon name="order" size={20} />
      <span className={compact ? "sr-only" : "hidden xl:inline"}>Bon de commande</span>
      <span ref={ref} className="inline-grid h-6 min-w-6 place-items-center rounded-[4px] bg-ink px-1.5 text-xs font-bold text-white tabular-nums">
        {count}
      </span>
    </button>
  );
}

type Menu = "catalogue" | "secteurs" | null;

function CatalogueMenu({ onClose }: { onClose: () => void }) {
  const products = useCatalog((s) => s.products);
  const byFamily = useMemo(() => {
    const m = new Map<string, { count: number; pick?: (typeof products)[number] }>();
    for (const f of families) {
      const list = products.filter((p) => p.active && p.families.includes(f.slug));
      m.set(f.slug, { count: list.length, pick: list.find((p) => p.featured) ?? list[0] });
    }
    return m;
  }, [products]);
  return (
    <div className="wrap grid grid-cols-12 gap-8 py-8">
      <ul className="col-span-9 grid grid-cols-3 gap-x-6 gap-y-1">
        {families.map((f) => {
          const info = byFamily.get(f.slug);
          return (
            <li key={f.slug}>
              <Link href={`/catalogue/${f.slug}`} onClick={onClose} className="group flex items-center gap-3 rounded-[6px] p-2 transition-colors duration-150 hover:bg-salt">
                <span className="plate grid size-14 shrink-0 place-items-center rounded-[6px]">
                  {info?.pick ? <ProductVisual product={info.pick} size={56} alt="" className="h-12 w-auto" /> : <Icon name="grid" size={20} className="text-mci" />}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold leading-tight group-hover:text-mci">{f.name}</span>
                  <span className="text-sm text-ink/70">{info?.count ? `${info.count} produit${info.count > 1 ? "s" : ""}` : "Gamme sur demande"}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="col-span-3 flex flex-col justify-between rounded-[8px] bg-salt p-6">
        <div>
          <p className="font-display text-lg font-bold">Vous connaissez vos références ?</p>
          <p className="mt-2 text-sm text-ink/70">Saisissez-les ligne par ligne ou collez une liste : le bon se remplit tout seul.</p>
        </div>
        <div className="mt-6 flex flex-col gap-2">
          <Link href="/commande-rapide" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-[6px] bg-mci px-4 font-semibold text-white hover:bg-deep">
            Commande rapide
          </Link>
          <Link href="/catalogue" onClick={onClose} className="inline-flex h-11 items-center justify-center rounded-[6px] border border-rule bg-white px-4 font-semibold hover:border-ink">
            Tout le catalogue
          </Link>
        </div>
      </div>
    </div>
  );
}

function SecteursMenu({ onClose }: { onClose: () => void }) {
  return (
    <div className="wrap grid grid-cols-3 gap-8 py-8">
      {(Object.keys(sectorGroups) as (keyof typeof sectorGroups)[]).map((g) => (
        <div key={g}>
          <p className="border-b border-rule pb-2 text-sm font-semibold text-ink/70">{sectorGroups[g]}</p>
          <ul className="mt-2">
            {sectors
              .filter((s) => s.group === g)
              .map((s) => (
                <li key={s.slug}>
                  <Link href={`/secteurs/${s.slug}`} onClick={onClose} className="group flex items-start gap-3 rounded-[6px] p-2 transition-colors duration-150 hover:bg-salt">
                    <Icon name={`sec-${s.slug}` as IconName} size={24} className="mt-0.5 shrink-0 text-mci" />
                    <span>
                      <span className="block font-semibold group-hover:text-mci">{s.name}</span>
                      <span className="line-clamp-1 text-sm text-ink/70">{s.buyer}</span>
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function Header({ bannerText }: { bannerText?: string }) {
  const pathname = usePathname();
  const [menu, setMenu] = useState<Menu>(null);
  const [elevated, setElevated] = useState(false);
  const menuOpen = useUI((s) => s.menuOpen);
  const setMobile = useUI((s) => s.setMenu);
  const user = useSession((s) => s.user);
  const settings = useSession((s) => s.settings);
  const banner = settings.banner || bannerText;
  const closeTimer = useRef<number>(0);

  useEffect(() => {
    const onScroll = () => setElevated(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobile(false);
    setMenu(null);
  }, [pathname, setMobile]);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menu]);

  const hover = (m: Menu) => {
    window.clearTimeout(closeTimer.current);
    setMenu(m);
  };
  const leave = () => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMenu(null), 140);
  };

  const staff = user?.role === "admin" || user?.role === "sales";
  const proHref = staff ? "/admin" : "/espace-pro";
  const proLabel = user ? (staff ? "Back-office" : "Mon espace pro") : "Espace pro";
  const home = pathname === "/";

  const navItem = (active: boolean) => cx("relative flex h-full items-center px-1 font-semibold transition-colors duration-150 hover:text-mci", active ? "text-mci" : "text-ink");

  return (
    <>
      <a href="#contenu" className="sr-only-focusable fixed left-4 top-4 z-[70] rounded-[6px] bg-ink px-4 py-2 text-white">
        Aller au contenu
      </a>

      {/* Barre utilitaire */}
      <div className="hidden bg-night text-white lg:block">
        <div className="wrap flex h-9 items-center justify-between text-sm">
          <p className="text-white/80">{banner || `Produits d'entretien et de maintenance professionnels · ${company.city}, depuis ${company.founded}`}</p>
          <ul className="flex items-center gap-6">
            <li>
              <a href={`tel:${company.phoneE164}`} className="inline-flex items-center gap-2 font-semibold hover:text-sky">
                <Icon name="phone" size={15} /> {company.phone}
              </a>
            </li>
            <li>
              <Link href="/commande-rapide" className="text-white/85 hover:text-white">
                Commande rapide
              </Link>
            </li>
            <li>
              <Link href="/contact?objet=devis" className="text-white/85 hover:text-white">
                Demander un devis
              </Link>
            </li>
          </ul>
        </div>
      </div>
      {banner ? <p className="bg-night px-4 py-2 text-center text-sm text-white lg:hidden">{banner}</p> : null}

      <header
        data-site-header
        onMouseLeave={leave}
        className={cx("sticky top-0 z-50 border-b border-rule bg-white transition-shadow duration-200", (elevated || menu) && "shadow-[0_6px_20px_-12px_rgb(22_35_45/0.25)]")}
      >
        <div className="wrap flex h-[76px] items-center gap-6">
          <Link href="/" className="shrink-0" aria-current={home ? "page" : undefined}>
            <Logo />
          </Link>

          <nav aria-label="Navigation principale" className="hidden h-full lg:block">
            <ul className="flex h-full items-stretch gap-6">
              <li className="flex" onMouseEnter={() => hover("catalogue")}>
                <button type="button" className={navItem(pathname.startsWith("/catalogue") || pathname.startsWith("/produit"))} aria-expanded={menu === "catalogue"} aria-controls="mega-catalogue" onClick={() => setMenu(menu === "catalogue" ? null : "catalogue")}>
                  Catalogue
                  <Icon name="chevronDown" size={16} className={cx("ml-1 transition-transform duration-150", menu === "catalogue" && "rotate-180")} />
                </button>
              </li>
              <li className="flex" onMouseEnter={() => hover("secteurs")}>
                <button type="button" className={navItem(pathname.startsWith("/secteurs"))} aria-expanded={menu === "secteurs"} aria-controls="mega-secteurs" onClick={() => setMenu(menu === "secteurs" ? null : "secteurs")}>
                  Secteurs
                  <Icon name="chevronDown" size={16} className={cx("ml-1 transition-transform duration-150", menu === "secteurs" && "rotate-180")} />
                </button>
              </li>
              {[
                { href: "/societe", label: "La société" },
                { href: "/contact", label: "Contact" },
              ].map((l) => (
                <li key={l.href} className="flex" onMouseEnter={() => hover(null)}>
                  <Link href={l.href} className={navItem(pathname.startsWith(l.href))} aria-current={pathname.startsWith(l.href) ? "page" : undefined}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {!home ? <InstantSearch size="compact" className="hidden w-64 xl:block" /> : null}
            <Link href={proHref} className="hidden h-11 items-center gap-2 rounded-[6px] px-3 font-semibold transition-colors duration-150 hover:bg-salt lg:inline-flex">
              <Icon name="user" size={20} className="text-mci" />
              {proLabel}
            </Link>
            <CartCounterButton />
            <button
              type="button"
              className="grid size-11 place-items-center rounded-[6px] border border-rule lg:hidden"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              onClick={() => setMobile(!menuOpen)}
            >
              <Icon name={menuOpen ? "close" : "menu"} />
            </button>
          </div>
        </div>

        {/* Méga-menus */}
        <div id="mega-catalogue" hidden={menu !== "catalogue"} onMouseEnter={() => hover("catalogue")} className="absolute inset-x-0 top-full hidden animate-drop border-y border-rule bg-white shadow-sheet lg:block">
          <CatalogueMenu onClose={() => setMenu(null)} />
        </div>
        <div id="mega-secteurs" hidden={menu !== "secteurs"} onMouseEnter={() => hover("secteurs")} className="absolute inset-x-0 top-full hidden animate-drop border-y border-rule bg-white shadow-sheet lg:block">
          <SecteursMenu onClose={() => setMenu(null)} />
        </div>

        {/* Menu mobile */}
        <div id="menu-mobile" hidden={!menuOpen} className="fixed inset-x-0 bottom-0 top-[77px] z-40 animate-fade overflow-y-auto bg-white lg:hidden">
          <nav aria-label="Navigation mobile" className="wrap flex min-h-full flex-col gap-8 py-6">
            <InstantSearch size="compact" />
            <ul className="divide-y divide-rule border-y border-rule">
              {[
                { href: "/catalogue", label: "Catalogue" },
                { href: "/commande-rapide", label: "Commande rapide" },
                { href: "/societe", label: "La société" },
                { href: "/contact", label: "Contact" },
                { href: proHref, label: proLabel },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="flex items-center justify-between py-4 font-display text-xl font-bold" onClick={() => setMobile(false)}>
                    {l.label}
                    <Icon name="chevronRight" className="text-mci" />
                  </Link>
                </li>
              ))}
            </ul>
            <div>
              <p className="mb-3 text-sm font-semibold text-ink/70">Secteurs</p>
              <ul className="grid grid-cols-2 gap-2">
                {sectors.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/secteurs/${s.slug}`} className="flex items-center gap-2 rounded-[6px] bg-salt px-3 py-3 text-sm font-semibold" onClick={() => setMobile(false)}>
                      <Icon name={`sec-${s.slug}` as IconName} size={20} className="shrink-0 text-mci" />
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <a href={`tel:${company.phoneE164}`} className="mt-auto inline-flex items-center gap-3 rounded-[8px] bg-night p-4 font-display text-2xl font-bold text-white">
              <Icon name="phone" /> {company.phone}
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
