import { DASHBOARD_NAV_ITEMS } from "./navigation";

/** One-line description shown under each section title. */
const SECTION_DESCRIPTIONS: Record<string, string> = {
  deployments: "Every build and promotion across this scope.",
  logs: "Real-time and historical runtime logs.",
  analytics: "Traffic, audiences and conversion insight.",
  "speed-insights": "Core Web Vitals from real visitors.",
  observability: "Traces, metrics and health across services.",
  firewall: "Traffic rules, rate limits and attack mitigation.",
  cdn: "Edge cache, regions and asset delivery.",
  "environment-variables": "Encrypted build and runtime configuration.",
  integrations: "OIDC and cloud identity integrations.",
  sandboxes: "Ephemeral isolated development environments.",
  domains: "Custom domains, DNS and certificates.",
  emails: "Transactional delivery, templates and logs.",
  settings: "Account, members, billing and developer settings.",
};

export interface SectionMeta {
  slug: string;
  title: string;
  description: string;
}

/** Resolve metadata for a section slug, or `null` if it isn't a known route. */
export function getSectionMeta(slug: string): SectionMeta | null {
  const item = DASHBOARD_NAV_ITEMS.find(
    (i) => i.slug === slug && i.slug !== "",
  );
  if (!item) return null;
  return {
    slug,
    title: item.name,
    description: SECTION_DESCRIPTIONS[slug] ?? "",
  };
}

/** Valid section slugs (excludes the empty scope-root slug). */
export const SECTION_SLUGS = DASHBOARD_NAV_ITEMS.flatMap((item) =>
  item.slug ? [item.slug] : [],
);
