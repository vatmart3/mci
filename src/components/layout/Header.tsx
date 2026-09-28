"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/ui/Icon";
import { useCart, cartCount } from "@/lib/store/cart";
import { useUI } from "@/lib/store/ui";
import { useSession } from "@/lib/store/session";
import { sectors, sectorGroups } from "@/data/sectors";
import { company } from "@/data/company";
import { cx } from "@/lib/cx";

const nav = [
  { href: "/catalogue", label: "Catalogue" },
  { href: "/#secteurs", label: "Secteurs", menu: true },
  { href: "/societe", label: "La société" },
  { href: "/contact", label: "Contact" },
];

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
    ref.current.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(0.92)" }, { transform: "scale(1)" }],
      { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" },
    );
  }, [bump]);
  return (
    <button
      type="button"
      onClick={openDrawer}
      data-cart-target
      className={cx(
        "inline-flex items-center gap-2 rounded-tech bg-action text-ink font-semibold border border-action",
        "transition-colors duration-200 ease-out hover:bg-ink hover:text-action hover:border-ink",
        compact ? "h-10 px-3 text-sm" : "h-10 px-4 text-sm",
      )}
      aria-label={`Bon de commande, ${count} article${count > 1 ? "s" : ""}`}
    >
      <Icon name="order" size={18} />
      <span className={compact ? "sr-only" : "hidden xl:inline"}>Bon de commande</span>
      <span ref={ref} className="t-mono inline-grid min-w-6 place-items-center rounded-tech bg-ink px-1 text-xs text-white">
        {count}
      </span>
    </button>
  );
}

export function Header({ bannerText }: { bannerText?: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [sectorsOpen, setSectorsOpen] = useState(false);
  const menuOpen = useUI((s) => s.menuOpen);
  const setMenu = useUI((s) => s.setMenu);
  const user = useSession((s) => s.user);
  const settings = useSession((s) => s.settings);
  const banner = settings.banner || bannerText;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenu(false);
    setSectorsOpen(false);
  }, [pathname, setMenu]);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const proHref = user ? (user.role === "admin" || user.role === "sales" ? "/admin" : "/espace-pro") : "/espace-pro";
  const proLabel = user ? (user.role === "admin" || user.role === "sales" ? "Back-office" : "Mon espace pro") : "Espace pro";

  return (
    <>
      <a href="#contenu" className="sr-only-focusable fixed left-4 top-4 z-[70] bg-ink px-4 py-2 text-white">
        Aller au contenu
      </a>
      {banner ? (
        <div className="bg-deep text-white">
          <p className="wrap t-mono py-2 text-center text-xs">{banner}</p>
        </div>
      ) : null}
      <header
        data-site-header
        className={cx(
          "sticky top-0 z-50 border-b bg-salt transition-[height,border-color] duration-300 ease-out",
          scrolled ? "h-14 border-rule" : "h-14 lg:h-18 border-salt",
        )}
      >
        <div className="wrap flex h-full items-center justify-between gap-6">
          <Link href="/" className="shrink-0" aria-label="MCI Sète — accueil">
            <span className={cx("block origin-left transition-transform duration-300 ease-out", scrolled ? "scale-[0.86]" : "scale-100")}>
              <Logo />
            </span>
          </Link>

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {nav.map((item) =>
                item.menu ? (
                  <li key={item.label} className="relative" onMouseLeave={() => setSectorsOpen(false)}>
                    <button
                      type="button"
                      className="flex items-center gap-1 py-2 font-medium hover:text-mci"
                      aria-expanded={sectorsOpen}
                      aria-controls="menu-secteurs"
                      onClick={() => setSectorsOpen((v) => !v)}
                      onMouseEnter={() => setSectorsOpen(true)}
                    >
                      {item.label}
                      <Icon name="chevronDown" size={14} className={cx("transition-transform duration-200", sectorsOpen && "rotate-180")} />
                    </button>
                    <div
                      id="menu-secteurs"
                      hidden={!sectorsOpen}
                      className="absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-2"
                      onKeyDown={(e) => e.key === "Escape" && setSectorsOpen(false)}
                    >
                      <div className="grid grid-cols-3 gap-6 rounded-box border border-rule bg-white p-6 shadow-sheet">
                        {(Object.keys(sectorGroups) as (keyof typeof sectorGroups)[]).map((g) => (
                          <div key={g}>
                            <p className="t-mono mb-3 text-xs text-ink/70">{sectorGroups[g].toUpperCase()}</p>
                            <ul className="space-y-2">
                              {sectors
                                .filter((s) => s.group === g)
                                .map((s) => (
                                  <li key={s.slug}>
                                    <Link href={`/secteurs/${s.slug}`} className="link-u decoration-rule hover:decoration-mci">
                                      {s.name}
                                    </Link>
                                  </li>
                                ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </li>
                ) : (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cx("py-2 font-medium hover:text-mci", pathname.startsWith(item.href) && "text-mci underline underline-offset-8")}
                      aria-current={pathname.startsWith(item.href) ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <div className="flex items-center gap-4">
            <a href={`tel:${company.phoneE164}`} className="t-mono hidden text-sm font-medium hover:text-mci md:inline-flex md:items-center md:gap-2">
              <Icon name="phone" size={16} />
              {company.phone}
            </a>
            <Link href={proHref} className="hidden items-center gap-2 text-sm font-medium hover:text-mci lg:inline-flex">
              <Icon name="user" size={18} />
              {proLabel}
            </Link>
            <CartCounterButton />
            <button
              type="button"
              className="grid size-10 place-items-center rounded-tech border border-rule bg-white lg:hidden"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              aria-controls="menu-mobile"
              onClick={() => setMenu(!menuOpen)}
            >
              <Icon name={menuOpen ? "close" : "menu"} />
            </button>
          </div>
        </div>

        {/* Menu plein écran mobile */}
        <div id="menu-mobile" hidden={!menuOpen} className="fixed inset-x-0 bottom-0 top-14 z-40 overflow-y-auto bg-salt lg:hidden">
          <nav aria-label="Navigation mobile" className="wrap flex min-h-full flex-col py-8">
            <ul className="border-t border-rule">
              {[{ href: "/catalogue", label: "Catalogue" }, { href: "/commande-rapide", label: "Commande rapide" }, { href: "/societe", label: "La société" }, { href: "/contact", label: "Contact" }, { href: proHref, label: proLabel }].map((l) => (
                <li key={l.href} className="border-b border-rule">
                  <Link href={l.href} className="t-h2 flex items-center justify-between py-4" onClick={() => setMenu(false)}>
                    {l.label}
                    <Icon name="arrow" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="t-mono mb-3 mt-8 text-xs text-ink/70">SECTEURS</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {sectors.map((s) => (
                <li key={s.slug}>
                  <Link href={`/secteurs/${s.slug}`} className="link-u" onClick={() => setMenu(false)}>
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
            <a href={`tel:${company.phoneE164}`} className="t-h2 t-mono mt-auto pt-12 text-mci">
              {company.phone}
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
