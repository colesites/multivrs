export interface DomainSearchResult {
  domain: string;
  available: boolean;
  premium: boolean;
  price: number | null;
  renewalPrice?: number | null;
  currency: string;
}

// Product-led ordering for the default marketplace view. The complete provider
// catalog remains searchable through the TLD filter.
export const RELEVANT_DOMAIN_EXTENSIONS = [
  "com",
  "dev",
  "app",
  "io",
  "ai",
  "co",
  "org",
  "net",
  "me",
  "tech",
  "cloud",
  "site",
  "online",
  "store",
  "shop",
  "design",
  "studio",
  "space",
  "blog",
  "agency",
  "digital",
  "software",
  "solutions",
  "website",
  "live",
  "world",
  "social",
  "email",
  "games",
  "game",
  "finance",
  "media",
  "news",
  "pro",
  "info",
  "biz",
  "tv",
  "cc",
  "academy",
  "company",
  "network",
  "services",
  "systems",
  "tools",
  "team",
  "work",
  "jobs",
  "careers",
  "education",
  "school",
  "art",
  "photo",
  "photography",
  "travel",
  "events",
  "today",
  "life",
  "fun",
  "zone",
  "guru",
] as const;

export function relevantDomainExtensions(catalog: string[]): string[] {
  const available = new Set(catalog);
  return RELEVANT_DOMAIN_EXTENSIONS.filter((extension) =>
    available.has(extension),
  );
}

export function normalizeDomainQuery(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/^https?:\/\//, "")
      .split(".")[0]
      ?.replace(/[^a-z0-9-]/g, "")
      .replace(/^-+|-+$/g, "") ?? ""
  );
}
