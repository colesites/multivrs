import { CurrencyCodeSchema } from "@vrs-pay/core";
import { z } from "zod";
import { HTTP_URL } from "./metadata.schema";

/** `POST /client/v1/checkout` — the signed-in customer buys or subscribes to a price. */
export const ClientCheckoutSchema = z.strictObject({
  price: z.string().regex(/^price_[0-9A-Za-z]{24}$/, "Expected a price id (price_…)"),
  currency: CurrencyCodeSchema.optional(),
  quantity: z.int().min(1).max(10_000).default(1),
  success_url: HTTP_URL,
  cancel_url: HTTP_URL,
});

/** `POST /client/v1/subscriptions/:id` — switch plan from the portal. */
export const ClientChangeSchema = z.strictObject({
  price: z.string().regex(/^price_[0-9A-Za-z]{24}$/, "Expected a price id (price_…)"),
});

export type ClientCheckoutInput = z.infer<typeof ClientCheckoutSchema>;
