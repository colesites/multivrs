import { CurrencyCodeSchema } from "@vrs-pay/core";
import { z } from "zod";

const MAX_FEATURES = 200;
const MAX_PLANS = 100;
const MAX_TRIAL_DAYS = 365;

export const CatalogKeySchema = z
  .string()
  .regex(
    /^[a-z][a-z0-9_]{0,63}$/,
    "Keys are lowercase letters, digits and _, starting with a letter",
  );

const FeatureTypeSchema = z.enum(["boolean", "limit"]);

const FeatureSchema = z
  .union([
    FeatureTypeSchema,
    z.strictObject({ type: FeatureTypeSchema, name: z.string().trim().min(1).max(100).optional() }),
  ])
  .transform((value) => (typeof value === "string" ? { type: value, name: undefined } : value));

const AmountsSchema = z
  .record(z.string(), z.int().min(0).max(Number.MAX_SAFE_INTEGER))
  .transform((amounts, ctx) => {
    const byCurrency: Partial<Record<z.infer<typeof CurrencyCodeSchema>, number>> = {};
    for (const [code, amount] of Object.entries(amounts)) {
      const currency = CurrencyCodeSchema.safeParse(code);
      if (!currency.success) {
        ctx.addIssue({ code: "custom", message: `Unsupported currency ${code}`, path: [code] });
        continue;
      }
      byCurrency[currency.data] = amount;
    }
    return byCurrency;
  });

const PlanSchema = z.strictObject({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional(),
  payer: z.enum(["user", "org"]).default("user"),
  trial_days: z.int().min(0).max(MAX_TRIAL_DAYS).default(0),
  features: z.record(CatalogKeySchema, z.union([z.boolean(), z.int().min(0)])).default({}),
  prices: z
    .strictObject({
      month: AmountsSchema.optional(),
      year: AmountsSchema.optional(),
      one_time: AmountsSchema.optional(),
    })
    .default({}),
});

/**
 * `POST /v1/billing/sync` — the whole catalog, usually from
 * `vrs-pay.config.ts`. Plans may only use declared features, with values
 * of the right type (true/false for boolean, a number for limit).
 */
export const BillingConfigSchema = z
  .strictObject({
    features: z.record(CatalogKeySchema, FeatureSchema).default({}),
    plans: z.record(CatalogKeySchema, PlanSchema).default({}),
  })
  .superRefine((config, ctx) => {
    if (Object.keys(config.features).length > MAX_FEATURES) {
      ctx.addIssue({
        code: "custom",
        message: `At most ${MAX_FEATURES} features`,
        path: ["features"],
      });
    }
    if (Object.keys(config.plans).length > MAX_PLANS) {
      ctx.addIssue({ code: "custom", message: `At most ${MAX_PLANS} plans`, path: ["plans"] });
    }
    for (const [planKey, plan] of Object.entries(config.plans)) {
      for (const [featureKey, value] of Object.entries(plan.features)) {
        const feature = config.features[featureKey];
        const path = ["plans", planKey, "features", featureKey];
        if (!feature) {
          ctx.addIssue({ code: "custom", message: `Unknown feature ${featureKey}`, path });
        } else if ((feature.type === "boolean") !== (typeof value === "boolean")) {
          ctx.addIssue({
            code: "custom",
            message: `${featureKey} is a ${feature.type} feature`,
            path,
          });
        }
      }
    }
  });

export type BillingConfig = z.infer<typeof BillingConfigSchema>;
