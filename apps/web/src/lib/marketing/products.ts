/**
 * The Multivrs product ecosystem — source of truth for the home-page bento.
 *
 * `art` keys into the SVG set in `components/marketing/art`, and `className`
 * carries the bento grid spans (mobile stacks to full width via the base grid).
 */

export type ProductArtKey =
  | "swift-rust"
  | "swift-rust-ui"
  | "domains"
  | "email"
  | "kontinue";

export type Product = {
  name: string;
  /** Small uppercase eyebrow above the name. */
  tag: string;
  blurb: string;
  href: string;
  /** Off-site link — opens in a new tab and shows the ↗ glyph. */
  external?: boolean;
  art: ProductArtKey;
  /** Tailwind grid spans applied at `md` and up. */
  span: string;
};

export const PRODUCTS: Product[] = [
  {
    name: "Kontinue AI",
    tag: "AI Platform",
    blurb:
      "Your AI workspace for building, chatting, and shipping. Agents, code, and context that continue exactly where you left off.",
    href: "https://kontinueai.com/",
    external: true,
    art: "kontinue",
    span: "md:col-span-3 md:row-span-2",
  },
  {
    name: "Swift Rust",
    tag: "Framework",
    blurb:
      "A blazing-fast full-stack framework — Rust-grade performance with a developer experience that feels like magic.",
    href: "https://swift-rust-self.vercel.app/",
    external: true,
    art: "swift-rust",
    span: "md:col-span-3",
  },
  {
    name: "Swift Rust UI",
    tag: "Components",
    blurb:
      "A headless, accessible component library. Compose beautiful interfaces without ever fighting your styles.",
    href: "https://ui-swift-rust.vercel.app/",
    external: true,
    art: "swift-rust-ui",
    span: "md:col-span-3",
  },
  {
    name: "Domains",
    tag: "Infrastructure",
    blurb:
      "Search, register, and manage domains. Instant DNS, automatic SSL, zero config.",
    href: "/domains",
    art: "domains",
    span: "md:col-span-2",
  },
  {
    name: "Email",
    tag: "Infrastructure",
    blurb:
      "Programmable forwarding and sending — catch-all addresses, routing rules, and deliverability you can trust.",
    href: "/emails",
    art: "email",
    span: "md:col-span-4",
  },
];
