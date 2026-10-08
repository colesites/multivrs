// Generic webmail domains where domain name is personal email, not a company/brand
export const GENERIC_WEBMAIL_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.uk",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "protonmail.com",
  "proton.me",
  "mail.com",
  "zoho.com",
  "yandex.com",
]);

// Generic system/bot email prefixes
const GENERIC_LOCAL_PREFIXES = [
  "no-reply",
  "noreply",
  "notifications",
  "notification",
  "mailer-daemon",
  "info",
  "support",
  "team",
  "hello",
  "contact",
  "admin",
  "alerts",
  "alert",
  "billing",
  "updates",
  "help",
  "security",
  "newsletter",
];

const KNOWN_BRAND_NAMES: Record<string, string> = {
  claude: "Claude",
  anthropic: "Anthropic",
  openai: "OpenAI",
  google: "Google",
  github: "GitHub",
  x: "X",
  twitter: "X",
  stripe: "Stripe",
  slack: "Slack",
  vercel: "Vercel",
  multivrs: "Multivrs",
  apple: "Apple",
  microsoft: "Microsoft",
  amazon: "Amazon",
  linear: "Linear",
  notion: "Notion",
  figma: "Figma",
  resend: "Resend",
  postmark: "Postmark",
  postmarkapp: "Postmark",
  discord: "Discord",
  spotify: "Spotify",
  uber: "Uber",
  airbnb: "Airbnb",
};

/**
 * Extracts the company/brand name from an email domain.
 * Examples:
 *   "email.claude.com" -> "Claude"
 *   "claude.ai" -> "Claude"
 *   "x.com" -> "X"
 *   "accounts.google.com" -> "Google"
 */
export function getCompanyFromDomain(domain: string): string | null {
  if (!domain) return null;
  const clean = domain.toLowerCase().trim();
  if (GENERIC_WEBMAIL_DOMAINS.has(clean)) return null;

  const parts = clean.split(".");
  if (parts.length < 2) return null;

  // Handle multi-part TLDs (e.g. .co.uk, .com.br, etc.)
  const secondToLast = parts[parts.length - 2];
  const last = parts[parts.length - 1];
  let rootIndex = parts.length - 2;
  if (
    parts.length >= 3 &&
    ["co", "com", "gov", "org", "edu", "net"].includes(secondToLast || "") &&
    (last?.length ?? 0) <= 3
  ) {
    rootIndex = parts.length - 3;
  }

  const brandPart = parts[rootIndex];
  if (!brandPart) return null;

  if (KNOWN_BRAND_NAMES[brandPart]) {
    return KNOWN_BRAND_NAMES[brandPart];
  }

  return brandPart.charAt(0).toUpperCase() + brandPart.slice(1);
}

/**
 * Checks if a string or email prefix is a generic system/bot address (e.g. "no-reply", "info")
 */
export function isGenericSenderPrefix(str: string): boolean {
  const normalized = str.toLowerCase().replace(/[^a-z0-9]/g, "");
  for (const prefix of GENERIC_LOCAL_PREFIXES) {
    const cleanPrefix = prefix.replace(/[^a-z0-9]/g, "");
    if (normalized.startsWith(cleanPrefix) || normalized === cleanPrefix) {
      return true;
    }
  }
  return false;
}

/**
 * Resolves the friendly display name for a sender:
 * 1. If a valid human/brand name is provided, uses that (e.g. "Claude Team").
 * 2. If the name is missing or generic ("no-reply", "info"), extracts the company name from the domain (e.g. "Claude", "X").
 * 3. Falls back to the address.
 */
export function resolveSenderDisplayName(
  name?: string | null,
  address?: string | null,
): string {
  const trimmedName = name?.trim();
  const trimmedAddress = address?.trim() || "";

  // Check if name is already a good brand/display name (and not just "no-reply" or an email)
  const isNameGeneric = trimmedName
    ? isGenericSenderPrefix(trimmedName) || trimmedName.includes("@")
    : true;

  if (trimmedName && !isNameGeneric) {
    return trimmedName;
  }

  // If address has a domain, try to extract company name
  if (trimmedAddress.includes("@")) {
    const [, domain] = trimmedAddress.split("@");
    if (domain) {
      const company = getCompanyFromDomain(domain);
      if (company) {
        return company;
      }
    }
    const local = trimmedAddress.split("@")[0] || trimmedAddress;
    return trimmedName || local;
  }

  return trimmedName || trimmedAddress || "Unknown";
}

/**
 * Resolves the primary initial and color key for avatar generation.
 * If sender is "no-reply@email.claude.com", this resolves to initial "C" and colorKey "claude"
 * so that both the list and reader consistently show "C" with the exact same color.
 */
export function resolveSenderInitialAndKey(
  name?: string | null,
  address?: string | null,
): { initial: string; key: string } {
  const displayName = resolveSenderDisplayName(name, address);

  const cleaned = displayName.replace(/^[^a-zA-Z0-9]+/, "");
  const initial = (cleaned[0] || displayName[0] || "?").toUpperCase();

  let key = displayName.toLowerCase();
  if (address?.includes("@")) {
    const domain = address.split("@")[1]?.toLowerCase();
    const company = domain ? getCompanyFromDomain(domain) : null;
    if (company) {
      key = company.toLowerCase();
    } else if (address) {
      key = address.toLowerCase();
    }
  }

  return { initial, key };
}
