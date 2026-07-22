/**
 * Single source of truth for the marketing navigation.
 *
 * A plain TS constants module is the idiomatic Next.js way to colocate static
 * config — both the desktop mega-menu and the mobile menu consume this, so the
 * links only ever live in one place.
 */

export type NavLink = {
  title: string;
  href: string;
  /** Opens in a new tab and shows the ↗ glyph (links off this site). */
  external?: boolean;
};

export type NavColumn = {
  heading: string;
  links: NavLink[];
};

/** Top-level "Products" mega-menu, laid out as columns (left → right). */
export const PRODUCT_COLUMNS: NavColumn[] = [
  {
    // Sibling platforms from the parent company — each is its own product.
    heading: "Ecosystem",
    links: [
      { title: "Kontinue AI", href: "https://kontinueai.com", external: true },
      {
        title: "Kode",
        href: "https://chat.kontinueai.com/kode",
        external: true,
      },
      {
        title: "Present",
        href: "https://present.multivrs.space/",
        external: true,
      },
      {
        title: "VrsPay",
        href: "https://vrs-pay.multivrs.space/",
        external: true,
      },
    ],
  },
  {
    // First-party products that live on this site.
    heading: "Core Platform",
    links: [
      { title: "Security", href: "/security" },
      { title: "CDN", href: "/cdn" },
      { title: "Fluid Compute", href: "/fluid" },
      { title: "Observability", href: "/observability" },
      { title: "CI/CD", href: "/ci-cd" },
    ],
  },
  {
    // Frameworks, libraries, and standalone tools.
    heading: "Tools",
    links: [
      {
        title: "Swift Rust",
        href: "https://swift-rust.multivrs.space/",
        external: true,
      },
      {
        title: "Swift Rust UI",
        href: "https://ui.multivrs.space/",
        external: true,
      },
      {
        title: "Auth",
        href: "https://auth.multivrs.space/",
        external: true,
      },
      { title: "Multivrs Agent", href: "/agent" },
      { title: "Multivrs Plugin", href: "/plugin" },
      { title: "Domains", href: "/domains" },
      { title: "Emails", href: "/emails" },
    ],
  },
];

/** Top-level "Resources" mega-menu. */
export const RESOURCE_COLUMNS: NavColumn[] = [
  {
    heading: "Learn",
    links: [
      { title: "Docs", href: "/docs" },
      { title: "Blog", href: "/blog" },
      { title: "Changelog", href: "/changelog" },
      { title: "About", href: "/about" },
      { title: "Help Center", href: "/help" },
    ],
  },
  {
    heading: "Build",
    // TODO: confirm these routes — placeholders modeled on Vercel's "Build".
    links: [
      { title: "AI Apps", href: "/build/ai" },
      { title: "Web Apps", href: "/build/web" },
      { title: "Marketing Sites", href: "/build/marketing" },
      { title: "Platforms", href: "/build/platforms" },
    ],
  },
  {
    heading: "Explore",
    // TODO: confirm these routes — placeholders modeled on Vercel's "Explore".
    links: [
      { title: "Customers", href: "/customers" },
      { title: "Startups", href: "/startups" },
      { title: "Shipped", href: "/shipped" },
      { title: "Community", href: "https://github.com/", external: true },
    ],
  },
];

/** Menus that expand into a column panel, keyed by their trigger label. */
export const MEGA_MENUS = [
  { label: "Products", columns: PRODUCT_COLUMNS },
  { label: "Resources", columns: RESOURCE_COLUMNS },
] as const;

export type MegaMenuLabel = (typeof MEGA_MENUS)[number]["label"];

/** Plain top-level links (no panel). */
export const NAV_LINKS = [{ label: "Pricing", href: "/pricing" }] as const;
