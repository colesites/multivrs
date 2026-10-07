import { CurrencyCodeSchema } from "@vrs-pay/core";
import { z } from "zod";

const MAX_PRICES = 10;
const Name = z.string().trim().min(1).max(100);
const Description = z.string().trim().max(500);

/** One price: an amount in minor units, charged once or every month or year. */
export const PriceDataSchema = z.strictObject({
  amount: z.int().positive().max(Number.MAX_SAFE_INTEGER),
  currency: CurrencyCodeSchema,
  interval: z.enum(["one_time", "month", "year"]).default("one_time"),
});

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
export const CreatePriceSchema = PriceDataSchema.extend({ product: z.string().min(1) });

/** `POST /v1/prices/:id` — archive or restore. */
export const UpdatePriceSchema = z.strictObject({ active: z.boolean() });

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateProductInput = z.infer<typeof UpdateProductSchema>;
export type CreatePriceInput = z.infer<typeof CreatePriceSchema>;
