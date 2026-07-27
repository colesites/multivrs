import { z } from "zod";
import type { DomainSearchResult } from "@/features/domains/domain-marketplace";

export const domainSearchResultSchema = z.object({
  domain: z.string().min(1),
  available: z.boolean(),
  premium: z.boolean(),
  price: z.number().nullable(),
  renewalPrice: z.number().nullable().optional(),
  currency: z.string().min(3).max(3),
});

export const savedDomainsSchema = z.array(domainSearchResultSchema);

export function parseStoredCart(value: string | null): DomainSearchResult[] {
  const items = parseStoredValue(value, savedDomainsSchema);
  if (items) return items;
  const legacyItem = parseStoredValue(value, domainSearchResultSchema);
  return legacyItem ? [legacyItem] : [];
}

export function parseStoredDomains(value: string | null): DomainSearchResult[] {
  return parseStoredValue(value, savedDomainsSchema) ?? [];
}

function parseStoredValue<T>(
  value: string | null,
  schema: z.ZodType<T>,
): T | undefined {
  if (!value) return undefined;
  try {
    const parsed: unknown = JSON.parse(value);
    const result = schema.safeParse(parsed);
    return result.success ? result.data : undefined;
  } catch {
    return undefined;
  }
}

export function readDomainApiError(body: unknown): string {
  if (
    body &&
    typeof body === "object" &&
    "error" in body &&
    body.error &&
    typeof body.error === "object" &&
    "message" in body.error &&
    typeof body.error.message === "string"
  ) {
    return body.error.message;
  }
  return "Unable to update saved domains";
}
