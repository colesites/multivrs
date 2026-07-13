/**
 * Mock blog posts for the "Latest" section.
 *
 * The shape mirrors a future Sanity document so swapping this constant for a
 * GROQ query (`*[_type == "post"] | order(publishedAt desc)`) is a drop-in —
 * keep these fields in sync with the eventual schema.
 */

export type Post = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  /** ISO date string. */
  publishedAt: string;
  readingTime: number;
  /** Index into the generated cover-art variants (0-based). */
  cover: number;
};

export const POSTS: Post[] = [
  {
    title: "Shipping Swift Rust 2.0: a faster path from idea to edge",
    slug: "swift-rust-2",
    excerpt:
      "The new compiler pipeline cuts cold builds in half and streams routes to the edge as you type.",
    category: "Engineering",
    publishedAt: "2026-06-10",
    readingTime: 6,
    cover: 0,
  },
  {
    title: "Designing Kontinue AI: context that never resets",
    slug: "kontinue-context",
    excerpt:
      "How we model long-running agent memory so your work continues across sessions, devices, and tools.",
    category: "Product",
    publishedAt: "2026-05-28",
    readingTime: 8,
    cover: 1,
  },
  {
    title: "Zero-config domains, end to end",
    slug: "zero-config-domains",
    excerpt:
      "Register, verify, and serve a domain in under a minute — instant DNS and automatic SSL, no dashboards required.",
    category: "Platform",
    publishedAt: "2026-05-14",
    readingTime: 4,
    cover: 2,
  },
  {
    title: "Building Multivrs: one ecosystem, many products",
    slug: "building-multivrs",
    excerpt:
      "A look at the monorepo architecture and shared design language that keeps every Multivrs product feeling like one.",
    category: "Company",
    publishedAt: "2026-04-30",
    readingTime: 5,
    cover: 3,
  },
];
