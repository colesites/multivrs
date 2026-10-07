import { CurrencyCodeSchema } from "@vrs-pay/core";
import { z } from "zod";
import { MAX_INTERVAL_COUNT } from "../services/billing-period";

const MAX_PRICES = 10;
const Name = z.string().trim().min(1).max(100);
const Description = z.string().trim().max(500);

const PriceFields = z.strictObject({
  amount: z.int().positive().max(Number.MAX_SAFE_INTEGER),
  currency: CurrencyCodeSchema,
  interval: z.enum(["one_time", "day", "week", "month", "year"]).default("one_time"),
  /** Intervals per charge: `month` with 3 charges every 3 months. */
  interval_count: z.int().min(1).default(1),
});

/** Up to three years per period, like Stripe; one-time prices have no period. */
function checkPeriod(
  price: { interval: z.infer<typeof PriceFields>["interval"]; interval_count: number },
  ctx: z.RefinementCtx,
) {
  const path = ["interval_count"];
  if (price.interval === "one_time") {
    if (price.interval_count !== 1) {
      ctx.addIssue({ code: "custom", message: "One-time prices have no period", path });
    }
  } else if (price.interval_count > MAX_INTERVAL_COUNT[price.interval]) {
    const max = MAX_INTERVAL_COUNT[price.interval];
    ctx.addIssue({ code: "custom", message: `At most ${max} ${price.interval}s per period`, path });
  }
}

/** One price: an amount in minor units, charged once or every N days, weeks, months or years. */
export const PriceDataSchema = PriceFields.superRefine(checkPeriod);

/** `POST /v1/products` — what you sell, with at least one price. */
export const CreateProductSchema = z.strictObject({
  name: Name,
  description: Description.optional(),
  prices: z.array(PriceDataSchema).min(1).max(MAX_PRICES),
});

/** `POST /v1/products/:id` — `active: false` archives it. */
export const UpdateProductSchema = z
  .strictObject({
    name: Name.optional(),
    description: Description.nullable().optional(),
    active: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, "Send at least one field to change");

/** `POST /v1/prices` — prices never change, so a new amount is a new price. */
export const CreatePriceSchema = PriceFields.extend({ product: z.string().min(1) }).superRefine(
  checkPeriod,
);

/** `POST /v1/prices/:id` — archive or restore. */
export const UpdatePriceSchema = z.strictObject({ active: z.boolean() });

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type CreatePriceInput = z.infer<typeof CreatePriceSchema>;
