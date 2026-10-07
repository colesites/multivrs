import { CurrencyCodeSchema } from "@vrs-pay/core";
import { z } from "zod";
import { HTTP_URL, MetadataSchema } from "./metadata.schema";

const MAX_SEATS = 10_000;

/** `POST /v1/checkout/sessions` with `mode: "subscription"`. */
export const SubscriptionCheckoutSchema = z.strictObject({
  mode: z.literal("subscription"),
  price: z.string().regex(/^price_[0-9A-Za-z]{24}$/, "Expected a price id (price_…)"),
  customer: z.string().regex(/^cus_[0-9A-Za-z]{24}$/, "Expected a customer id (cus_…)"),
  /** Seats, for org plans. */
  quantity: z.int().min(1).max(MAX_SEATS).default(1),
  /** One of the price's currencies; its own currency by default. */
  currency: CurrencyCodeSchema.optional(),
  success_url: HTTP_URL,
  cancel_url: HTTP_URL,
  metadata: MetadataSchema,
});

export type SubscriptionCheckoutInput = z.infer<typeof SubscriptionCheckoutSchema>;
