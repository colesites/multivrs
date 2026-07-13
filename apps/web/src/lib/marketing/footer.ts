/**
 * Footer link configuration — twelve groups laid out as a 6-column × 2-row grid
 * (Vercel-style). Reuses the shared `NavColumn`/`NavLink` types so links keep a
 * consistent shape across the site.
 */

import type { NavColumn } from "@/components/nav/navigation";

/** First row: products, platform, and the developer stack. */
export const FOOTER_GROUPS_PRIMARY: NavColumn[] = [
  {
    heading: "Products",
    links: [
      {
        title: "Swift Rust",
        href: "https://swift-rust-self.vercel.app/",
        external: true,
      },
      {
        title: "Swift Rust UI",
        href: "https://ui-swift-rust.vercel.app/",
        external: true,
      },
      { title: "Kontinue AI", href: "https://kontinueai.com/", external: true },
      { title: "Domains", href: "/domains" },
      { title: "Email", href: "/email" },
    ],
  },
  {
    heading: "Core Platform",
    links: [
      { title: "CI/CD", href: "/ci-cd" },
      { title: "Content Delivery", href: "/cdn" },
      { title: "Fluid Compute", href: "/fluid" },
      { title: "Observability", href: "/observability" },
    ],
  },
  {
    heading: "Security",
    links: [
      { title: "Platform Security", href: "/security" },
      { title: "WAF", href: "/security" },
      { title: "Bot Management", href: "/security" },
    ],
  },
  {
    heading: "Tools",
    links: [
      { title: "Multivrs Agent", href: "/agent" },
      { title: "Multivrs Plugin", href: "/plugin" },
      { title: "Agent Skills", href: "/agent" },
      { title: "CLI", href: "/docs" },
    ],
  },
  {
    heading: "Frameworks",
    links: [
      { title: "Next.js", href: "https://nextjs.org", external: true },
      { title: "Nuxt", href: "https://nuxt.com", external: true },
      { title: "SvelteKit", href: "https://svelte.dev", external: true },
      { title: "Turborepo", href: "https://turborepo.com", external: true },
      { title: "All frameworks", href: "/docs" },
    ],
  },
  {
    heading: "SDKs",
    links: [
      { title: "AI SDK", href: "/docs" },
      { title: "Workflow SDK", href: "/docs" },
      { title: "Chat SDK", href: "/docs" },
      { title: "Queues SDK", href: "/docs" },
    ],
  },
];

/** Second row: build paths, learning, exploration, company, legal, social. */
export const FOOTER_GROUPS_SECONDARY: NavColumn[] = [
  {
    heading: "Build",
    links: [
      { title: "AI Apps", href: "/build/ai" },
      { title: "Web Apps", href: "/build/web" },
      { title: "Marketing Sites", href: "/build/marketing" },
      { title: "Platforms", href: "/build/platforms" },
      { title: "Commerce", href: "/build/commerce" },
    ],
  },
  {
    heading: "Learn",
    links: [
      { title: "Docs", href: "/docs" },
      { title: "Blog", href: "/blog" },
      { title: "Changelog", href: "/changelog" },
      { title: "Knowledge Base", href: "/help" },
      { title: "Community", href: "https://github.com/", external: true },
    ],
  },
  {
    heading: "Explore",
    links: [
      { title: "Customers", href: "/customers" },
      { title: "Marketplace", href: "/marketplace" },
      { title: "Templates", href: "/templates" },
      { title: "Startups", href: "/startups" },
      { title: "Shipped", href: "/shipped" },
    ],
  },
  {
    heading: "Company",
    links: [
      { title: "About", href: "/about" },
      { title: "Careers", href: "/careers" },
      { title: "Pricing", href: "/pricing" },
      { title: "Enterprise", href: "/enterprise" },
      { title: "Help", href: "/help" },
    ],
  },
  {
    heading: "Legal & Trust",
    links: [
      { title: "Privacy Policy", href: "/legal/privacy-policy" },
      { title: "Terms of Service", href: "/legal/terms" },
      { title: "Cookie Policy", href: "/legal/cookie-policy" },
      { title: "Trust Center", href: "/legal" },
      { title: "Status", href: "/status" },
    ],
  },
  {
    heading: "Social",
    links: [
      { title: "GitHub", href: "https://github.com/", external: true },
      { title: "X", href: "https://x.com/", external: true },
      { title: "LinkedIn", href: "https://www.linkedin.com/", external: true },
      { title: "YouTube", href: "https://www.youtube.com/", external: true },
      {
        title: "Instagram",
        href: "https://www.instagram.com/",
        external: true,
      },
    ],
  },
];
