import { CurrencyCodeSchema } from "@vrs-pay/core";
import { z } from "zod";
import { HTTP_URL } from "./metadata.schema";

/**
 * `POST /v1/payment_links` — sells one of your products' prices (`price`,
 * plus `currency` to pick one of its currency options; recurring ones
 * start a subscription), or a quick fixed amount (`amount`, `currency`,
 * `description`).
 */
export const CreatePaymentLinkSchema = z
  .strictObject({
    price: z.string().min(1).optional(),
    amount: z.int().positive().max(Number.MAX_SAFE_INTEGER).optional(),
    currency: CurrencyCodeSchema.optional(),
    description: z.string().trim().min(1).max(250).optional(),
    after_payment_url: HTTP_URL.optional(),
  })
  .superRefine((input, ctx) => {
    const adHoc = [input.amount, input.currency, input.description];
    if (input.price && (input.amount !== undefined || input.description !== undefined)) {
      ctx.addIssue({
        code: "custom",
        message: "Send a price or an amount, not both",
        path: ["price"],
      });
    } else if (!input.price && adHoc.some((v) => v === undefined)) {
      ctx.addIssue({
        code: "custom",
        message: "Send a price, or an amount, currency and description",
        path: ["price"],
      });
    }
  });

export const UpdatePaymentLinkSchema = z.strictObject({ active: z.boolean() });

export type CreatePaymentLinkInput = z.infer<typeof CreatePaymentLinkSchema>;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || undefined);

/** `POST /l/session/:id/tax` body: where the buyer is. */
export const CheckoutTaxSchema = z.strictObject({
  address: z.strictObject({
    country: z
      .string()
      .regex(/^[A-Za-z]{2}$/, "Use a two-letter country code.")
      .transform((v) => v.toUpperCase()),
    postal_code: optionalText(20),
    state: optionalText(60),
    city: optionalText(100),
    line1: optionalText(200),
    line2: optionalText(200),
  }),
});

/** `POST /l/session/:id/start` body: the buyer's email, which Paystack needs first. */
export const CheckoutStartSchema = z.strictObject({ email: z.email().max(254) });
