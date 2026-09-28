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
        "inline-flex items-center gap-2 rounded-full bg-action text-ink font-medium",
        "transition-[background-color,box-shadow,transform] duration-300 ease-out hover:bg-[#ffa55c] active:scale-95",
        compact ? "h-9 px-3 text-sm" : "h-9 pl-3 pr-2 text-sm",
      )}
      aria-label={`Bon de commande, ${count} article${count > 1 ? "s" : ""}`}
    >
      <Icon name="order" size={18} />
      <span className={compact ? "sr-only" : "hidden xl:inline"}>Bon de commande</span>
      <span ref={ref} className="inline-grid h-6 min-w-6 place-items-center rounded-full bg-ink px-2 text-xs font-semibold text-white">
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
      <a href="#contenu" className="sr-only-focusable fixed left-4 top-4 z-[70] rounded-full bg-ink px-4 py-2 text-white">
        Aller au contenu
      </a>
      {banner ? (
        <div className="bg-salt text-ink">
          <p className="wrap py-3 text-center text-sm">{banner}</p>
        </div>
      ) : null}
      <header
        data-site-header
        className={cx(
          "glass sticky top-0 z-50 h-14 border-b transition-[border-color,background-color] duration-500 ease-out",
          scrolled || menuOpen ? "border-black/10" : "border-transparent",
        )}
      >
        <div className="wrap flex h-full items-center justify-between gap-6">
          <Link href="/" className="shrink-0">
            <span className="block origin-left scale-[0.8]">
              <Logo />
            </span>
          </Link>

          <nav aria-label="Navigation principale" className="hidden lg:block">
            <ul className="flex items-center gap-8 text-sm">
              {nav.map((item) =>
                item.menu ? (
                  <li key={item.label} className="relative" onMouseLeave={() => setSectorsOpen(false)}>
                    <button
                      type="button"
                      className="flex items-center gap-1 py-2 text-ink/80 transition-colors hover:text-ink"
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
                      className="absolute left-1/2 top-full w-[620px] -translate-x-1/2 pt-3"
                      onKeyDown={(e) => e.key === "Escape" && setSectorsOpen(false)}
                    >
                      <div className="grid animate-rise grid-cols-3 gap-6 rounded-box bg-white p-8 shadow-float ring-1 ring-black/5">
                        {(Object.keys(sectorGroups) as (keyof typeof sectorGroups)[]).map((g) => (
                          <div key={g}>
                            <p className="mb-3 text-xs font-medium text-ink/70">{sectorGroups[g]}</p>
                            <ul className="space-y-2">
                              {sectors
                                .filter((s) => s.group === g)
                                .map((s) => (
                                  <li key={s.slug}>
                                    <Link href={`/secteurs/${s.slug}`} className="text-sm font-semibold text-ink transition-colors hover:text-mci">
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
                      className={cx("py-2 transition-colors hover:text-ink", pathname.startsWith(item.href) ? "text-ink" : "text-ink/80")}
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
            <a href={`tel:${company.phoneE164}`} className="hidden text-sm text-ink/80 transition-colors hover:text-ink md:inline-flex md:items-center md:gap-2">
              <Icon name="phone" size={16} />
              {company.phone}
            </a>
            <Link href={proHref} className="hidden items-center gap-2 text-sm text-ink/80 transition-colors hover:text-ink lg:inline-flex">
              <Icon name="user" size={18} />
              {proLabel}
            </Link>
            <CartCounterButton />
            <button
              type="button"
              className="grid size-10 place-items-center rounded-full transition-colors hover:bg-black/5 lg:hidden"
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
        <div id="menu-mobile" hidden={!menuOpen} className="fixed inset-x-0 bottom-0 top-14 z-40 overflow-y-auto bg-white lg:hidden">
          <nav aria-label="Navigation mobile" className="wrap flex min-h-full flex-col py-8">
            <ul>
              {[{ href: "/catalogue", label: "Catalogue" }, { href: "/commande-rapide", label: "Commande rapide" }, { href: "/societe", label: "La société" }, { href: "/contact", label: "Contact" }, { href: proHref, label: proLabel }].map((l) => (
                <li key={l.href} className="animate-rise">
                  <Link href={l.href} className="t-h2 flex items-center justify-between py-3" onClick={() => setMenu(false)}>
                    {l.label}
                    <Icon name="arrow" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mb-3 mt-12 text-sm font-medium text-ink/70">Secteurs</p>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {sectors.map((s) => (
                <li key={s.slug}>
                  <Link href={`/secteurs/${s.slug}`} className="font-medium" onClick={() => setMenu(false)}>
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
            <a href={`tel:${company.phoneE164}`} className="t-h2 mt-auto pt-12 text-mci">
              {company.phone}
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}
