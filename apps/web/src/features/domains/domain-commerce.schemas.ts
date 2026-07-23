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

export function parseStoredDomain(
  value: string | null,
): DomainSearchResult | null {
  return parseStoredValue(value, domainSearchResultSchema) ?? null;
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
