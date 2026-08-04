import { z } from "zod";

const entitlementSchema = z.record(
  z.string(),
  z.number().int().nonnegative().nullable(),
);
const rateSchema = z.record(
  z.string(),
  z
    .number()
    .nonnegative()
    .refine(
      (value) => Number.isInteger(value * 1_000),
      "Overage rates support up to three decimal places of a cent",
    ),
);
const optionalCentsSchema = z.coerce.number().int().nonnegative().optional();

export type QuoteBillingTerms = {
  entitlementOverrides?: Record<string, number | null>;
  overageRateOverrides?: Record<string, number>;
  overagesEnabled?: boolean;
  spendAlertCents?: number;
  spendLimitCents?: number;
};

export function parseQuoteBillingTerms(
  metadata: Record<string, string>,
): QuoteBillingTerms {
  return {
    entitlementOverrides: parseJson(
      entitlementSchema,
      metadata.entitlement_overrides ?? metadata.entitlementOverrides,
    ),
    overageRateOverrides: parseJson(
      rateSchema,
      metadata.overage_rate_overrides ?? metadata.overageRateOverrides,
    ),
    overagesEnabled: parseBoolean(
      metadata.overages_enabled ?? metadata.overagesEnabled,
    ),
    spendAlertCents: parseCents(
      metadata.spend_alert_cents ?? metadata.spendAlertCents,
    ),
    spendLimitCents: parseCents(
      metadata.spend_limit_cents ?? metadata.spendLimitCents,
    ),
  };
}

function parseJson<T>(schema: z.ZodType<T>, value?: string): T | undefined {
  if (!value) return undefined;
  try {
    return schema.parse(JSON.parse(value));
  } catch {
    throw new Error("Stripe Quote contains invalid billing JSON metadata");
  }
}

function parseBoolean(value?: string): boolean | undefined {
  if (value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error("Stripe Quote overages_enabled must be true or false");
}

function parseCents(value?: string): number | undefined {
  if (value === undefined || value === "") return undefined;
  return optionalCentsSchema.parse(value);
}
