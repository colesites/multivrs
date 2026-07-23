import { z } from "zod";
import type { DomainSearchResult } from "@/features/domains/domain-marketplace";
import { domainRetailPrice } from "@/lib/domains/pricing";

const moneySchema = z.object({ price: z.number(), currency: z.string() });
const resultSchema = z.object({
  domain: z.string(),
  status: z.string(),
  is_premium: z.union([z.boolean(), z.number()]).optional().default(false),
  price: z
    .object({
      product: moneySchema.optional(),
      reseller: moneySchema.optional(),
    })
    .optional(),
  premium: z
    .object({
      currency: z.string().optional(),
      price: z.object({ create: z.number().optional() }),
    })
    .optional(),
});
export const catalogSchema = z.object({
  data: z.object({
    total: z.number(),
    results: z.array(
      z.object({
        name: z.string(),
        status: z.string(),
        prices: z
          .object({
            create_price: z
              .object({
                product: moneySchema.optional(),
                reseller: moneySchema.optional(),
              })
              .optional(),
            renew_price: z
              .object({
                product: moneySchema.optional(),
                reseller: moneySchema.optional(),
              })
              .optional(),
          })
          .optional(),
      }),
    ),
  }),
});
const checkSchema = z.object({
  data: z.object({ results: z.array(resultSchema) }),
});

export type CatalogEntry = z.infer<
  typeof catalogSchema
>["data"]["results"][number];

export function parseDomainCheck(
  payload: unknown,
  catalog: CatalogEntry[],
): DomainSearchResult[] {
  return checkSchema.parse(payload).data.results.map((result) => {
    const extension = result.domain.slice(result.domain.indexOf(".") + 1);
    return toSearchResult(
      result,
      catalog.find((entry) => entry.name === extension),
    );
  });
}

function toSearchResult(
  result: z.infer<typeof resultSchema>,
  catalogEntry?: CatalogEntry,
): DomainSearchResult {
  const available = result.status === "free";
  const standard = result.price?.reseller ?? result.price?.product;
  const premiumCost = result.premium?.price.create;
  const cost = premiumCost ?? standard?.price ?? null;
  const currency = result.premium?.currency ?? standard?.currency ?? "USD";
  const extension = result.domain.slice(result.domain.indexOf(".") + 1);
  const registrationPrice =
    available && cost !== null
      ? domainRetailPrice(extension, "create", cost)
      : null;
  const renewal =
    catalogEntry?.prices?.renew_price?.reseller ??
    catalogEntry?.prices?.renew_price?.product;
  const catalogCreate =
    catalogEntry?.prices?.create_price?.reseller ??
    catalogEntry?.prices?.create_price?.product;
  const samePrice =
    renewal &&
    catalogCreate &&
    renewal.price === catalogCreate.price &&
    renewal.currency === catalogCreate.currency;
  return {
    domain: result.domain,
    available,
    premium: result.is_premium === true || result.is_premium === 1,
    price: registrationPrice,
    renewalPrice:
      available && renewal
        ? samePrice
          ? registrationPrice
          : domainRetailPrice(extension, "renew", renewal.price)
        : null,
    currency,
  };
}
