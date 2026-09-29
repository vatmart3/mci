/**
 * Pictogrammes MCI — dessinés sur mesure, trait 1,75 px, extrémités arrondies.
 * Grille 24 × 24, extrémités carrées, angles vifs. Utilisés avec parcimonie.
 */
import type { SVGProps } from "react";

const paths = {
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  close: <path d="M6 6l12 12M18 6L6 18" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5 5" />
    </>
  ),
  arrow: <path d="M4 12h15M13 6l6 6-6 6" />,
  arrowUpRight: <path d="M7 17L17 7M9 7h8v8" />,
  arrowDown: <path d="M12 4v15M6 13l6 6 6-6" />,
  chevronDown: <path d="M6 9l6 6 6-6" />,
  chevronRight: <path d="M9 6l6 6-6 6" />,
  phone: <path d="M6.5 3.5h3l1.5 4-2 1.5a10 10 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16.5 16.5 0 0 1 4.5 5.5a2 2 0 0 1 2-2z" />,
  /* bon de commande : feuille + lignes + coin plié */
  order: (
    <>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M15 3v3h3M9 10h6M9 13.5h6M9 17h3.5" />
    </>
  ),
  download: <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />,
  doc: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 13h6M9 16.5h6" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </>
  ),
  trash: <path d="M5 7h14M10 7V4.5h4V7M7 7l1 13h8l1-13M10.5 11v5.5M13.5 11v5.5" />,
  grid: <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
  list: <path d="M4 6h16M4 12h16M4 18h16" />,
  repeat: <path d="M5 9h12l-3-3M19 15H7l3 3" />,
  star: <path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z" />,
  pin: (
    <>
      <path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
  mail: (
    <>
      <path d="M3.5 6h17v12h-17z" />
      <path d="M3.5 6.5l8.5 7 8.5-7" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  truck: (
    <>
      <path d="M3 6h11v10H3zM14 9.5h4l3 3.5v3h-7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </>
  ),
  lock: (
    <>
      <path d="M6 11h12v9H6z" />
      <path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
    </>
  ),
  edit: <path d="M5 19h3.5L19 8.5 15.5 5 5 15.5zM13.5 7l3.5 3.5" />,
  external: <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />,
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5M12 7.5v.5" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3.5l9.5 16.5h-19z" />
      <path d="M12 10v4.5M12 17v.5" />
    </>
  ),
  /* ─── Propriétés produit ─── */
  "contact-alimentaire": (
    <>
      <path d="M7 3.5v6a2 2 0 0 0 2 2v9M11 3.5v6a2 2 0 0 1-2 2M9 3.5v5" />
      <path d="M16.5 20.5v-17c-2 1-3 3.5-3 7h3" />
    </>
  ),
  "bio-vegetal": (
    <>
      <path d="M5 19c0-8 5-13.5 14-14.5-.5 9-6 14.5-14 14.5z" />
      <path d="M5 19l8-8" />
    </>
  ),
  biocide: (
    <>
      <path d="M9.5 3.5h5M10.5 3.5v5L5 19a1 1 0 0 0 .9 1.5h12.2A1 1 0 0 0 19 19l-5.5-10.5v-5" />
      <path d="M7.5 14.5h9" />
    </>
  ),
  "sans-chlore": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10.5 9.5a2.5 2.5 0 1 0 0 5M13.5 9v5.5h2.2M6 18L18 6" />
    </>
  ),
  "sans-solvant-chlore": (
    <>
      <path d="M12 3.5c3 4 5 6.8 5 9.5a5 5 0 0 1-10 0c0-2.7 2-5.5 5-9.5z" />
      <path d="M5 19L19 5" />
    </>
  ),
  pae: (
    <>
      <path d="M8 9h6v11.5H8zM9.5 9V6.5h5l2.5 1.5M14.5 6.5l3-1" />
      <path d="M19 9.5h1.5M19 7h1.5M19 12h1.5" />
    </>
  ),
  biocontrole: (
    <>
      <path d="M12 3.5l7 2.5v5.5c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6z" />
      <path d="M9 14c0-3.5 2-5.5 6-6-.2 4-2.3 6-6 6zM9 14l3-3" />
    </>
  ),
  /* ─── métiers (secteurs) ─── */
  "sec-mairies": (
    <>
      <path d="M3.5 20.5h17M5 20.5v-9M19 20.5v-9M3.5 11.5h17L12 5.5z" />
      <path d="M9 20.5v-5.5h6v5.5M12 5.5V3" />
      <path d="M12 3h2.5v1.5H12" />
    </>
  ),
  "sec-ecoles-universites": (
    <>
      <path d="M2.5 9L12 4.5 21.5 9 12 13.5z" />
      <path d="M6.5 11v4.5c1.5 1.5 3.5 2.5 5.5 2.5s4-1 5.5-2.5V11M21.5 9v5.5" />
    </>
  ),
  "sec-equipements-sportifs": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 8l3.3 2.4-1.3 3.9h-4l-1.3-3.9zM12 8V3.5M15.3 10.4l4.3-1.4M14 14.3l2.7 3.7M10 14.3l-2.7 3.7M8.7 10.4L4.4 9" />
    </>
  ),
  "sec-viticulture": (
    <>
      <circle cx="9.5" cy="11" r="2.2" />
      <circle cx="14.5" cy="11" r="2.2" />
      <circle cx="12" cy="15" r="2.2" />
      <circle cx="7" cy="15" r="2.2" />
      <circle cx="17" cy="15" r="2.2" />
      <circle cx="12" cy="19" r="2.2" />
      <path d="M12 8.8V5.5c0-1 1-2 2.5-2M12 5.5C10 3.5 7.5 4 6.5 5.5 8.5 6.5 10.5 6.5 12 5.5z" />
    </>
  ),
  "sec-agriculture": (
    <>
      <circle cx="7" cy="16.5" r="3.5" />
      <circle cx="18" cy="18" r="2" />
      <path d="M10.5 16.5H16M5 13V8h6l2 5h5.5l1 3.5M11 8V5h-2" />
    </>
  ),
  "sec-biotechnologie": (
    <>
      <path d="M9 3.5h6M10 3.5v6.5l-5 8.5A1.3 1.3 0 0 0 6.1 20.5h11.8a1.3 1.3 0 0 0 1.1-2L14 10V3.5" />
      <path d="M7.5 15h9" />
      <circle cx="10.5" cy="17.5" r=".8" />
      <circle cx="13.5" cy="16.8" r=".6" />
    </>
  ),
  "sec-automobile": (
    <>
      <path d="M3.5 16.5v-4l2-5a1.5 1.5 0 0 1 1.4-1h10.2a1.5 1.5 0 0 1 1.4 1l2 5v4z" />
      <path d="M3.5 12.5h17M5.5 16.5v2h2.5v-2M16 16.5v2h2.5v-2" />
      <circle cx="7.5" cy="14.5" r=".9" />
      <circle cx="16.5" cy="14.5" r=".9" />
    </>
  ),
  "sec-campings": (
    <>
      <path d="M2.5 20.5h19M12 4.5L3.5 20.5M12 4.5l8.5 16M12 4.5L10.5 2M12 4.5L13.5 2" />
      <path d="M12 12.5l-3 8h6z" />
    </>
  ),
  "sec-nautisme": (
    <>
      <path d="M12 3v13.5M12 4.5l6.5 10H12M12 6.5L7 14.5h5" />
      <path d="M3 17.5h18l-2.5 3h-13zM2.5 21.5c1.5 0 1.5-.8 3-.8s1.5.8 3 .8" />
    </>
  ),
} as const;

export type IconName = keyof typeof paths;

export function Icon({
  name,
  size = 20,
  title,
  ...rest
}: { name: IconName; size?: number; title?: string } & Omit<SVGProps<SVGSVGElement>, "name">) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {paths[name]}
    </svg>
  );
}
